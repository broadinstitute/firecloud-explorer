import {TestBed, inject, async} from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { LoginService } from '@app/file-manager/services/login.service';
import { ElectronIpcMockService } from '@app/file-manager/services/electron-ipc.mock.service';
import { GoogleLoginService } from '@app/file-manager/services/login-google.service';
import { FirecloudApiMockService } from '@app/file-manager/services/firecloud-api-mock.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

let electronService: ElectronIpcApiService;

describe('LoginService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ElectronIpcApiService, useClass: ElectronIpcMockService
        },
        {
          provide: Store,
        },
        {
          provide: FirecloudApiService, useClass: FirecloudApiMockService,
        },
        GoogleLoginService
      ]
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  describe('Create GoogleLoginService', () => {
    it('should create instance of GoogleLoginService', inject([GoogleLoginService], (injectedService: GoogleLoginService) => {
      expect(injectedService).toBeDefined();
    }));
  });

  describe('GoogleLoginService login at google', () => {
    it('should make the login', async(inject([GoogleLoginService], (injectedService: GoogleLoginService) => {
      electronService = TestBed.get(ElectronIpcApiService);
      spyOn(electronService, 'googleTokenLogin').and.returnValue(Promise.resolve(new Response()));
      injectedService.googleLogin().then(
        reg => {
          expect(reg).toBe(new Response());
        },
        err => { }
      );
      expect(electronService.googleTokenLogin).toHaveBeenCalled();
    })));

  });

});
