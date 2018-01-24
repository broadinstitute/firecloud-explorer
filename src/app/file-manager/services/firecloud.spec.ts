import {FirecloudApiService} from '@app/file-manager/services/firecloud-api.service';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { mockResponseWorkspace, mockResponseFailedLogin, mockResponseAllPublic } from '../../../assets/demo/workspaceMockData';
import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('FireCloud service for Workspace', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FirecloudApiService]
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  describe('Gets workspaces', () => {
    it('returns private workspaces', inject([HttpClient, HttpTestingController],
      (http: HttpClient, httpMock: HttpTestingController) => {
        const dataWorkspace = [{
          'public': false,
          'accessLevel': 'WRITER',
          'bucketName': 'fc-cc2c469c-0cf7-4a46-bed5-d1a7f7ab1264',
          'name': 'FCDownloadClient_Workspace1'
        }];


        const firecloudService = getTestBed().get(FirecloudApiService);
        firecloudService.constructor(http);
        firecloudService.getUserFirecloudWorkspaces(false).subscribe(
          workspaces => {
            expect(workspaces.length).toBe(1);
            expect(workspaces).toEqual(dataWorkspace);
          });

        const req = httpMock.expectOne(environment.FIRECLOUD_API + 'api/workspaces');
        expect(req.request.method).toBe('GET');
        req.flush((mockResponseWorkspace));
        httpMock.verify();

      }));

    it('should not have any workspaces', inject([HttpClient, HttpTestingController],
      (http: HttpClient, httpMock: HttpTestingController) => {

        const firecloudService = getTestBed().get(FirecloudApiService);
        firecloudService.constructor(http);
        firecloudService.getUserFirecloudWorkspaces(false).subscribe(
          workspaces => {
            expect(workspaces.length).toBe(0);
            expect(workspaces).toEqual([]);
          });

        const req = httpMock.expectOne(environment.FIRECLOUD_API + 'api/workspaces');
        expect(req.request.method).toBe('GET');
        req.flush((mockResponseAllPublic));
        httpMock.verify();

      }));
  });

  describe('Get the user status', () => {
      it('asks if the users is registered in FireCloud', inject([HttpClient, HttpTestingController],
        (http: HttpClient, httpMock: HttpTestingController) => {
          const mockResponse = {
            'userInfo': {
              'userSubjectId': '111111111111111111',
              'userEmail': 'user_1@broadinstitute.org'
            },
            'enabled': {
              'google': true,
              'ldap': true,
              'allUsersGroup': true
            }
          };
          const firecloudService = getTestBed().get(FirecloudApiService);
          firecloudService.constructor(http);
          firecloudService.getUserRegistrationStatus().subscribe(resp => {
            expect(resp).toEqual(mockResponse);
          });

          const req = httpMock.expectOne(environment.FIRECLOUD_API + 'me');
          expect(req.request.method).toBe('GET');
          req.flush((mockResponse));
          httpMock.verify();

        }));

    it('should fail when the user is not registered in FireCloud', inject([HttpClient, HttpTestingController],
      (http: HttpClient, httpMock: HttpTestingController) => {
        const firecloudService = getTestBed().get(FirecloudApiService);
        firecloudService.constructor(http);
        firecloudService.getUserRegistrationStatus().subscribe(resp => {
          expect(resp.status).toEqual(404);
          expect(resp.message).toEqual('Http failure response for https://api.firecloud.org/me: 404 OK');
        });

        const req = httpMock.expectOne(environment.FIRECLOUD_API + 'me');
        expect(req.request.method).toBe('GET');
        req.flush((mockResponseFailedLogin));
        httpMock.verify();

      }));
    });
});
