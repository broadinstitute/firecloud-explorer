import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Item } from '../models/item';
import { BucketObjectsDB } from '../models/bucket-object-db';
import { FilterSizePipe } from '../filters/filesize-filter';
import { FileDownloadModalComponent } from '../file-download-modal/file-download-modal.component';
import { MatDialog, MatPaginator } from '@angular/material';
import { StatusService } from '../services/status.service';
import { BucketService } from '../services/bucket.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';
import { FilesDataSource } from '@app/file-manager/dbstate/files-datasource';
import { FilesService } from '@app/file-manager/services/files.service';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {
  isHome: Boolean = false;
  bucketObjects = new BucketObjectsDB();
  breadcrumbPath = '';
  displayedColumns = ['select', 'name', 'size', 'lastdate'];
  dataSource: FilesDataSource | null;
  selection = new SelectionModel<Item>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  downloadInProgress = false;
  fileCount = 0;
  totalSize = 0;
  data = null;
  readonly DELIMITER = '/';

  constructor(
    private statusService: StatusService,
    private zone: NgZone,
    private filesService: FilesService,
    private firecloudService: FirecloudApiService,
    private dialog: MatDialog,
    private filterSize: FilterSizePipe,
    private bucketService: BucketService) {

  }

  ngOnInit() {
    this.dataSource = new FilesDataSource(this.bucketObjects, this.paginator);
    this.goRoot();
    this.statusService.updateDownloadProgress().subscribe(data => {
      this.zone.run(() => {
        if (data === 100) {
          this.downloadInProgress = false;
        } else {
          this.downloadInProgress = true;
        }
      });
    });
  }

  countFiles() {
    this.fileCount = 0;
    this.totalSize = 0;
    this.selection.selected.forEach(f => {
      if (f.type === 'File') {
        this.fileCount++;
        this.totalSize += Number(f.size);
      }
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.bucketObjects.data.length;
    let isAllSelected: Boolean = true;
    let iterate = true;
    if (numSelected < numRows || numRows === 0) {
      isAllSelected = false;
    } else {
      let i = 0;
      do {
        const file = this.bucketObjects.data[i];
        if (this.selection.selected.find(selected => selected.id === file.id) === undefined) {
          isAllSelected = false;
        }
        i++;
        if (isAllSelected === false) {
          iterate = false;
        } else if (i <= this.bucketObjects.data.length) {
          iterate = false;
        }
      } while (iterate);
    }
    return isAllSelected;
  }

  isChecked(row) {
    return this.selection.selected.find(selected => selected.id === row.id) !== undefined;
  }

  clearSelection() {
    this.bucketObjects.data.forEach(data => {
      const row = this.selection.selected.find(selected => selected.id === data.id);
      if (row !== undefined) {
        this.selection.deselect(row);
      }
    });
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.clearSelection() :
      this.bucketObjects.data.forEach(row => {
        if (row.type === 'File') {
          this.selection.select(row);
        }
      });
    this.countFiles();
  }

  public goRoot() {
    if (!this.isHome) {
      this.isHome = true;
      this.paginator.pageIndex = 0;
      this.breadcrumbPath = '';
      this.bucketObjects.data = [];
      this.firecloudService.getUserFirecloudWorkspaces(false).subscribe(workspaces => {
        this.bucketObjects.data = workspaces;
      });
    }
  }

  clickOnRow(elem) {
    this.isHome = false;
    if (elem.type === 'Folder') {
      this.paginator.pageIndex = 0;
      this.bucketObjects.data = [];
      BucketService.delimiter = elem.delimiter;
      const workspaceName = this.getWorkspaceName(elem.bucketName);
      this.getBucketObjects(elem.bucketName, BucketService.delimiter, workspaceName);
      this.breadcrumbPath = elem.prefix;
    }
  }

  pathChanged(event) {
    this.isHome = false;
    this.paginator.pageIndex = 0;
    let delimiter = event.label !== event.path ? this.getDelimiter(event.label) : this.DELIMITER;
    const workspace = this.breadcrumbPath.substr(0, this.breadcrumbPath.indexOf(this.DELIMITER));
    const bucket = FirecloudApiService.workspaces.get(workspace);
    delimiter = delimiter.substring(delimiter.length - 1, delimiter.length) === this.DELIMITER
      ? delimiter.substr(0, delimiter.lastIndexOf(this.DELIMITER)) : delimiter;
    const path = this.breadcrumbPath.endsWith('/') && delimiter !== '' ? workspace + this.DELIMITER + delimiter + this.DELIMITER
      : workspace + this.DELIMITER + delimiter;
    if (!this.breadcrumbPath.startsWith('/') && this.breadcrumbPath !== path) {
      this.bucketObjects.data = [];
      BucketService.delimiter = delimiter;
      this.getBucketObjects(bucket, delimiter, workspace);
      this.breadcrumbPath = workspace + this.DELIMITER + delimiter;
    }
  }

  getBucketObjects(bucket: String, delimiter: String, workspace: String) {
    this.data = this.bucketService.getBucketData(bucket, delimiter, null, workspace).subscribe(
      elements => {
        this.bucketObjects.data = elements;
      });
  }

  selectionDone() {
    const items = { selectedFiles: this.selection.selected, totalSize: this.totalSize };
    this.dialog.open(FileDownloadModalComponent, {
      width: '500px',
      disableClose: true,
      data: items
    });
  }

  disableButton() {
    return this.downloadInProgress || this.selection.selected.length === 0;
  }

  toggleRow(event, row) {
    const selectedItem = this.selection.selected.find(item => item.id === row.id);
    if (event.checked && selectedItem === undefined) {
      this.selection.toggle(row);
    } else if (selectedItem !== undefined) {
      this.selection.deselect(selectedItem);
    }
    this.countFiles();
  }

  getWorkspaceName(bucketName) {
    let workspaceName: String = '';
    for (const key of Array.from(FirecloudApiService.workspaces.keys())) {
      if (FirecloudApiService.workspaces.get(key) === bucketName) {
        workspaceName = key;
        break;
      }
    }
    return workspaceName;
  }

  getDelimiter(selectedFolder) {
    const path = this.breadcrumbPath.substring(this.breadcrumbPath.indexOf(this.DELIMITER), this.breadcrumbPath.length);
    const index = path.lastIndexOf('/' + selectedFolder + '/');
    const indexSelectedFolder = index !== -1 ? index + 1
      : path.lastIndexOf(selectedFolder);
    return path.substring(1, indexSelectedFolder) + selectedFolder;
  }

}




