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
import { NgxSpinnerService } from 'ngx-spinner';
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

  folderCount = 0;
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
    private spinner: NgxSpinnerService,
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

  nodeExpand(evt) {

    if (evt.node && !evt.node.expanded) {

      this.electronService.ipcRenderer.once(constants.IPC_GET_NODE_CONTENT, (event, nodeFiles) => {

        const dadIsSelected = this.tt.isSelected(evt.node);

        this.zone.run(() => {

          if (evt.node.children) {
            evt.node.children.forEach(child => {
              const ix = this.tt.findIndexInSelection(child);
              if (ix >= 0) {
                this.selectedFiles.splice(ix, 1);
              }
            });
          }

          evt.node.children = nodeFiles.result;
          evt.node.expanded = true;

          evt.node.children.forEach(child => {

            this.tt.propagateSelectionDown(child, dadIsSelected);
            if (child.parent) {
              this.tt.propagateSelectionUp(child.parent, dadIsSelected);
            }
          });
          this.spinner.hide();
        });
        return;
      });
      this.spinner.show();
      this.registerUpload.getLazyNodeContent(evt.node.data.path);
    }
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
  }

  selectNone() {
    this.selectedFiles = [];
  }

  toggleSelection() {
    const newSelection = [];
    this.files.forEach(x => {
      if (!this.selectedFiles.includes(x)) {
        newSelection.push(x);
      }
    });
    this.selectedFiles = newSelection;
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

    const items = {
      selectedFiles: this.selectedFiles,
      totalSize: 0
    };

    this.spinner.show();
    this.dialog.open(FileUploadModalComponent, {
      width: '500px',
      disableClose: true,
      data: items
    });
  }

  disableButton() {
    return this.uploadInProgress() || this.selectedFiles.length <= 0;
  }

  uploadInProgress() {
    return this.isUpInProgress;
  }
}
