import { Component, OnInit, OnChanges, DoCheck, Output, ViewChild, EventEmitter, ViewContainerRef, NgZone } from '@angular/core';
import { Message, TreeNode, MenuItem } from 'primeng/primeng';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { TransferableState, TransferablesReducer } from '../reducers/transferables.reducer';
import { ElectronService } from 'ngx-electron';
import { FilterSizePipe } from '../filters/filesize-filter';
import { GcsService } from '../services/gcs.service';
import { FileModalComponent } from '../file-modal/file-modal.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RegisterUploadService } from '../services/register-upload.service';
import { FileUploadModalComponent } from '../file-upload-modal/file-upload-modal.component';
import { TransferablesGridComponent } from '../transferables-grid/transferables-grid.component';
import { TreeTable } from 'primeng/primeng';
import { ChangeDetectorRef } from '@angular/core';
import { Type } from '@app/file-manager/models/type';

interface AppState {
  uploadables: TransferableState;
}
@Component({
  selector: 'app-file-explorer-upload',
  templateUrl: './file-explorer-upload.component.html',
  styleUrls: ['./file-explorer-upload.component.scss']
})
export class FileExplorerUploadComponent implements OnInit {
  msgs: Message[];

  @ViewChild(TreeTable) tt: TreeTable;

  @Output('done') done: EventEmitter<any> = new EventEmitter();

  files: TreeNode[];
  dataFile: Item;
  selectedFiles: TreeNode[] = [];
  selectedFile: TreeNode;

  fileCount = 0;
  totalSize = 0;

  cols: any[];

  constructor(private store: Store<AppState>,
    private gcsService: GcsService,
    private electronService: ElectronService,
    private dialog: MatDialog,
    private transferablesGridComponent: TransferablesGridComponent,
    private filterSize: FilterSizePipe,
    private registerUpload: RegisterUploadService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) {

    // subscribe to get-filesystem event from nodejs
    this.electronService.ipcRenderer.on('get-filesystem', (event, localFiles) => {
      this.zone.run(() => {
        this.files = localFiles.result;
      });
    });
  }


  ngOnInit() {
    // call node's get-filesystem
    this.registerUpload.getFileSystem('');
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
    this.zone.run(() => {
      this.countFiles();
      this.msgs = [];
      this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
    });
  }

  nodeUnselect(event) {
    this.zone.run(() => {
      this.countFiles();
      this.msgs = [];
      this.msgs.push({ severity: 'info', summary: 'Node Unselected', detail: event.node.data.name });
    });
  }

  nodeExpand(evt) {
  }

  nodeCollapse(evt) {
  }

  viewNode(node: TreeNode) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: node.data.name });
  }

  expandAll() {
    this.zone.run(() => {
      this.files.forEach(node => {
        this.expandRecursive(node, true);
      });
    });
  }

  collapseAll() {
    this.zone.run(() => {

      this.files.forEach(node => {
        this.expandRecursive(node, false);
      });
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
    const dialogRef = this.dialog.open(FileUploadModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.selectedFiles
          .filter(file => file.data.type === 'File')
          .forEach(file => {
            this.dataFile = {
              id: file.data.id,
              name: file.data.name,
              size: file.data.size,
              created: file.data.updated,
              updated: file.data.updated,
              icon: file.data.type === 'Folder' ? 'folder' : 'cloud',
              selected: false,
              destination: result.directory,
              preserveStructure: result.preserveStructure,
              mediaLink: '',
              path: file.data.path,
              type: Type.UPLOAD
            };
            this.store.dispatch(new Transferables.AddItem(this.dataFile));
          });
        this.transferablesGridComponent.startUpload();
        this.router.navigate(['/status']);
      }
    });
  }

  upload() {
    const dialogRef = this.dialog.open(FileUploadModalComponent, {
      width: '500px'
    });
  }
}
