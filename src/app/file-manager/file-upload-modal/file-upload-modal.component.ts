
import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { Workspace } from '@app/file-manager/models/workspace';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/components/common/api';
import { Router } from '@angular/router';
import { Type } from '@app/file-manager/models/type';
import { UploadPreflightService } from '@app/file-manager/services/upload-preflight.service';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { UUID } from 'angular2-uuid';
import { EntityStatus } from '@app/file-manager/models/entity-status';
import { UploadItem } from '@app/file-manager/models/upload-item';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload-modal.component.html'
})
export class FileUploadModalComponent implements OnInit, AfterViewInit {

  workspaceCtrl: FormControl;
  file;
  readonly WRITER = 'WRITER';
  readonly OWNER = 'OWNER';
  msgs: Message[] = [];

  uploadForm: FormGroup;
  writableWorkspaces: Workspace[] = [];
  filteredWorkspaces: Observable<any>;
  disableUpload = true;
  preserveStructure = false;

  constructor(public dialogRef: MatDialogRef<FileUploadModalComponent>,
    private router: Router,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private transferablesGridComponent: TransferablesGridComponent,
    private preflightService: UploadPreflightService) {

    this.getWritableWorkspaces();
    this.workspaceCtrl = new FormControl();

    this.filteredWorkspaces = this.workspaceCtrl.valueChanges
      .startWith(this.workspaceCtrl.value)
      .map(name => name ? this.filterWorkspaces(name) : this.writableWorkspaces.slice());
  }

  ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      workspaceCtrl: [''],
    });
  }

  ngAfterViewInit() {
    if (this.writableWorkspaces.length === 0) {
      this.disableUpload = false;
      this.msgs.push({
        severity: 'warn',
        summary: 'Sorry, you don\'t have permission to upload data to any workspace ',
      });
    }
    this.preflightService.processFiles(this.data);
  }

  filterWorkspaces(selectedWorkspace) {
    let workspaceName = selectedWorkspace.name !== undefined ? selectedWorkspace.name : selectedWorkspace;
    if (workspaceName != null && workspaceName !== '') {
      workspaceName = workspaceName.toLowerCase();
      return this.writableWorkspaces
        .filter(workspace => workspace.name.toLowerCase().includes(workspaceName));
    } else {
      return this.writableWorkspaces;
    }
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  fileCount() {
    return this.preflightService.fileCount;
  }

  totalSize() {
    return this.preflightService.totalSize;
  }

  isLoading() {
    return this.preflightService.loadingFiles;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  uploadFiles(): void {

    const filesToUpload = [];
    this.selectedFiles().forEach(file => {
      filesToUpload.push(this.uploadItemFactory(file));
    });

    this.disableUpload = true;
    localStorage.setItem('uploadBucket', this.workspaceCtrl.value.bucketName);
    localStorage.setItem('operation-type', Type.UPLOAD);
    this.dialogRef.close({ status: 'upload' });
    localStorage.setItem('preserveStructureUpload', String(this.preserveStructure));

    this.dialogRef.close({ preserveStructure: this.preserveStructure, type: Type.EXPORT_S3 });
    this.transferablesGridComponent.startUpload(filesToUpload);

    this.router.navigate(['/status']);
  }

  getWritableWorkspaces() {
    const userWorkspaces: Workspace[] = JSON.parse(localStorage.getItem('workspaces'));
    if (userWorkspaces !== undefined && userWorkspaces !== null) {
      userWorkspaces.forEach(workspace => {
        const access = workspace.accessLevel;
        if (access === this.WRITER || access === this.OWNER) {
          this.writableWorkspaces.push(workspace);
        }
      });
    }
  }

  displayFn(workspace: Workspace): any {
    return workspace ? workspace.name : workspace;
  }

  changeWorkspace() {
    if (this.workspaceCtrl.value !== null && this.workspaceCtrl.value !== '' &&
      this.workspaceCtrl.value !== undefined && this.workspaceCtrl.value.bucketName !== undefined) {
      this.disableUpload = false;
    } else {
      this.disableUpload = true;
    }
  }

  selectedFiles(): any[] {
    return this.preflightService.selectedFiles;
  }

  uploadItemFactory(file) {
    return new UploadItem(UUID.UUID(), file.name, '', '', file.size, file.path, '',
      EntityStatus.PENDING, '', '', '', this.preserveStructure, '', file.name, '');
  }
}
