import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-transferable-item',
  templateUrl: './transferable-item.component.html',
  styleUrls: ['./transferable-item.component.css']
})
export class TransferableItemComponent implements OnInit {

  @Input('item') set setItem(item: any) {
    this.item = item;
    this.init();
  }

  @Output('selectionChange') selectionChange: EventEmitter<any> = new EventEmitter();

  item: any = { name: 'No name', size: 0, icon: 'attachment', selected: false };

  color = 'primary';
  mode = 'determinate';
  value = 0;
  bufferValue = 75;

  currentState: any = 'initial';

  constructor() { }

  label = 'Download';
  icon = 'cloud_download';
  tooltipText = 'Action Button';

  ngOnInit() {
    this.init();
  }

  getInfo() {

  }

  handler() {
    switch (this.label) {
      case 'Download':
        this.download();
        break;
      case 'Pause':
        this.pause();
        break;
      case 'Resume':
        this.resume();
        break;
      case 'Retry':
        this.retry();
        break;
    }
  }

  init() {
    this.label = 'Download';
    this.icon = 'cloud_download';
    this.tooltipText = 'Download Item';
  }

  download() {
    this.label = 'Pause';
    this.icon = 'pause_circle_filled';
    this.tooltipText = 'Pause current Download';
    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 125000; j++) { }
      this.value = i;
    }
    // this.done();
  }

  pause() {
    this.label = 'Resume';
    this.icon = 'settings_backup_restore';
    this.tooltipText = 'Resumed paused download';
  }

  resume() {
    this.label = 'Pause';
    this.icon = 'pause_circle_filled';
    this.tooltipText = 'Pause current Download';
  }

  retry() {
    this.label = 'Retry';
    this.icon = 'cloud_download';
    this.tooltipText = 'Retry failed Download';
  }

  done() {
    this.label = 'Done';
    this.icon = 'check_circle';
    this.tooltipText = 'Download Finished';
  }

  failed() {
  }

  abort() {
  }

  selectionChanged(event) {
    this.item.selected = event.checked;
    this.selectionChange.emit(this.item);
  }
}
