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
import { FilterSizePipe } from '../filters/filesize-filter';
import { FilesDatabase } from '../dbstate/files-database';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UUID } from 'angular2-uuid';


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

  constructor(
    private downloadValidator: DownloadValidatorService,
    private transferablesGridComponent: TransferablesGridComponent,
    private store: Store<AppState>,
    public dialogRef: MatDialogRef<FileDownloadModalComponent>,
    public router: Router,
    private preflightService: PreflightService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    const storedDirectory = localStorage.getItem('directory');
    if (storedDirectory !== null) {
      this.directory = storedDirectory;
      this.isValid = true;
    }
  }

  ngOnInit() {
    this.preflightService.processFiles(this.data, Type.DOWNLOAD);
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
          this.dialogRef.close();
          this.transferablesGridComponent.startDownload(this.downloadFiles);
          //          this.dialogRef.close();
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

    const ids: string[] = [];
    this.updateCurrentBatch();
    this.selectedFiles()
      .forEach(
        file => {
          if (file.type === 'File' && !ids.includes(file.id)) {

            ids.push(file.id);

            const dataFile: Item = new Item(UUID.UUID(), file.name, file.updated, file.created,
              file.size, file.mediaLink, file.path, this.directory,
              Type.DOWNLOAD, ItemStatus.PENDING, '', '', '', this.preserveStructure, false, '', file.displayName, '',
              true, Type.IDOWNLOAD, ItemStatus.IPENDING);

            this.store.dispatch(new Transferables.AddItem(dataFile));
            this.downloadFiles.push(dataFile);
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

  updateCurrentBatch() {
    const items = new FilesDatabase(this.store).data.filter(item => item.type === Type.DOWNLOAD && item.currentBatch);
    items.forEach(item => {
      item.currentBatch = false;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });
  }

}
