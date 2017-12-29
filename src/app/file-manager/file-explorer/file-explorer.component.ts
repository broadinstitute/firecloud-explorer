import { Component, OnInit, NgZone } from '@angular/core';
import { Message, TreeNode, MenuItem } from 'primeng/primeng';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { AppState } from '../dbstate/app-state';
import { TransferableState, TransferablesReducer } from '../reducers/transferables.reducer';
import { FilesService } from '../services/files.service';
import { FilterSizePipe } from '../filters/filesize-filter';
import { FirecloudService } from '../services/firecloud.service';
import { GcsService } from '../services/gcs.service';
import { FileDownloadModalComponent } from '../file-download-modal/file-download-modal.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Type } from '@app/file-manager/models/type';
import { StatusService } from '../services/status.service';


@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {
  msgs: Message[];
  files: TreeNode[];
  dataFile: Item;
  selectedFiles: TreeNode[] = [];
  selectedFile: TreeNode;
  downloadInProgress = false;

  color = 'primary';
  mode = 'indeterminate';
  value = 50;

  fileCount = 0;
  totalSize = 0;

  cols: any[];

  constructor(
    private statusService: StatusService,
    private zone: NgZone,
    private filesService: FilesService,
    private firecloudService: FirecloudService,
    private dialog: MatDialog,
    private filterSize: FilterSizePipe,
    private store: Store<AppState>
  ) {

  }
  ngOnInit() {
    this.filesService.getBucketFiles(false).subscribe(
      resp => {
        if (resp !== undefined) {
          resp.subscribe(r => {
            this.files = r;
          });
        }
      }
    );
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
    this.selectedFiles.forEach(f => {
      if (f.data.type === 'File') {
        this.fileCount++;
        this.totalSize += f.data.size;
      }
    });
  }

  nodeSelect(event) {
    this.countFiles();
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
  }

  nodeUnselect(event) {
    this.countFiles();
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Unselected', detail: event.node.data.name });
  }

  nodeExpand(event) {
    if (event.node) {
    }
  }

  viewNode(node: TreeNode) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: node.data.name });
  }

  expandAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  collapseAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, false);
    });
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  selectAll() {
    this.selectedFiles = [];
    this.files.forEach(node => {
      this.selectRecursive(node, true);
    });
    this.countFiles();
  }

  selectNone() {
    this.selectedFiles = [];
    this.countFiles();
  }

  toggleSelection() {
    const newSelection = [];
    this.files.forEach(x => {
      if (this.selectedFiles.includes(x)) {
        // do nothing
      } else {
        newSelection.push(x);
      }
    });
    this.selectedFiles = newSelection;
    this.countFiles();
  }

  private selectRecursive(node: TreeNode, isExpand: boolean) {
    this.selectedFiles = [...this.selectedFiles, node];
    if (node.children) {
      node.children.forEach(childNode => {
        this.selectRecursive(childNode, isExpand);
      });
    }
  }

  selectionDone() {
    const items = {selectedFiles: this.selectedFiles, totalSize: this.totalSize };
    const dialogRef = this.dialog.open(FileDownloadModalComponent, {
      width: '500px',
      disableClose: true,
      data: items

    });
  }

  disableButton() {
    return this.downloadInProgress || this.fileCount <= 0;
  }

}
