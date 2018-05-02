import { Injectable } from '@angular/core';
import { GcsService } from './gcs.service';
import { Item } from '@app/file-manager/models/item';
import { Observable } from 'rxjs/Observable';
import { SelectionService } from '@app/file-manager/services/selection.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BucketService {

  elements: Item[];
  public isResponseComplete;
  fileSize = 0;
  fileCount = 0;
  public getFilesSize = new Subject();
  public getFilesCount = new Subject();

  constructor(private gcsService: GcsService,
    private selectionService: SelectionService) {

  }
  readonly DELIMITER = '/';

  public getBucketData(parentNode: Item, token: string, useDelimiter: boolean, processData: boolean): Observable<Item[]> {
    this.fileSize = 0;
    this.fileCount = 0;
    this.isResponseComplete = false;
    return this.getBucketFiles(parentNode, token, useDelimiter, processData);
  }

  getBucketFiles(parentNode: Item, token: string, useDelimiter: boolean, processData: boolean): Observable<Item[]> {
    const indeterminate = parentNode.indeterminate;
    const selected = parentNode.selected;

    this.elements = [];
    const bucketName = parentNode.bucketName;
    const prefix = parentNode.prefix;
    return this.gcsService.getBucketFilesWithMaxResult(bucketName, prefix, token, useDelimiter)
      .expand(
        obj => {
          if (obj.nextPageToken) {
            return this.gcsService.getBucketFilesWithMaxResult(bucketName, prefix, obj.nextPageToken, useDelimiter);
          } else {
            this.isResponseComplete = true;
            return Observable.empty();
          }
        })
      .map(
        obj => this.processBucketData(obj, parentNode, processData)
      );
  }

  private processBucketData(resp, parentNode: Item, processData: boolean): Item[] {
    const bucketName = parentNode.bucketName;
    const workspaceName = parentNode.workspaceName;

    if (resp.prefixes !== undefined) {
      resp.prefixes.forEach(prefix => {
        const newPrefix = this.createPrefixItem(parentNode, prefix);
        if (processData) {
          this.processSelection(parentNode, newPrefix);
        }
        this.elements.push(newPrefix);
      });
    }

    if (resp.items !== undefined) {
      resp.items.forEach(item => {

        if (item.size === '0' && item.name.endsWith('/')) {
          return;
        }

        const path = workspaceName + this.DELIMITER + item.name;
        const name = item.name.split(this.DELIMITER)[item.name.split(this.DELIMITER).length - 1];

        const newItem = new Item(
          item.id, // id
          item.name, // name
          item.created, // created
          item.updated, // updated
          item.size, // size
          item.mediaLink, // mediaLink
          path, // path
          '', // destination
          'File', // type
          '', // status
          bucketName, // bucketName
          parentNode.prefix, // prefix
          parentNode.delimiter, // delimiter
          true, // preserveStructure
          false, // open
          workspaceName, // workspaceName
          item.name.split(this.DELIMITER).slice(-1)[0], // displayName
          '',
          false,
          0,
          0
        );
        this.getFilesCount.next(++this.fileCount);
        this.fileSize = Number(this.fileSize) + Number(newItem.size);
        this.getFilesSize.next(this.fileSize);
          if (processData) {
          this.processSelection(parentNode, newItem);
        }
        this.elements.push(newItem);
      });
    }
    parentNode.children = this.elements.slice(0);
    return this.elements;
  }

  processSelection(parentRow: Item, row: Item) {
    if (parentRow.indeterminate === true) {
      // it is selected ?
      const ix = this.selectionService.findSelectionIndex(row);
      if (ix >= 0) {
        const found = this.selectionService.selectedItemByIndex(ix);
        // if so, update incomming item with existing selection state
        row.selected = found.selected;
        row.indeterminate = found.indeterminate;
      }
    } else {
      if (parentRow.selected === true) {
        row.selected = true;
        row.indeterminate = false;
        this.selectionService.selectRow(row);
      } else if (parentRow.selected === false) {
        row.selected = false;
        row.indeterminate = false;
        this.selectionService.deselectRow(row);
      }
    }
  }

  public createPrefixItem(parentNode: Item, prefix: string): Item {
    const bucketName = parentNode.bucketName;
    const workspaceName = parentNode.workspaceName;
    const name = this.getName(prefix);
    const id = bucketName + name;
    const path = workspaceName + this.DELIMITER + prefix;

    const newItem: Item =
      new Item(
        id,
        prefix,
        null, // created
        null, // updated
        NaN, // size
        '', // mediaLink
        path, // path
        '', // destination
        'Folder', // type
        '', // status
        bucketName, // bucketName
        prefix, // prefix
        parentNode.delimiter, // delimiter
        true, // preserveStructure
        false, // open
        workspaceName, // workspaceName
        prefix.split(this.DELIMITER).slice(-2, -1)[0],
        '',
        false,
        0,
        0
      );

    return newItem;
  }

  private getName(prefix: string): string {
    const prefixSegments = prefix.split(this.DELIMITER);
    const name = prefixSegments[prefixSegments.length - 2];
    return name;
  }

  public getIsResponseComplete() {
    return this.isResponseComplete;
  }
}
