const psjon = require('../../package-lock.json');
const userAgent = psjon.name + '/' + psjon.version;
const constants = {

  IPC_GOOGLE_AUTH: 'google-oauth',
  IPC_GOOGLE_LOGIN: 'google-login',
  IPC_CONFIGURE_ACCOUNT: 'configure-gaccount',

  IPC_DOWNLOAD_START: 'download-start',
  IPC_DOWNLOAD_CANCEL: 'download-cancel',
  IPC_DOWNLOAD_STATUS: 'download-status',
  IPC_DOWNLOAD_FAILED: 'download-failed',
  IPC_DOWNLOAD_COMPLETE: 'download-complete',

  IPC_GET_FILESYSTEM: 'get-filesystem',
  IPC_GET_NODE_CONTENT: 'get-node-content',
  GOOGLE_API: 'https://www.googleapis.com/upload/storage/v1/b/',
  IPC_VERIFY_BEFORE_DOWNLOAD: 'verify-before-download',

  IPC_UPLOAD_START: 'upload-start',
  IPC_UPLOAD_CANCEL: 'upload-cancel',
  IPC_UPLOAD_STATUS: 'upload-status',
  IPC_UPLOAD_FAILED: 'upload-failed',
  IPC_UPLOAD_COMPLETE: 'upload-complete',

  IPC_GOOGLE_LOGOUT: 'google-revoke-auth',
  GOOGLE_LOGOUT_URL: 'https://accounts.google.com/logout?continue=http://google.com',

  IPC_EXPORT_TO_S3_START: 'export-to-s3-start',
  IPC_EXPORT_TO_S3_CANCEL: 'export-to-s3-cancel',
  IPC_EXPORT_TO_S3_STATUS: 'export-to-s3-status',
  IPC_EXPORT_TO_S3_FAILED: 'export-to-s3-failed',
  IPC_EXPORT_TO_S3_COMPLETE: 'export-to-s3-complete',

  IPC_AWS_HANDLE_CREDENTIALS: 'aws-handle-credentials',
  USER_AGENT: userAgent + '/Electron',
  TESTING: false,

  IPC_EXPORT_TO_GCP_START: 'export-to-gcp-start',
  IPC_EXPORT_TO_GCP_CANCEL: 'export-to-gcp-cancel',
  IPC_EXPORT_TO_GCP_STATUS: 'export-to-gcp-status',
  IPC_EXPORT_TO_GCP_FAILED: 'export-to-gcp-failed',
  IPC_EXPORT_TO_GCP_COMPLETE: 'export-to-gcp-complete',

  GCP_API: 'https://www.googleapis.com/storage/v1/b/'
};

module.exports = { constants };
