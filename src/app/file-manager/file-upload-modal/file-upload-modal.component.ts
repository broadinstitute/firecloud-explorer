
import { Component, Inject, OnInit } from '@angular/core';
import { Workspace } from '../models/workspace';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/components/common/api';
import { Router } from '@angular/router';
import { Type } from '@app/file-manager/models/type';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload-modal.component.html'
})
export class FileUploadModalComponent implements OnInit {

  workspaceCtrl: FormControl;
  file;
  readonly WRITER = 'WRITER';
  readonly OWNER = 'OWNER';
  msgs: Message[] = [];

  writableWorkspaces: Workspace[] = [];
  filteredWorkspaces: Observable<any>;
  disableUpload = true;

  constructor(public dialogRef: MatDialogRef<FileUploadModalComponent>,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.getWritableWorkspaces();

    this.workspaceCtrl = new FormControl();

    this.filteredWorkspaces = this.workspaceCtrl.valueChanges
      .startWith(this.workspaceCtrl.value)
      .map(name => name ? this.filterWorkspaces(name) : this.writableWorkspaces.slice());
  }

  ngOnInit() {
    if (this.writableWorkspaces.length === 0) {
      this.disableUpload = false;
      this.msgs.push({
        severity: 'warn',
        summary: 'Sorry, you don\'t have permission to upload data to any workspace ',
      });
    }
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

  cancel(): void {
    this.dialogRef.close();
  }

  uploadFiles(): void {
    this.disableUpload = true;
    localStorage.setItem('uploadBucket', this.workspaceCtrl.value.bucketName);
    localStorage.setItem('operation-type', Type.UPLOAD);
    this.dialogRef.close({status: 'upload'});
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
}
