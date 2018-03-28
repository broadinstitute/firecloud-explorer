const psjon = require('../../package-lock.json');
const userAgent = psjon.name + '/' + psjon.version;
const constants ={
  IPC_GOOGLE_AUTH: 'google-oauth',
  IPC_GOOGLE_LOGIN: 'google-login',
  IPC_START_DOWNLOAD: 'start-download',
  IPC_CONFIGURE_ACCOUNT: 'configure-gaccount',
  IPC_DOWNLOAD_STATUS: 'download-status',
  IPC_DOWNLOAD_COMPLETED: 'download-completed',
  IPC_GET_FILESYSTEM: 'get-filesystem',
  IPC_GET_NODE_CONTENT: 'get-node-content',
  IPC_START_UPLOAD: 'start-upload',
  GOOGLE_API: 'https://www.googleapis.com/upload/storage/v1/b/',
  IPC_VERIFY_BEFORE_DOWNLOAD: 'verify-before-download',
  IPC_UPLOAD_STATUS: 'upload-status',
  IPC_UPLOAD_CANCEL: 'upload-cancelGCPExports',
  IPC_DOWNLOAD_CANCEL: 'download-cancelGCPExports',
  IPC_GOOGLE_LOGOUT: 'google-revoke-auth',
  GOOGLE_LOGOUT_URL: 'https://accounts.google.com/logout?continue=http://google.com',
  IPC_EXPORT_S3: 'export-s3',
  IPC_EXPORT_S3_CANCEL: 'export-s3-cancel',
  IPC_EXPORT_S3_DOWNLOAD_STATUS: 'download-s3',
  IPC_AWS_HANDLE_CREDENTIALS: 'aws-handle-credentials',
  USER_AGENT: userAgent + '/Electron',
  TESTING: false,
};

module.exports = { constants };