import { Component, OnInit, Output, ViewChild, EventEmitter, NgZone } from '@angular/core';
import { Message, TreeNode, TreeTable } from 'primeng/primeng';
import { Store } from '@ngrx/store';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { AppState } from '@app/file-manager/reducers';
import { ElectronService } from 'ngx-electron';
import { FilterSizePipe } from '../filters/filesize-filter';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { MatDialog } from '@angular/material';
import { RegisterUploadService } from '@app/file-manager/services/register-upload.service';
import { FileUploadModalComponent } from '../file-upload-modal/file-upload-modal.component';
import { TransferablesGridComponent } from '../transferables-grid/transferables-grid.component';
import { ChangeDetectorRef } from '@angular/core';
import { Type } from '@app/file-manager/models/type';
import { EntityStatus } from '@app/file-manager/models/entity-status';
import { ISubscription } from 'rxjs/Subscription';
import { StatusService } from '@app/file-manager/services/status.service';
import { UUID } from 'angular2-uuid';
import { environment } from '@env/environment';
const constants = require('../../../../electron_app/helpers/environment').constants;

@Component({
  selector: 'app-file-explorer-upload',
  templateUrl: './file-explorer-upload.component.html',
  styleUrls: ['./file-explorer-upload.component.scss']
})
export class FileExplorerUploadComponent implements OnInit {
  msgs: Message[];

  @ViewChild(TreeTable) tt: TreeTable;
  @Output('done') done: EventEmitter<any> = new EventEmitter();

  upSubscription: ISubscription;
  isUpInProgress: any;

  files: TreeNode[];
  selectedFiles: TreeNode[] = [];

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
    private zone: NgZone
  ) {

    this.upSubscription = this.store.select('uploads').subscribe(
      data => {
        this.isUpInProgress = data.inProgress.count > 0;
      }
    );
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

    this.electronService.ipcRenderer.once(constants.IPC_GET_NODE_CONTENT, (event, localFiles) => {
      this.zone.run(() => {
        rootNode.children = localFiles.result;
        rootNode.data.name = localFiles.nodePath;
        rootNode.expanded = true;
      });
    });

    this.registerUpload.getLazyNodeContent(homeFolder);

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
    // let node: TreeNode;
    console.log('nodeExpand ', evt.node);
    if (evt.node && !evt.node.expanded) {
      this.electronService.ipcRenderer.once(constants.IPC_GET_NODE_CONTENT, (event, nodeFiles) => {
        console.log('nodeExpand callback ', evt.node, nodeFiles);
        // node = evt.node;
        this.zone.run(() => {
          evt.node.children = nodeFiles.result;
          evt.node.expanded = true;
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
      const filesToUpload: UploadItem[] = [];
      let dataFile: UploadItem;

      if (result !== undefined) {
        this.selectedFiles
          .filter(file => file.data.type === Type.FILE)
          .forEach(file => {
            dataFile = new UploadItem(UUID.UUID(), file.data.name, file.data.updated,
              file.data.updated, file.data.size, file.data.path, result.directory,
              EntityStatus.PENDING, '', '', '', result.preserveStructure, '', file.data.name, '');

            filesToUpload.push(dataFile);
          });
        this.transferablesGridComponent.startUpload(filesToUpload);
      }
    });
  }

  upload() {
    const dialogRef = this.dialog.open(FileUploadModalComponent, {
      width: '500px'
    });
  }

  disableButton() {
    return this.uploadInProgress() || this.fileCount <= 0;
  }

  uploadInProgress() {
    return this.isUpInProgress;
  }
}
