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
import { UUID } from 'angular2-uuid';

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
    private preflightService: PreflightService) {
    this.keyAccessCtrl = new FormControl();
  }

  ngOnInit() {
    if (localStorage.getItem('S3BucketName') !== undefined) {
      this.exportForm = this.formBuilder.group({
        exportDestination: [''],
        bucketNameGCP: [''],
        accessKeyIdAWS: [localStorage.getItem('S3AccessKey')],
        secretAccessKeyAWS: [localStorage.getItem('S3SecretKey')],
        bucketNameAWS: [localStorage.getItem('S3BucketName')],
      });
    } else {
      this.exportForm = this.formBuilder.group({
        exportDestination: [''],
        bucketNameGCP: [''],
        accessKeyIdAWS: [''],
        secretAccessKeyAWS: [''],
        bucketNameAWS: [''],
      });
    }
    this.preflightService.processFiles(this.data);
  }

  cancel(): void {
    this.dialogRef.close({ 'cancel': true });
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  exportFiles(): void {
    this.disableCancel = true;
    if (this.exportForm.get('exportDestination').value === 1) {
      this.exportToGCPFiles();
    } else {
      this.exportToS3();
    }
  }

  disableExportButton(): boolean {
    let disableExport;
    if (this.exportForm.get('exportDestination').value === 1) {
      if (this.exportForm.get('bucketNameGCP').value) {
        disableExport = false;
      } else {
        disableExport = true;
      }
    } else if (this.exportForm.get('exportDestination').value === 2) {
      if (this.exportForm.get('accessKeyIdAWS').value &&
        this.exportForm.get('secretAccessKeyAWS').value &&
        this.exportForm.get('bucketNameAWS').value) {
        disableExport = false;
      } else {
        disableExport = true;
      }
    } else {
      disableExport = true;
    }
    return disableExport;
  }


  setItemsS3() {
    this.dispatchFiles(Type.EXPORT_S3);
    this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_S3 });
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
    localStorage.setItem('S3AccessKey', this.exportForm.getRawValue().accessKeyIdAWS);
    localStorage.setItem('S3SecretKey', this.exportForm.getRawValue().secretAccessKeyAWS);
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
    this.transferablesGridComponent.updateCurrentBatch(type);
    this.selectedFiles().forEach(file => {
      file.id = UUID.UUID();
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
}
