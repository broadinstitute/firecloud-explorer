import { Injectable } from '@angular/core';
import { Item } from '@app/file-manager/models/item';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable()
export class SelectionService {

    selection = new SelectionModel<Item>(true, []);

    constructor() {

    }

    rawSelect(item: Item) {
        const found = this.findSelected(item);
        if (found !== undefined) {
            this.selection.deselect(found);
        }
        this.selection.select(item);
    }

    rawDeselect(item: Item) {
        const found = this.findSelected(item);
        if (found !== undefined) {
            this.selection.deselect(found);
        }
    }

    selectedItems(): Item[] {
        return this.selection.selected;
    }

    nothingSelected(): boolean {
        return this.selection.selected.length === 1
            && this.selection.selected[0].id === 'workspaces'
            || this.selection.selected.length <= 0 ? true : false;
    }

    findSelected(elem): Item {
        return this.selection.selected.find(item => item.id === elem.id);
    }

    isSelected(node: Item): boolean {
        return this.findSelected(node) !== undefined;
    }

    findSelectionIndex(item: Item): number {
        const ix = this.selection.selected.findIndex(selected => selected.id === item.id);
        return ix;
    }

    selectedItemByIndex(index: number): Item {
        return this.selection.selected[index];
    }

    findSelectedChildsByPath(row: Item): Item[] {
        return this.selection.selected.filter(item => this.isParent(row, item));
    }

    findDescendantsByPath(row: Item): Item[] {

        let childs: Item[] = [];

        if (row.type === 'File') {
            return childs;
        }

        childs = this.selection.selected
            .filter(
            item => {
                return item.path.startsWith(row.path);
            });

        return childs;
    }

    findSelectedParenstByPath(row: Item): Item[] {
        return this.selection.selected.filter(item => this.isParent(row, item));
    }

    findSelectedByBucket(bucketRow: Item): Item[] {
        return this.selection.selected.filter(row => row.bucketName === bucketRow.bucketName);
    }

    isParent(parent: Item, child: Item): boolean {

        if (parent.type === 'File') {
            return false;
        }

        if (child === undefined) {
            return false;
        }

        const splitParent = parent.path;
        const splitChild = child.type === 'File'
            ? child.path.split('/').slice(0, -1).join('/')
            : child.path.split('/').slice(0, -1).join('/') + '/'
            ;

        const resp = (splitParent === splitChild);
        return resp;
    }

    selectRow(item: Item): void {
        // verify if is already selected and remove
        const found = this.findSelected(item);
        if (found !== undefined) {
            this.selection.deselect(found);
        }

        // remove all selected descendants
        this.findDescendantsByPath(item).forEach(child => this.selection.deselect(child));
        item.selected = true;
        item.indeterminate = false;
        this.selection.select(item);
    }

    selectDescendants(item: Item) {
        this.findDescendantsByPath(item).forEach(child => this.selection.select(child));
    }

    deselectDescendants(item: Item) {
        this.findDescendantsByPath(item).forEach(child => this.selection.deselect(child));
    }

    deselectRow(item: Item): void {
        // verify if is already selected and remove
        const found = this.findSelected(item);
        if (found !== undefined) {
            this.selection.deselect(found);
        }

        // remove all selected descendants
        this.findDescendantsByPath(item).forEach(child => this.selection.deselect(child));
        item.selected = false;
        item.indeterminate = false;
    }

    clearSelection() {
        this.selection.clear();
    }
}
