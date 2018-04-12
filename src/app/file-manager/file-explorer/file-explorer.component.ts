import { Component, OnInit, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { Item } from '../models/item';

import { FilterSizePipe } from '../filters/filesize-filter';
import { FileDownloadModalComponent } from '../file-download-modal/file-download-modal.component';
import { MatDialog, MatPaginator, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { StatusService } from '../services/status.service';
import { BucketService } from '../services/bucket.service';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { List } from 'lodash';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectionService } from '@app/file-manager/services/selection.service';
import { FileExportModalComponent } from '@app/file-manager/file-export-modal/file-export-modal.component';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { FilesDatabase } from '@app/file-manager/dbstate/files-database';
import { Type } from '@app/file-manager/models/type';
import { AppState } from '@app/file-manager/reducers';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  providers: [
    {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check-indeterminate'}
  ]
})
export class FileExplorerComponent implements OnInit, AfterViewInit {

  isHome: Boolean = false;
  displayedColumns = ['select', 'displayName', 'size', 'updated'];

  dataSource = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  breadcrumbItems: Item[];
  headerItem: Item;
  rootItem: Item;
  downloadInProgress = false;
  exportInProgress = false;
  progressStatus = false;

  constructor(private statusService: StatusService,
              private zone: NgZone,
              private firecloudService: FirecloudApiService,
              private dialog: MatDialog,
              private filterSize: FilterSizePipe,
              private bucketService: BucketService,
              private spinner: NgxSpinnerService,
              private selectionService: SelectionService,
              public router: Router,
              private transferablesGridComponent: TransferablesGridComponent,
              private store: Store<AppState>) {
    this.breadcrumbItems = [];

  }

  ngOnInit() {
    this.rootItem = new Item(
      'workspaces', 'workspaces', null, null, 0, '', '', '',
      'Folder', '', '', '', '', true, false, '', '', '', false, 0, 0);

/* TODO 
    this.rootItem = new Item('workspaces', 'workspaces', null, null, 0, '', '',
      '', 'Folder', '', '', '', '', true, false, '', '', '', 0, 0);
*/
    this.getWorkspacesObjects(this.rootItem);

    // this.statusService.updateDownloadProgress()
    //   .subscribe(data => {
    //     this.zone.run(() => {
    //       this.downloadInProgress = this.router.routerState.snapshot.url === '/file-download' && data !== 100;
    //       this.progressStatus = this.downloadInProgress;
    //     });
    //   });
    
    // this.statusService.updateExportS3Progress().subscribe(data => {
    //   this.zone.run(() => {
    //     this.exportInProgress = data !== 100;
    //     this.progressStatus = this.exportInProgress;
    //   });
    // });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: Item, filter: string) =>
      data.name.toLowerCase().indexOf(filter) !== -1 || data.namespace.toLowerCase().indexOf(filter) !== -1;
  }

  /*
  * Find all workspaces / buckets from FireCloud
  * Response is an Array of buckets formatted as Item
  */
  public getWorkspacesObjects(node) {
    this.spinner.show();
    this.isHome = true;
    this.breadcrumbItems = [];
    this.paginator.pageIndex = 0;
    let data = [];

    this.headerItem = node;

    this.firecloudService.getUserFirecloudWorkspaces(this.headerItem, false)
      .subscribe(
        workspaces => {
          data = workspaces;
        },
        error => {
          console.log('firecloudService error ....', error);
        },
        () => {
          this.headerItem.children = data;
          this.dataSource.data = this.headerItem.children;
          this.spinner.hide();
        });
  }

  /*
  * find bucket objects starting with a prefix
  * Response is an Array of bucket objects formatted as Item
  */
  private getBucketObjects(node: Item) {
    this.spinner.show();
    this.paginator.pageIndex = 0;
    let data = [];

    this.headerItem = node;

    this.bucketService.getBucketData(node, null, true, true)
      .subscribe(
        elements => {
          data = elements;
        },
        error => {
          console.log(JSON.stringify(error, null, 2));
        },
        () => {
          this.headerItem.children = data;
          this.dataSource.data = this.headerItem.children;
          this.spinner.hide();
        });
  }

  /*
  * Handler when clicking on breadcrumb home (worspaces)
  */
  goHome(event) {
    this.breadcrumbItems = [];
    this.getWorkspacesObjects(this.rootItem);
  }

  /*
  * Handler when clicking on breadcrumb segment, to change folder ...
  */
  pathChanged(event) {
    this.breadcrumbItems = this.breadcrumbItems.slice(0, event.index);
    this.clickOnRow(event.item);
  }

