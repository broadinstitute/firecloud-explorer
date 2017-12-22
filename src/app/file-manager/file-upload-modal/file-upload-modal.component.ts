
import { Component, Inject } from '@angular/core';
import { Workspace } from '../models/workspace';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent {

  workspaceCtrl: FormControl;
  file;
  readonly WRITER = 'WRITER';
  readonly OWNER = 'OWNER';

  writableWorkspaces: Workspace[] = [];
  filteredWorkspaces: Observable<any>;
  disableUpload = true;

  constructor(public dialogRef: MatDialogRef<FileUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.getWritableWorkspaces();

    this.workspaceCtrl = new FormControl();

    this.filteredWorkspaces = this.workspaceCtrl.valueChanges
      .startWith(this.workspaceCtrl.value)
      .map(name => name ? this.filterWorkspaces(name) : this.writableWorkspaces.slice());
  }

  filterWorkspaces(selectedWorkspace: Workspace) {
    if (selectedWorkspace.name != null && selectedWorkspace.name !== '') {
      const workspaceName = selectedWorkspace.name.toLowerCase();
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
    localStorage.setItem('uploadBucket', this.workspaceCtrl.value.bucketName);
    this.dialogRef.close({status: 'upload'});
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
    if (this.workspaceCtrl.value !== null && this.workspaceCtrl.value !== '' && this.workspaceCtrl.value !== undefined) {
      this.disableUpload = false;
    } else {
      this.disableUpload = true;
    }
  }
}
