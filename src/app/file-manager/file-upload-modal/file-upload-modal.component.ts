
import { Component, Inject } from '@angular/core';
import { GcsService } from '../services/gcs.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Workspace } from '../models/workspace';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operator/startWith';
import { Pipe } from '@angular/core/src/metadata/directives';
import { map } from 'rxjs/operator/map';

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

  constructor(public dialogRef: MatDialogRef<FileUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private gcsService: GcsService) {

    this.getWritableWorkspaces();

    this.workspaceCtrl = new FormControl();

    this.filteredWorkspaces = this.workspaceCtrl.valueChanges
      .startWith(this.workspaceCtrl.value)
      .map(name => name ? this.filterWorkspaces(name) : this.writableWorkspaces.slice());
  }

  filterWorkspaces(selectedWorkspace: Workspace) {
     return this.writableWorkspaces
      .filter(workspace => workspace.name.toLowerCase().includes(selectedWorkspace.name.toLowerCase()));
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
}
