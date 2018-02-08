import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { SettingsModule } from '../../settings';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginService } from '@app/file-manager/services/login.service';
import { FirecloudApiMockService } from '@app/file-manager/services/firecloud-api-mock.service';
import { LoginMockService } from '@app/file-manager/services/login.service-mock';
import { ElectronIpcService } from '@app/file-manager/services/electron-ipc.service';
import { ElectronIpcMockService } from '@app/file-manager/services/electron-ipc.mock.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';
import { GoogleLoginService } from '@app/file-manager/services/login-google.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';

class RouterStub {
  navigate(URL: any[]) {
    return URL;
  }
}

describe('LoginComponent', () => {
  const failResp =  new Response(
    { 'headers':
        {
          'normalizedNames': {},
          'lazyUpdate': null
        },
      'status': 404,
      'statusText': 'OK',
      'url': 'https://api.firecloud.org/me',
      'ok': false,
      'name': 'HttpErrorResponse',
      'message': 'Http failure response for https://api.firecloud.org/me: 404 OK',
      'error': {
        'statusCode': 404,
        'source': 'FireCloud',
        'timestamp': 1516430257842,
        'causes': [],
        'stackTrace': [],
        'message': 'FireCloud user registration not found'
      }
    }
  );

  let component: LoginComponent;
  let loginComponent: ComponentFixture<LoginComponent>;
  let electronIpc: ElectronIpcService;
  let loginService: LoginService;
  let routerMod: Router;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        BrowserAnimationsModule,
        // core & shared
        CoreModule,
        SharedModule,

        // features
        SettingsModule,
        RouterTestingModule
      ],
      providers: [
        FirecloudApiService,
        GoogleLoginService,
        ElectronIpcApiService,
        RouterStub
      ]
    });

    TestBed.overrideComponent(LoginComponent, {
      set: {
        providers: [
          {provide: FirecloudApiService, useClass: FirecloudApiMockService},
          {provide: GoogleLoginService, useClass: LoginMockService},
          {provide: ElectronIpcApiService, useClass: ElectronIpcMockService},
          {provide: Router, useClass: RouterStub}
        ]
      }
    });

    loginComponent = TestBed.createComponent(LoginComponent);
    component = loginComponent.componentInstance;
    loginComponent.detectChanges();
    // electronIpc should be the mocked class
    electronIpc = loginComponent.debugElement.injector.get(ElectronIpcApiService);
    loginService = loginComponent.debugElement.injector.get(GoogleLoginService);
    routerMod = loginComponent.debugElement.injector.get(Router);

    location = TestBed.get(Location);
  }));

  describe('Create LoginComponent', () => {

    it('should create the LoginComponent', () => {
      expect(electronIpc instanceof ElectronIpcMockService).toBeTruthy();
      expect(loginService instanceof LoginMockService).toBeTruthy();
      expect(routerMod instanceof RouterStub).toBeTruthy();
      expect(component).toBeTruthy();
    });

    it('should display the login button', () => {
      loginComponent.detectChanges();
      const compiled = loginComponent.debugElement.nativeElement;
      expect(compiled.querySelector('button').textContent).toContain('Sign In');
    });
  });

  describe('Log the user', () => {
    it('should log', () => {
      component.logIn();
      expect(component.hasError).toBeFalsy();
    });
  });

  describe('Show errors', () => {
    it('should show messages for 401 error code', () => {
      component.showError(401);
      expect(component.msgs[0].summary).toBe('Sorry, your FireCloud account is not authorized yet.');
    });
    it('should show messages for 403 error code', () => {
      component.showError(403);
      expect(component.msgs[0].summary).toBe('Sorry, your FireCloud account has not been activated yet.');
    });
    it('should show messages for 404 error code',  () => {
      spyOn(loginService, 'googleLogin').and.returnValue(Promise.resolve(failResp));
      component.logIn();
      expect(loginService.googleLogin).toHaveBeenCalled();
      component.showError(404);
      expect(component.msgs[0].summary).toBe('Sorry, your Google account is not associated with FireCloud.');
    });
    it('should show default message', () => {
      component.showError(0);
      expect(component.msgs[0].summary).toBe('Sorry, something went wrong.');
    });
  });
});
