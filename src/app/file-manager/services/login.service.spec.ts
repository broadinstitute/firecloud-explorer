import {TestBed, inject, async} from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { FirecloudService } from '@app/file-manager/services/firecloud.service';
import { LoginService } from '@app/file-manager/services/login.service';
import {ElectronIpcMockService} from '@app/file-manager/services/electron-ipc.mock.service';
import {LoginApiService} from '@app/file-manager/services/login-api.service';
import {FirecloudApiMockService} from '@app/file-manager/services/firecloud-api-mock.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';

let electronService: ElectronIpcApiService;

describe('LoginService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
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
        LoginApiService
      ]
    });
  });

  describe('Create LoginApiService', () => {
    it('should create instance of LoginApiService', inject([LoginApiService], (injectedService: LoginApiService) => {
      expect(injectedService).toBeDefined();
    }));
  });

  describe('LoginApiService login at google', () => {
    it('should make the login', async(inject([LoginApiService], (injectedService: LoginApiService) => {
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
