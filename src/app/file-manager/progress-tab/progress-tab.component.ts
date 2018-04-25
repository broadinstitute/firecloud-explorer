import { Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy, NgZone } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSortable } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { Store } from '@ngrx/store';
import { ISubscription } from 'rxjs/Subscription';

import { Observable } from 'rxjs/Observable';
import { AppState } from '@app/file-manager/reducers';
import { EntityStatus } from '@app/file-manager/models/entity-status';

@Component({
  selector: 'app-progress-tab',
  templateUrl: './progress-tab.component.html',
  styleUrls: ['./progress-tab.component.scss']
})
export class ProgressTabComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('filter') set setFilter(filter) {
    this.applyFilter(filter);
  }

  @Input('storeName') storeName;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  state: Observable<any>;
  private subscription: ISubscription;

  constructor(private store: Store<AppState>, private spinner: NgxSpinnerService, private zone: NgZone, ) { }

  ngOnInit() {

    this.state = this.store.select(this.storeName);

    this.subscription = this.subscription = this.state.subscribe(
      state => {
        this.processChanges(state);
      });

  }

  private processChanges(state) {
    const pending = Object.values(state.pending.items);
    const inProgress = Object.values(state.inProgress.items);
    const completed = Object.values(state.completed.items);
    const paused = Object.values(state.paused.items);
    const cancelled = Object.values(state.cancelled.items);
    const failed = Object.values(state.failed.items);

    this.zone.run(() => {
      this.dataSource.data = [];
      // this.dataSource.data = [...pending, ...inProgress, ...completed, ...paused, ...cancelled, ...failed];
      this.dataSource.data = [...inProgress, ...failed];
    });

  }

  ngAfterViewInit() {

    this.sort.sort(<MatSortable>{
      id: 'status',
      start: 'desc'
    }
    );

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
