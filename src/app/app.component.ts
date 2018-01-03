import { Component, HostBinding, OnDestroy, OnInit, NgZone, HostListener } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { SecurityService } from '@app/file-manager/services/security.service.ts';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

import { login, logout, selectorAuth, routerTransition } from '@app/core';
import { environment } from '@env/environment';

import { selectorSettings } from './settings';
import { MatDialog, MAT_DIALOG_DATA  } from '@angular/material';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { FilesDatabase } from '@app/file-manager/dbstate/files-database';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { GcsService } from '@app/file-manager/services/gcs.service';

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

  constructor(
    private dialog: MatDialog,
    public overlayContainer: OverlayContainer,
    private store: Store<any>,
    private router: Router,
    private electronService: ElectronService,
    private gcsService: GcsService
  ) {
    AppComponent.updateUserEmail.subscribe(email => {
      this.userEmail = email;
    });
   }

  @HostListener('window:beforeunload')
  checkBeforeClose() {
    event.preventDefault();
    const items = new FilesDatabase(this.store).data.
    filter(item => item.status === ItemStatus.DOWNLOADING || item.status === ItemStatus.UPLOADING);
    if (items.length > 0) {
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
    const items = new FilesDatabase(this.store).data.
    filter(item => item.status === ItemStatus.DOWNLOADING || item.status === ItemStatus.UPLOADING);
    if (items.length > 0) {
      const dialogRef = this.dialog.open(WarningModalComponent, {
        width: '500px',
        disableClose: false,
        data: 'logout'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.exit) {
          this.gcsService.cancelAll();
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }
  logout() {
    const redirect = '/login';
    SecurityService.removeAccessToken();
    this.store.dispatch(logout());
    this.router.navigate([redirect]);
  }
}
