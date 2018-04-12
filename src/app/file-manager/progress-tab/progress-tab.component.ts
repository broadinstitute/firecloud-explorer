import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { Store } from '@ngrx/store';

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

@Component({
  selector: 'fc-progress-tab',
  templateUrl: './progress-tab.component.html',
  styleUrls: ['./progress-tab.component.scss']
})
export class ProgressTabComponent implements OnInit {

  @Input('tabLabel') tabLabel;
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

  constructor(private store: Store<AppState>, private spinner: NgxSpinnerService) {
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

    this.dataSource.data = [];

      this.downloadsChange.subscribe(
        state => {
          this.dataSource.data = Object.values(state.completed.items);
        }
      )

    if (localStorage.getItem('displaySpinner') === 'true') {
      this.spinner.show();
      localStorage.removeItem('displaySpinner');
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.name.toLowerCase().indexOf(filter) !== -1;
  }

  // filtering method
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

}
