import { Component, OnInit, Input, EventEmitter, Output, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import { DownloadState } from '@app/file-manager/reducers/downloads.reducer';
// import { UploadState } from '@app/file-manager/reducers/uploads.reducer';
// import { ExportToGCSState } from '@app/file-manager/reducers/export-to-gcs.reducer';
// import { ExportToS3State } from '@app/file-manager/reducers/export-to-s3.reducer';

import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-status-box',
  templateUrl: './status-box.component.html',
  styleUrls: ['./status-box.component.scss']
})
export class StatusBoxComponent implements OnInit, OnDestroy {

  @Input('title') title;
  @Input('cancelLabel') cancelLabel;
  @Input('storeName') storeName;
  @Output('cancelRequest') cancelRequest: EventEmitter<any> = new EventEmitter();

  completed = 0;
  total = 0;
  progress = 0;
  pending = false;
  inProgress = false;
  canceled = false;
  finished = false;
  subscription: ISubscription;

  state: Observable<any>;

  constructor(private zone: NgZone,
    private store: Store<AppState>, ) {
  }

  ngOnInit() {
    this.state = this.store.select(this.storeName);

    this.subscription = this.state.subscribe(cs => {
      this.zone.run(() => {
        this.completed = cs.completed.count;
        this.total = cs.totalCount;
        this.progress = cs.totalProgress;
        if (!isFinite(this.progress)) {
          this.progress = 0;
        }
        this.inProgress = cs.inProgress.count > 0;
        this.pending = cs.pending.count > 0;
        this.canceled = (cs.cancelled.count + cs.failed.count) > 0;
        this.finished = (cs.cancelled.count + cs.failed.count + this.completed) === this.total;
      });
    });
  }

  cancel() {
    this.cancelRequest.emit('');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


