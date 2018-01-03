import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss']
})
export class WarningModalComponent implements OnInit {

  @Output('done') done: EventEmitter<any> = new EventEmitter();

constructor(
  public dialogRef: MatDialogRef<WarningModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}

  cancel(): void {
    this.dialogRef.close({exit: false});
  }

  proceed() {
    this.dialogRef.close({exit: true});
  }

}
