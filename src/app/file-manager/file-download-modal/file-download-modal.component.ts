import { Component, Inject, Output, OnInit, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Item } from '@app/file-manager/models/item';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { Message } from 'primeng/components/common/api';
import { DiskStatus } from '../models/diskStatus';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';
import { Type } from '@app/file-manager/models/type';
import { Router } from '@angular/router';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { PreflightService } from '../services/preflight.service';

@Component({
  selector: 'app-file-download-modal',
  templateUrl: './file-download-modal.component.html'
})
export class FileDownloadModalComponent implements OnInit {

  @Output('done') done: EventEmitter<any> = new EventEmitter();

  preserveStructure = true;
  directory = 'Choose Directory...';
  isValid = false;
  msgs: Message[] = [];
  verify: DiskStatus;
  downloadFiles: Item[] = [];
  filesMap: Map<String, Item>;


  constructor(
    private downloadValidator: DownloadValidatorService,
    private transferablesGridComponent: TransferablesGridComponent,
    private store: Store<AppState>,
    public dialogRef: MatDialogRef<FileDownloadModalComponent>,
    public router: Router,
    private preflightService: PreflightService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.filesMap = new Map();
    const storedDirectory = localStorage.getItem('directory');
    if (storedDirectory !== null) {
      this.directory = storedDirectory;
      this.isValid = true;
    }
  }

  ngOnInit() {
    this.preflightService.processFiles(this.data);
  }

  isLoading() {
    return this.loadingFiles() || this.loadingFolders() > 0;
  }


  startDownload() {
    this.downloadValidator.verifyDisk(this.directory, this.totalSize()).then(
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
    this.selectedFiles().filter(file => file.type === 'File')
      .forEach(file => {
        if (!this.filesMap.has(file.id)) {
          this.filesMap.set(file.id, file);
          const dataFile: Item = new Item(file.id, file.name, file.updated, file.created,
            file.size, file.mediaLink, file.path, this.directory,
            Type.DOWNLOAD, ItemStatus.PENDING, '', '', '', this.preserveStructure, false, '', file.displayName, '');
          this.downloadFiles.push(dataFile);
          this.store.dispatch(new Transferables.AddItem(dataFile));
          this.done.emit(true);
          this.router.navigate(['/status']);
        }
      });
    this.done.emit(true);
    this.router.navigate(['/status']);
  }

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
  }

  fileCount() {
    return this.preflightService.fileCount;
  }

  totalSize() {
    return this.preflightService.totalSize;
  }

  totalFiles() {
    return this.preflightService.totalFiles;
  }

  loadingFiles() {
    return this.preflightService.loadingFiles;
  }

  loadingFolders() {
    return this.preflightService.loadingFolders;
  }

  selectedFiles() {
    return this.preflightService.selectedFiles;
  }
}
