import { Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DownloadItem } from '@app/file-manager/models/download-item';

import { Message } from 'primeng/components/common/api';
import { DiskStatus } from '@app/file-manager/models/diskStatus';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';
import { Type } from '@app/file-manager/models/type';
import { Router } from '@angular/router';
import { EntityStatus } from '@app/file-manager/models/entity-status';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { PreflightService } from '@app/file-manager/services/preflight.service';

@Component({
  selector: 'app-file-download-modal',
  templateUrl: './file-download-modal.component.html'
})
export class FileDownloadModalComponent implements OnInit {

  preserveStructure = true;
  directory = 'Choose Directory...';
  isValid = false;
  msgs: Message[] = [];
  verify: DiskStatus;
  downloadFiles: DownloadItem[] = [];
  disableButton = false;
  filesCount = 0;
  filesSize = 0;

  constructor(
    private downloadValidator: DownloadValidatorService,
    private transferablesGridComponent: TransferablesGridComponent,
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
      this.preflightService.getCount().subscribe( count => {
        this.filesCount = Number(count);
      });
    this.preflightService.getSize().subscribe(size => {
      this.filesSize = Number(size);
    });
  }

  isLoading() {
    return this.loadingFiles() || this.loadingFolders() > 0;
  }


  startDownload() {
    this.disableButton = true;
    this.downloadFiles = [];
    const ids: string[] = [];
      this.downloadValidator.verifyDisk(this.directory, this.filesSize).then(
      diskVerification => {
        this.verify = diskVerification;

        if (!this.verify.hasErr) {
          this.dialogRef.close();
          this.selectedFiles()
            .forEach(
              file => {
                if (file.type === 'File' && !ids.includes(file.id)) {
                  ids.push(file.id);
                  const dataFile: DownloadItem = new DownloadItem
                    (file.id, file.name, file.updated, file.created, file.size, file.mediaLink, file.path,
                    this.directory, EntityStatus.PENDING, '', '', '',
                    this.preserveStructure, '', file.displayName, '');
                  this.downloadFiles.push(dataFile);
                }
              });
          this.transferablesGridComponent.startDownload(this.downloadFiles);
          localStorage.setItem('operation-type', Type.DOWNLOAD);
          this.router.navigate(['/status']);

        } else {
          this.disableButton = false;
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

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
  }

  fileCount() {
    return this.preflightService.fileCountObservable;
  }

  totalSize() {
    return this.preflightService.totalSizeObservable;
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
