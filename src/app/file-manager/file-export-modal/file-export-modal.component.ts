import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Form } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { FilesService } from '@app/file-manager/services/files.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Item } from '@app/file-manager/models/item';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Message } from 'primeng/components/common/api';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { PreflightService } from '@app/file-manager/services/preflight.service';

@Component({
  selector: 'app-file-export-modal',
  templateUrl: './file-export-modal.component.html',
  styleUrls: ['./file-export-modal.component.scss']
})
export class FileExportModalComponent implements OnInit {

  exportForm: FormGroup;
  preserveStructure = true;
  exportFiles: Item[] = [];
  msgs: Message[] = [];
  disable = false;

  constructor(
    public dialogRef: MatDialogRef<FileExportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private formBuilder: FormBuilder,
    private gcsService: GcsService,
    private transferablesGridComponent: TransferablesGridComponent,
    private preflightService: PreflightService) { }

  ngOnInit() {
    this.exportForm = this.formBuilder.group({
      bucketNameGCP: [''],
    });
    this.preflightService.processFiles(this.data, Type.EXPORT_GCP);
  }

  cancel(): void {
    this.dialogRef.close({ 'cancel': true });
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  exportToGCPFiles(): void {
    if (this.exportForm.valid) {
      this.disable = true;
      this.processFiles();
    }
  }
  private processFiles() {
    this.exportFiles = [];
    this.gcsService.checkBucketPermissions(this.exportForm.controls.bucketNameGCP.value).subscribe(
      response => {
        if (response.permissions !== undefined) {
          localStorage.setItem('displaySpinner', 'true');
          this.router.navigate(['/status']);
          localStorage.setItem('destinationBucket', this.exportForm.controls.bucketNameGCP.value);
          this.dialogRef.close({ preserveStructure: this.preserveStructure });
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

