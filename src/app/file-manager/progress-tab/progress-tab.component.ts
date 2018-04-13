import { Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy, NgZone } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { Store } from '@ngrx/store';
import { ISubscription } from "rxjs/Subscription";

import { DownloadItem } from '../models/download-item';
import { DownloadsReducer, DownloadState, downloadInitialState } from '../reducers/downloads.reducer';

import { UploadItem } from '../models/upload-item';
import { UploadsReducer, UploadState, uploadInitialState } from '../reducers/uploads.reducer';

import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToGCSReducer, ExportToGCSState, exportToGCSInitialState } from '../reducers/export-to-gcs.reducer';

import { ExportToS3Item } from '../models/export-to-s3-item';
import { ExportToS3Reducer, ExportToS3State, exportToS3InitialState } from '../reducers/export-to-s3.reducer';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppState } from '@app/file-manager/reducers';
import { EntityStatus } from '@app/file-manager/models/entity-status';

@Component({
  selector: 'fc-progress-tab',
  templateUrl: './progress-tab.component.html',
  styleUrls: ['./progress-tab.component.scss']
})
export class ProgressTabComponent implements OnInit {

  @Input('filter') set setFilter(filter) {
    this.applyFilter(filter);
  }

  @Input('source') source;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  downloads: Observable<DownloadState>;
  uploads: Observable<UploadState>;
  exportsToGCS: Observable<ExportToGCSState>;
  exportsToS3: Observable<ExportToS3State>;

  downloadsChange: BehaviorSubject<DownloadState> = new BehaviorSubject<DownloadState>(downloadInitialState);
  uploadsChange: BehaviorSubject<UploadState> = new BehaviorSubject<UploadState>(uploadInitialState);
  exportToGCSChange: BehaviorSubject<ExportToGCSState> = new BehaviorSubject<ExportToGCSState>(exportToGCSInitialState);
  exportToS3Change: BehaviorSubject<ExportToS3State> = new BehaviorSubject<ExportToS3State>(exportToS3InitialState);

  private subscription: ISubscription;

  constructor(private store: Store<AppState>, private spinner: NgxSpinnerService, private zone: NgZone, ) {

    this.downloads = store.select('downloads');
    this.uploads = store.select('uploads');
    this.exportsToGCS = store.select('exportToGCS');
    this.exportsToS3 = store.select('exportToS3');

    this.downloads.subscribe(data => { this.downloadsChange.next(data); });
    this.uploads.subscribe(data => { this.uploadsChange.next(data); });
    this.exportsToGCS.subscribe(data => { this.exportToGCSChange.next(data); });
    this.exportsToS3.subscribe(data => { this.exportToS3Change.next(data); });
  }

  ngOnInit() {

    switch (this.source) {

      case 'Down':
        this.subscription = this.downloadsChange.subscribe(
          state => {
            this.processChanges(state);
          }
        );
        break;

      case 'Up':
        this.subscription = this.uploadsChange.subscribe(
          state => {
            this.processChanges(state);
          }
        );
        break;

      case 'GCS':
        this.subscription = this.exportsToGCS.subscribe(
          state => {
            this.processChanges(state);
          }
        );
        break;

      case 'S3':
        this.subscription = this.exportsToS3.subscribe(
          state => {
            this.processChanges(state);
          }
        );
        break;

    }

    // if (localStorage.getItem('displaySpinner') === 'true') {
    //   this.spinner.show();
    //   localStorage.removeItem('displaySpinner');
    // }
  }

  private processChanges(state) {
    const pending = Object.values(state.pending.items);
    const inProgress = Object.values(state.inProgress.items);
    const completed = Object.values(state.completed.items);
    const paused = Object.values(state.paused.items);
    const cancelled = Object.values(state.cancelled.items);
    const failed = Object.values(state.failed.items);

    this.zone.run(() => {
      this.dataSource.data = [...pending, ...inProgress, ...completed, ...paused, ...cancelled, ...failed];
    });

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.displayName.toLowerCase().indexOf(filter) !== -1;
  }

  // filtering method
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  describeStatus(statusCode): string {
    let statusDesc = '';

    switch (statusCode) {
      case EntityStatus.PENDING:
        statusDesc = 'Pending';
        break;

      case EntityStatus.INPROGRESS:
        statusDesc = 'In Progress';
        break;

      case EntityStatus.PAUSED:
        statusDesc = 'Paused';
        break;

      case EntityStatus.COMPLETED:
        statusDesc = 'Completed';
        break;

      case EntityStatus.CANCELED:
        statusDesc = 'Canceled';
        break;

      case EntityStatus.FAILED:
        statusDesc = 'Failed';
        break;

    }
    return statusDesc;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
