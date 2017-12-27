import {Component, Inject, Output, EventEmitter} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {TreeNode} from 'primeng/primeng';
import { Item } from '@app/file-manager/models/item';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { TransferablesGridComponent } from '../transferables-grid/transferables-grid.component';
import { Message } from 'primeng/components/common/api';
import { DiskStatus } from '../models/diskStatus';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';
import { Type } from '@app/file-manager/models/type';
import { Router } from '@angular/router';
import { ItemStatus } from '@app/file-manager/models/item-status';

@Component({
  selector: 'app-file-download-modal',
  templateUrl: './file-download-modal.component.html'
})
export class FileDownloadModalComponent  {
  @Output('done') done: EventEmitter<any> = new EventEmitter();

  preserveStructure = true;
  directory = 'Choose Directory...';
  isValid = false;
  files: TreeNode[];
  msgs: Message[] = [];
  verify: DiskStatus;
  downloadFiles: Item[] = [];

  constructor(
    private downloadValidator: DownloadValidatorService,
    private transferablesGridComponent: TransferablesGridComponent,
    private store: Store<AppState>,
    public dialogRef: MatDialogRef<FileDownloadModalComponent>,
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      if (localStorage.getItem('directory') !== null) {
        this.directory = localStorage.getItem('directory');
        this.isValid = true;
    }
  }

  startDownload() {
    this.downloadValidator.verifyDisk(this.directory, this.data.totalSize).then(
      diskVerification => {
        this.verify = diskVerification;
        if (!this.verify.hasErr) {
          this.setItems();
          this.transferablesGridComponent.startDownload(this.downloadFiles);
          this.dialogRef.close();
          this.router.navigate(['/status']);
        } else {
          this.msgs = [];
          this.createWarningMsg(this.verify.errMsg);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  directoryChanged(event) {
    if (event.target.files[0] !== undefined) {
      this.directory = event.target.files[0].path;
      this.isValid = true;
      localStorage.setItem('directory', this.directory);
    }
  }

  setItems() {
    this.data.selectedFiles.filter(file => file.data.type === 'File')
      .forEach(file => {
        const dataFile = {
          id: file.data.id,
          name: file.data.name,
          size: file.data.size,
          created: file.data.updated,
          updated: file.data.updated,
          icon: file.data.type === 'Folder' ? 'folder' : 'cloud',
          selected: false,
          destination: this.directory,
          preserveStructure: this.preserveStructure,
          mediaLink: file.data.mediaLink,
          path: file.data.path,
          progress: 0,
          type: Type.DOWNLOAD,
          status: ItemStatus.PENDING,
          transferred: 0,
          remaining: 0
        };
        this.downloadFiles.push(dataFile);
        this.store.dispatch(new Transferables.AddItem(dataFile));
        this.done.emit(true);
        this.router.navigate(['/status']);
      });
  }

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
  }
}
