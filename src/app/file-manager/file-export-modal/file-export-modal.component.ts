import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { SecurityService } from '@app/file-manager/services/security.service';
import { FilesService } from '@app/file-manager/services/files.service';
import { Type } from '@app/file-manager/models/type';

import { GcsService } from '@app/file-manager/services/gcs.service';
import { Message } from 'primeng/components/common/api';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { BucketService } from '@app/file-manager/services/bucket.service';
import { PreflightService } from '@app/file-manager/services/preflight.service';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';

import { Item } from '@app/file-manager/models/item';
import * as Transferables from '@app/file-manager/actions/transferables.actions';

import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import * as exportToGCSActions from '@app/file-manager/actions/export-to-gcs-item.actions';

import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';
import * as exportToS3Actions from '@app/file-manager/actions/export-to-s3-item.actions';

import { EntityStatus } from '@app/file-manager/models/entity-status';

import { UUID } from 'angular2-uuid';

import { ExportDestination } from '@app/file-manager/models/export-destination';

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
  filesCount = 0;
  filesSize = 0;

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
    this.preflightService.getCount().subscribe( count => {
      this.filesCount = Number(count);
    });
    this.preflightService.getSize().subscribe(size => {
        this.filesSize = Number(size);
    });

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

    // TODO: Review Type here ...
    this.preflightService.processFiles(this.data, Type.EXPORT_GCP);
  }

  cancel(): void {
    this.dialogRef.close({ 'cancel': true });
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  exportFiles(): void {
    this.disableCancel = true;

    switch (this.exportForm.get('exportDestination').value) {

      case ExportDestination.GCS:
        this.startExportToGCS();
        break;

      case ExportDestination.S3:
        this.startExportToS3();
        break;

      default:
        break;
    }

  }

  disableExportButton(): boolean {
    let disableExport;
    if (this.exportForm.get('exportDestination').value === ExportDestination.GCS) {
      if (this.exportForm.get('bucketNameGCP').value) {
        disableExport = false;
      } else {
        disableExport = true;
      }
    } else if (this.exportForm.get('exportDestination').value === ExportDestination.S3) {
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

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
  }

  startExportToGCS(): void {

    const filesToExport: ExportToGCSItem[] = [];
    if (this.exportForm.get('bucketNameGCP').valid) {
      this.disable = true;
      // this.processGCSFiles();

      this.exportFilesItem = [];

      this.gcsService.checkBucketPermissions(this.exportForm.controls.bucketNameGCP.value).subscribe(
        response => {
          if (response.permissions !== undefined) {
            // this.dispatchGCSFiles();

            this.selectedFiles().forEach(file => {

              const dataFile: ExportToGCSItem = new ExportToGCSItem(file.id, file.name,
                file.updated, file.created, file.size, file.mediaLink, file.path,
                '', EntityStatus.PENDING, file.bucketName, '', '',
                this.preserveStructure, '', file.displayName, '');

              filesToExport.push(dataFile);
            });

            localStorage.setItem('destinationBucket', this.exportForm.controls.bucketNameGCP.value);
            localStorage.setItem('operation-type', Type.EXPORT_GCP);
            this.transferablesGridComponent.startGCSExport(filesToExport);
            this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_GCP });

            this.router.navigate(['/status']);

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
        },
        () => {

        }

      );
    }
  }


  startExportToS3(): void {
    SecurityService.setS3AccessKey(this.exportForm.getRawValue().accessKeyIdAWS);
    SecurityService.setS3SecretKey(this.exportForm.getRawValue().secretAccessKeyAWS);
    localStorage.setItem('S3BucketName', this.exportForm.getRawValue().bucketNameAWS);
    localStorage.setItem('S3AccessKey', this.exportForm.getRawValue().accessKeyIdAWS);
    localStorage.setItem('S3SecretKey', this.exportForm.getRawValue().secretAccessKeyAWS);
    this.disable = true;
    this.s3Service.testCredentials();

    this.electronIpc.awsTestCredentials().then(
      () => {
        localStorage.setItem('operation-type', Type.EXPORT_S3);
        this.exportToS3();
      }
    ).catch((reject) => {
      this.disable = false;
      this.disableCancel = false;
      this.msgs = [];
      this.createWarningMsg(reject);
    });
  }

  exportToS3() {
    const filesToExport = [];

    this.selectedFiles().forEach(file => {
      localStorage.setItem('preserveStructureS3', String(this.preserveStructure));
      filesToExport.push(file);
    });

    this.transferablesGridComponent.startS3Export(filesToExport);

    this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_S3 });
    this.router.navigate(['/status']);
  }

  isLoading() {
    return this.loadingFiles() || this.loadingFolders() > 0;
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

