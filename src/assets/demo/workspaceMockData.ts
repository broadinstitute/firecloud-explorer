export const mockResponseWorkspace = [
  {
    'workspaceSubmissionStats': { 'runningSubmissionsCount': 0 },
    'accessLevel': 'READER',
    'owners': ['user_1@broadinstitute.org'],
    'public': true, 'workspace': {
      'workspaceId': '5b3e0063-060f-e42b-1291-7a5f601145e7',
      'name': 'TARGET_RT_hg38_OpenAccess_GDCDR-8-0_DATA',
      'isLocked': true,
      'lastModified': '2017-09-25T18:18:35.344Z',
      'createdBy': 'user_1@broadinstitute.org',
      'authDomainACLs': {
        'OWNER': {
          'groupName': '0111f81$-ab9e-4d2c-ac16-0b5d92227c6e-OWNER'
        },
        'PROJECT_OWNER': {
          'groupName': 'owner@broad-firecloud-tcga@billing-project'
        },
        'READER': {
          'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-READER'
        },
        'WRITER': {
          'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-WRITER'
        }
      },
      'bucketName': 'fc-0111f819-ab9e-4d2c-ac16-0b5d92227c6e',
      'namespace': 'broad-firecloud-tcga',
      'authorizationDomain': [],
      'createdDate': '2017-09-25T15:39:43.120Z',
      'accessLevels': {
        'OWNER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-OWNER'},
        'PROJECT_OWNER': { 'groupName': 'owner@broad-firecloud-tcga@billing-project'},
        'READER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-READER' },
        'WRITER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-WRITER' }
      }
    }
  },
  {
    'workspaceSubmissionStats': { 'runningSubmissionsCount': 0 },
    'accessLevel': 'WRITER',
    'owners': ['user_1@broadinstitute.org'],
    'public': false,
    'workspace': {
      'workspaceId': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e',
      'name': 'FCDownloadClient_Workspace1',
      'isLocked': true,
      'lastModified': '2017-09-25T18:18:35.344Z',
      'createdBy': 'user_1@broadinstitute.org',
      'authDomainACLs': {
        'OWNER': {
          'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-OWNER'
        },
        'PROJECT_OWNER': {
          'groupName': 'owner@broad-firecloud-tcga@billing-project'
        },
        'READER': {
          'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-READER'
        },
        'WRITER': {
          'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-WRITER'
        }
      },
      'bucketName': 'fc-cc2c469c-0cf7-4a46-bed5-d1a7f7ab1264',
      'namespace': 'broad-firecloud-tcga',
      'authorizationDomain': [],
      'createdDate': '2017-09-25T15:39:43.120Z',
      'accessLevels': {
        'OWNER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-OWNER'},
        'PROJECT_OWNER': { 'groupName': 'owner@broad-firecloud-tcga@billing-project'},
        'READER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-READER' },
        'WRITER': { 'groupName': '0111f819-ab9e-4d2c-ac16-0b5d92227c6e-WRITER' }
      }
    }
  }];

export const mockResponseAllPublic = [
  {
    'workspaceSubmissionStats': { 'runningSubmissionsCount': 0 },
    'accessLevel': 'READER',
    'owners': ['user_1@broadinstitute.org'],
    'public': true,
  },
  {
    'workspaceSubmissionStats': { 'runningSubmissionsCount': 0 },
    'accessLevel': 'READER',
    'owners': ['user_1@broadinstitute.org'],
    'public': true,
  }];

export const mockResponseFailedLogin = {
  'headers': {
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
    'timestamp': 1516209716523,
    'causes': [],
    'stackTrace': [],
    'message': 'FireCloud user registration not found'
  }
};
