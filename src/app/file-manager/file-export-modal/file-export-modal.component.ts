import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { SecurityService } from '@app/file-manager/services/security.service';
import { FilesService } from '@app/file-manager/services/files.service';
import { Type } from '@app/file-manager/models/type';
import { Item } from '@app/file-manager/models/item';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Message } from 'primeng/components/common/api';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { BucketService } from '@app/file-manager/services/bucket.service';
import { PreflightService } from '@app/file-manager/services/preflight.service';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/dbstate/app-state';
import * as Transferables from '../actions/transferables.actions';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';
import { FilesDatabase } from '../dbstate/files-database';


@Component({
  selector: 'app-file-export-modal',
  templateUrl: './file-export-modal.component.html',
  styleUrls: ['./file-export-modal.component.scss']
})
export class FileExportModalComponent implements OnInit {
  @Output('done') done: EventEmitter<any> = new EventEmitter();
  keyAccessCtrl: FormControl;
  exportForm: FormGroup;
  preserveStructure = true;
  disableExport = true;
  disableCancel = false;
  msgs: Message[] = [];
  disable = false;
  exportFilesItem: Item[] = [];

  constructor(
    public dialogRef: MatDialogRef<FileExportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private formBuilder: FormBuilder,
    private gcsService: GcsService,
    private transferablesGridComponent: TransferablesGridComponent,
    private filesService: FilesService,
    private bucketService: BucketService,
    private electronIpc: ElectronIpcApiService,
    private s3Service: S3ExportService,
    private store: Store<AppState>,
    private preflightService: PreflightService,
    private downloadValidator: DownloadValidatorService) {
    this.keyAccessCtrl = new FormControl();
  }

  ngOnInit() {
    this.exportForm = this.formBuilder.group({
      exportDestination: [''],
      bucketNameGCP: [''],
      accessKeyIdAWS: [''],
      secretAccessKeyAWS: [''],
      bucketNameAWS: [''],
    });
      this.preflightService.processFiles(this.data);
  }

  cancel(): void {
    this.dialogRef.close({ 'cancel': true });
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  exportFiles(): void {
    this.disableExport = true;
    this.disableCancel = true;
    if (this.exportForm.get('exportDestination').value === 1) {
      this.exportToGCPFiles();
    } else {
      this.downloadValidator.verifyDisk(null, Math.max.apply(Math, this.preflightService.selectedFiles.map(o =>  o.size))).then(
        diskVerification => {
          if (!diskVerification.hasErr) {
            this.exportToS3();
          } else {
            this.disableCancel = false;
            this.msgs = [];
            this.createWarningMsg(diskVerification.errMsg);
          }
        });
    }
  }

  formChange(): boolean {
    if (this.exportForm.get('exportDestination').value === 1) {
      if (this.exportForm.get('bucketNameGCP').valid) {
        this.disableExport = false;
      } else {
        this.disableExport = true;
      }
    } else if (this.exportForm.get('exportDestination').value === 2) {
      if (this.exportForm.get('accessKeyIdAWS').valid &&
        this.exportForm.get('secretAccessKeyAWS').valid &&
        this.exportForm.get('bucketNameAWS').valid) {
        this.disableExport = false;
      } else {
        this.disableExport = true;
      }
    } else {
      this.disableExport = true;
    }
    return this.disableExport;
  }

  cleanForm() {
    this.exportForm.get('accessKeyIdAWS').reset();
    this.exportForm.get('secretAccessKeyAWS').reset();
    this.exportForm.get('bucketNameAWS').reset();
    this.exportForm.get('bucketNameGCP').reset();
    this.msgs = [];
    this.disableExport = true;
  }

  setItemsS3() {
    this.dispatchFiles(Type.EXPORT_S3);
    this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_S3});
    this.router.navigate(['/status']);
  }

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
  }

  exportToGCPFiles(): void {
    if (this.exportForm.get('bucketNameGCP').valid) {
      this.disable = true;
      this.processFiles();
    }
  }

  exportToS3(): void {
    SecurityService.setS3AccessKey(this.exportForm.getRawValue().accessKeyIdAWS);
    SecurityService.setS3SecretKey(this.exportForm.getRawValue().secretAccessKeyAWS);
    localStorage.setItem('S3BucketName', this.exportForm.getRawValue().bucketNameAWS);
    this.s3Service.testCredentials();
    this.electronIpc.awsTestCredentials().then(
      () => this.setItemsS3(),
    ).catch((reject) => {
      this.disableCancel = false;
      this.msgs = [];
      this.createWarningMsg(reject);
    });
  }

  private processFiles() {
    this.exportFilesItem = [];
    this.gcsService.checkBucketPermissions(this.exportForm.controls.bucketNameGCP.value).subscribe(
      response => {
        if (response.permissions !== undefined) {
          this.dispatchFiles(Type.EXPORT_GCP);
          localStorage.setItem('displaySpinner', 'true');
          this.router.navigate(['/status']);
          localStorage.setItem('destinationBucket', this.exportForm.controls.bucketNameGCP.value);
          this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_GCP });
        } else {
          this.disable = false;
          this.msgs = [];
          this.msgs.push({
            severity: 'warn',
            summary: 'Sorry, you don\'t have the proper permissions to export to that bucket.',
          });
        }
      },
      err => {
        this.disable = false;
        this.msgs = [];
        this.msgs.push({
          severity: 'warn',
          summary: 'Sorry, the specified bucket does not exist.',
        });
      }
    );
  }

  dispatchFiles (type: string) {
    this.updateCurrentBatch(type);
    this.selectedFiles().forEach(file => {
      file.type = type;
      file.status = ItemStatus.PENDING;
      file.currentBatch = true;
      this.store.dispatch(new Transferables.AddItem(file));
      this.done.emit(true);
      this.router.navigate(['/status']);
    });
  this.done.emit(true);
  }

  isLoading() {
    return this.loadingFiles() || this.loadingFolders() > 0;
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

  updateCurrentBatch(type) {
    const items = new FilesDatabase(this.store).data.filter(item => item.type === type && item.currentBatch
                  && item.status === ItemStatus.COMPLETED || item.status === ItemStatus.CANCELED);
    items.forEach(item => {
      item.currentBatch = false;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });
  }
}
