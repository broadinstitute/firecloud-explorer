import { Component, HostBinding, OnDestroy, OnInit, NgZone } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { SecurityService } from '@app/file-manager/services/security.service.ts';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Router } from '@angular/router';

import { login, logout, selectorAuth, routerTransition } from '@app/core';
import { environment as env } from '@env/environment';

import { selectorSettings } from './settings';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition],
})
export class AppComponent implements OnInit, OnDestroy {

  public static updateUserEmail: Subject<boolean> = new Subject();
  private unsubscribe$: Subject<void> = new Subject<void>();
  userEmail: String;

  title = 'app';

  @HostBinding('class') componentCssClass;

  year = new Date().getFullYear();
  isAuthenticated;

  constructor(
    public overlayContainer: OverlayContainer,
    private store: Store<any>,
    private router: Router,
    private zone: NgZone
  ) {
    AppComponent.updateUserEmail.subscribe(res => {
      this.userEmail = localStorage.getItem('userEmail');
    });
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

  onLogoutClick() {
    const redirect = '/login';
    SecurityService.removeAccessToken();
    this.store.dispatch(logout());
    this.router.navigate([redirect]);
  }

}
