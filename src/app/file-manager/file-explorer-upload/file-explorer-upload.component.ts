import { Component, OnInit, Output, ViewChild, EventEmitter, NgZone } from '@angular/core';
import { Message, TreeNode } from 'primeng/primeng';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { AppState } from '../dbstate/app-state';
import { ElectronService } from 'ngx-electron';
import { FilterSizePipe } from '../filters/filesize-filter';
import { GcsService } from '../services/gcs.service';
import { MatDialog } from '@angular/material';
import { RegisterUploadService } from '../services/register-upload.service';
import { FileUploadModalComponent } from '../file-upload-modal/file-upload-modal.component';
import { TransferablesGridComponent } from '../transferables-grid/transferables-grid.component';
import { TreeTable } from 'primeng/primeng';
import { ChangeDetectorRef } from '@angular/core';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { UUID } from 'angular2-uuid';
import { StatusService } from '@app/file-manager/services/status.service';
import { FilesDatabase } from '../dbstate/files-database';

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
  uploadFiles: Item[] = [];
  uploadInProgress = false;

  fileCount = 0;
  totalSize = 0;

  constructor(
    private statusService: StatusService,
    private store: Store<AppState>,
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
  }

  ngOnInit() {

    const homeFolder = '/';

    const rootNode: TreeNode = {
      label: homeFolder,
      data: {
        name: homeFolder,
        path: homeFolder
      },
      leaf: false
    };
    this.files = [];
    this.files.push(rootNode);

    this.electronService.ipcRenderer.once('get-node-content', (event, localFiles) => {
      this.zone.run(() => {
        rootNode.children = localFiles.result;
        rootNode.data.name = localFiles.nodePath;
        rootNode.expanded = true;
      });
    });

    this.registerUpload.getLazyNodeContent(homeFolder);

    this.statusService.updateUploadProgress().subscribe(data => {
      this.zone.run(() => {
        if (data === 100) {
          this.uploadInProgress = false;
        } else {
          this.uploadInProgress = true;
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
    let node: TreeNode;
    if (evt.node) {
      this.electronService.ipcRenderer.once('get-node-content', (event, nodeFiles) => {
        node = evt.node;
        this.zone.run(() => {
          node.children = nodeFiles.result;
          node.expanded = true;
        });
        return;
      });
      this.registerUpload.getLazyNodeContent(evt.node.data.path);
    }
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
      if (!this.selectedFiles.includes(x)) {
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
        this.updateCurrentBatch();
        this.selectedFiles
          .filter(file => file.data.type === Type.FILE)
          .forEach(file => {
            this.dataFile = new Item(UUID.UUID(), file.data.name, file.data.updated, file.data.updated, file.data.size,
              '', file.data.path, result.directory, Type.UPLOAD, ItemStatus.PENDING, '',
              '', '', result.preserveStructure, false, '', '', '', true);

            this.uploadFiles.push(this.dataFile);
            this.store.dispatch(new Transferables.AddItem(this.dataFile));
          });
        this.transferablesGridComponent.startUpload(this.uploadFiles);
        this.router.navigate(['/status']);
      }
    });
  }

  upload() {
    const dialogRef = this.dialog.open(FileUploadModalComponent, {
      width: '500px'
    });
  }

  disableButton() {
    return this.uploadInProgress || this.fileCount <= 0;
  }

  updateCurrentBatch() {
    const items = new FilesDatabase(this.store).data.filter(item => item.type === Type.UPLOAD && item.currentBatch);
    items.forEach(item => {
      item.currentBatch = false;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });
  }
}
