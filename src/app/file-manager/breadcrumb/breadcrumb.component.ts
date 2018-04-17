import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item } from '@app/file-manager/models/item';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  private _items: Item[];

  @Input('items') set setItems(items: Item[]) {
    this._items = items;
    this.processItems(this._items);
  }

  crumbs: any[] = [];

  readonly DELIMITER = '/';

  @Output('home') home: EventEmitter<any> = new EventEmitter();
  @Output('change') change: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  crumbClicked(evt, index) {
    this.change.emit(
      {
        index: index,
        item: this._items[index]
      }
    );
  }

  homeClicked(evt) {
    this.home.emit('home');
  }

  private processItems(items: Item[]) {
    this.crumbs = [];

    if (items === null || items === undefined || items.length <= 0) {
      return;
    }

    items.forEach(
      item => {
        const paths = item.prefix.split(this.DELIMITER);

        /**
         * if path === workspace+DELIMITER (Workspace1/, f.i.)
         * label is item.name
         * otherwise label is the n-1 part of path => slice(-2, -1)
         */
        let label = item.path === (item.workspaceName + this.DELIMITER)
          ? item.name
          : paths.slice(-2, -1)[0];

        // if namespace, add namespace + pipe as label prefix
        if (item.namespace !== '') {
          label = item.namespace + ' | ' + label;
        }

        /**
         *  construct crumb:
         * label is what is shown as a individual "crumb"
         * item is the object to be used to recover details when clicked on
         * corresponding crumb. You may think it is the "parent" item of items
         * shown in table
         */
        const crumb = {
          label: label,
          item: item
        };
        this.crumbs.push(crumb);
      });
  }
}
