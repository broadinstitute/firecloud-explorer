import { Component, HostBinding, OnDestroy, OnInit, HostListener, NgZone } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { SecurityService } from '@app/file-manager/services/security.service.ts';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

import { logout, selectorAuth, routerTransition } from '@app/core';
import { environment } from '@env/environment';

import { selectorSettings } from './settings';
import { MatDialog } from '@angular/material';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';

import { ItemStatus } from '@app/file-manager/models/item-status';
import { Type } from '@app/file-manager/models/type';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { GoogleLoginService } from '@app/file-manager/services/login-google.service';
import * as Transferables from '@app/file-manager/actions/transferables.actions';
import { DownloadState } from '@app/file-manager/reducers/downloads.reducer';
import { UploadState } from '@app/file-manager/reducers/uploads.reducer';
import { ExportToGCSState } from '@app/file-manager/reducers/export-to-gcs.reducer';
import { ExportToS3State } from '@app/file-manager/reducers/export-to-s3.reducer';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition],
})
export class AppComponent implements OnInit, OnDestroy {

  static updateUserEmail: Subject<string> = new Subject();
  unsubscribe$: Subject<void> = new Subject<void>();
  userEmail: String;

  forumURL = environment.FORUM_URL;
  title = 'app';

  @HostBinding('class') componentCssClass;

  year = new Date().getFullYear();
  isAuthenticated;

  downloadState: Observable<DownloadState>;
  uploadState: Observable<UploadState>;
  exportToGCSState: Observable<ExportToGCSState>;
  exportToS3State: Observable<ExportToS3State>;
  inProgress = false;

  constructor(
    private dialog: MatDialog,
    public overlayContainer: OverlayContainer,
    private store: Store<any>,
    private router: Router,
    private electronService: ElectronService,
    private gcsService: GcsService,
    private zone: NgZone,
    private loginService: GoogleLoginService) {
    AppComponent.updateUserEmail.subscribe(email => {
      this.userEmail = email;
    });
    this.downloadState = this.store.select('downloads');
    this.uploadState = this.store.select('uploads');
    this.exportToGCSState = this.store.select('exportToGCS');
    this.exportToS3State = this.store.select('exportToS3');
   }

  @HostListener('window:beforeunload')
  checkBeforeClose() {
    event.preventDefault();
    if (this.inProgress) {
      const dialogRef = this.dialog.open(WarningModalComponent, {
        width: '500px',
        disableClose: false,
        data: 'quit'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.exit) {
          this.gcsService.cancelAll();
          this.electronService.process.exit(0);
        }
      });
     return false;
    }
   return true;
  }

  ngOnInit(): void {
    this.store
      .select(selectorSettings)
      .takeUntil(this.unsubscribe$)
      .map(({ theme }) => theme.toLowerCase())
      .subscribe(theme => {
        this.componentCssClass = theme;
        this.overlayContainer.getContainerElement().classList.add(theme);
      });
    this.store
      .select(selectorAuth)
      .takeUntil(this.unsubscribe$)
      .subscribe(auth => this.isAuthenticated = auth.isAuthenticated);

    this.downloadState.subscribe(cs => {
      this.zone.run(() => {
        this.inProgress = cs.inProgress.count > 0;
      });
    });

    this.uploadState.subscribe(cs => {
      this.zone.run(() => {
        this.inProgress = cs.inProgress.count > 0;
      });
    });

    this.exportToGCSState.subscribe(cs => {
      this.zone.run(() => {
        this.inProgress = cs.inProgress.count > 0;
      });
    });

    this.exportToS3State.subscribe(cs => {
      this.zone.run(() => {
        this.inProgress = cs.inProgress.count > 0;
      });
    });
    this.onLogoutClick();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openForumOnBrowser() {
    this.electronService.shell.openExternal(this.forumURL);
  }

  onLogoutClick() {
    if (this.inProgress) {
      const dialogRef = this.dialog.open(WarningModalComponent, {
        width: '500px',
        disableClose: false,
        data: 'logout'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.exit) {
          this.store.dispatch(new Transferables.Reset());
          this.gcsService.cancelAll();
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }
  logout() {
    SecurityService.removeAccessToken();
    this.loginService.logOut();
    this.store.dispatch(logout());
    this.router.navigate(['/login']);
  }
}
