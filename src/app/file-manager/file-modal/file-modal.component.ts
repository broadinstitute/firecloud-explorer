import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-file-modal',
  templateUrl: './file-modal.component.html',
  styleUrls: ['./file-modal.component.scss']
})
export class FileModalComponent  {

  preserveStructure = true;
  directory = 'Choose Directory...';
  isValid = false;

  constructor(
    public dialogRef: MatDialogRef<FileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      if (localStorage.getItem('directory') !== null) {
        this.directory = localStorage.getItem('directory');
        this.isValid = true;
      }
     }

    startDownload(): void {
      this.dialogRef.close({directory: this.directory, preserveStructure: this.preserveStructure});
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
}