  /*
  * Handler when clicking on a table row, to change folder ...
  */
  clickOnRow(elem) {
    if (elem.type === 'Folder') {
      this.breadcrumbItems = [...this.breadcrumbItems, elem];
      this.getBucketObjects(elem);
    }
  }

  /*
  * handle selection through row's checkbox click
  */
  private selectByRow(event, row: Item) {
    event.checked ? this.selectionService.selectRow(row) : this.selectionService.deselectRow(row);
    this.updateHeaderItems();
  }

  /*
  * handle selection through header's checkbox click
  */
  private selectByHeader(event) {
    event.checked ? this.selectTableRows() : this.deselectTableRows();
    this.updateHeaderItems();
  }

  private selectTableRows() {
    this.toggleAllRows(true);
  }

  private deselectTableRows() {
    this.toggleAllRows(false);
  }

  toggleAllRows(selected: boolean) {
    // change selection state of all table' rows.
    this.zone.run(() => {
      this.spinner.show();
    });
    this.headerItem.children
      .forEach(
        row => {
          if (selected) {
            this.selectionService.selectRow(row);
          } else {
            this.selectionService.deselectRow(row);
          }
        }
      );
    this.zone.run(() => {
      this.spinner.hide();
    });
  }

  // filtering method
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  updateHeaderItems() {
    const n = this.breadcrumbItems.length - 1;

    for (let i = n; i >= 0; i--) {

      const parent = this.breadcrumbItems[i];

      let someIndeterminate = false;
      let allSelected = true;
      let someSelected = false;

      parent.children.forEach(child => {

        if (child.indeterminate) {
          someIndeterminate = true;
        }

        if (child.selected) {
          someSelected = true;
        } else {
          allSelected = false;
        }
      });

      parent.selected = someSelected;
      parent.indeterminate = someIndeterminate || (someSelected && !allSelected);

      const found = this.selectionService.findSelected(parent);
      if (found !== undefined) {
        this.selectionService.rawDeselect(found);
      }

      if (parent.selected) {
        this.selectionService.rawSelect(parent);
      } else {
        this.selectionService.rawDeselect(parent);
      }
    }
    this.updateRootItem();
  }

  updateRootItem() {
    const parent = this.rootItem;

    let someIndeterminate = false;
    let allSelected = true;
    let someSelected = false;

    parent.children.forEach(child => {

      if (child.indeterminate) {
        someIndeterminate = true;
      }

      if (child.selected) {
        someSelected = true;
      } else {
        allSelected = false;
      }
    });

    parent.selected = someSelected;
    parent.indeterminate = someIndeterminate || (someSelected && !allSelected);

    const found = this.selectionService.findSelected(parent);
    if (found !== undefined) {
      this.selectionService.rawDeselect(found);
    }

    if (parent.selected) {
      this.selectionService.rawSelect(parent);
    } else {
      this.selectionService.rawDeselect(parent);
    }
  }

  selectionDone() {

    const items = {
      selectedFiles: this.selectionService.selectedItems(),
      totalSize: 0
    };

    this.dialog.open(FileDownloadModalComponent, {
      width: '500px',
      disableClose: true,
      data: items
    });
  }

  disableButton() {
    return (this.downloadInProgress || this.exportInProgress || this.selectionService.nothingSelected());
  }

  cleanSelection(): void {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '550px',
      disableClose: true,
      data: 'clearSelection'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.exit) {

        this.rootItem.selected = false;
        this.rootItem.indeterminate = false;

        this.breadcrumbItems.forEach(item => {
          item.selected = false;
          item.indeterminate = false;
          item.children.forEach(child => {
            child.selected = false;
            child.indeterminate = false;
          });
        });

        this.headerItem.children.forEach(item => {
          item.selected = false;
          item.indeterminate = false;
        });
        this.headerItem.selected = false;
        this.headerItem.indeterminate = false;
        this.selectionService.clearSelection();
      }
    });
  }

  exportSelectionDone() {
    const items = { selectedFiles: this.selectionService.selectedItems() };
    const dialogRef = this.dialog.open(FileExportModalComponent, {
      width: '500px',
      disableClose: true,
      data: items
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.cancel !== undefined) {
          const itemsToRemove = new FilesDatabase(this.store).data()
            .filter(item => (item.type === Type.EXPORT_GCP || item.type === Type.EXPORT_S3) && item.status === ItemStatus.PENDING);
          itemsToRemove.forEach(item => {
            this.store.dispatch(new Transferables.RemoveItem(item));
          });
        } else {
          //this.transferablesGridComponent.startExport(result.preserveStructure, result.type);
        }
      }
    });
  }
}

