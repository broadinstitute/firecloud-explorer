if (require('electron-squirrel-startup')) return;

// ./main.js
const { app, BrowserWindow, ipcMain, } = require('electron');
const path = require('path');
const url = require('url');
const {
  downloadManager,
  destroyDownloads
} = require('./electron_app/DownloadManager');
const { ExportS3, testCredentials, exportS3Cancel } = require('./electron_app/ExportS3');
const lazyNodeReader = require('./electron_app/FileSystemReader').lazyNodeReader;
const constants = require('./electron_app/helpers/environment').constants;
const os = require('os');
const {
  GoogleLoginWindow
} = require('./electron_app/GoogleLoginWindow');

const {
  handleDiskSpace
} = require('./electron_app/helpers/handleDisk');
const {
  uploadManager,
  uploadManagerCancel
} = require('./electron_app/UploadManager');

require('dotenv').config();

let loginG = new GoogleLoginWindow();
let win = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'src/assets/icons/png/64x64.png'),
    show: false
  });

  const ses = win.webContents.session;
  ses.setUserAgent(constants.USER_AGENT);

  win.maximize();
  win.setMenu(null);

  // Specify entry point
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Show dev tools
  // Remove this line before distributing
  // win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
  });

  ipcMain.on(constants.IPC_CONFIGURE_ACCOUNT, (event, googleConfig, googleOptions) => {
    this.googleConfig = googleConfig;
    this.googleOptions = googleOptions;
  });

  // ----- Google auth -----
  ipcMain.on(constants.IPC_GOOGLE_AUTH, (event, googleConfig, googleOptions) => {
    loginG = new GoogleLoginWindow(googleOptions, googleConfig, win, app);
    loginG.doLogin();
  });

  ipcMain.on(constants.IPC_GOOGLE_LOGOUT, () => {
    loginG.logOut();
  });

  ipcMain.on(constants.IPC_START_DOWNLOAD, (event, items, access_token) => {
    downloadManager(items, access_token, win);
  });

  ipcMain.on(constants.IPC_START_UPLOAD, (event, bucketName, files, access_token) => {
    uploadManager(bucketName, files, access_token, win);
  });

  ipcMain.on(constants.IPC_UPLOAD_CANCEL, (event, file, access_token) => {
    uploadManagerCancel(file, access_token);
  });

  ipcMain.on(constants.IPC_DOWNLOAD_CANCEL, (event) => {
    destroyDownloads();
  });

  ipcMain.on(constants.IPC_GET_NODE_CONTENT, (event, nodePath) => {
    if (nodePath === '/') {
      nodePath = os.homedir();
    }
    var files = lazyNodeReader(nodePath, []);

    win.webContents.send(constants.IPC_GET_NODE_CONTENT, {
      result: files,
      nodePath: nodePath
    });
  });

  ipcMain.on(constants.IPC_VERIFY_BEFORE_DOWNLOAD, (event, destination, totalFilesSize) => {
    handleDiskSpace(destination, totalFilesSize).then(
      resolve => {
        win.webContents.send(constants.IPC_VERIFY_BEFORE_DOWNLOAD, resolve.error, resolve.errorMessage);
      },
      error => {
        console.error('An error ocurred trying to get diskspace and write permissions. ' + error);
      }
    );
  });

  // ----- Export from GCS to S3 ------
  ipcMain.on(constants.IPC_EXPORT_S3, (event, data) => {
    ExportS3(win, data, app);
  });

  ipcMain.on(constants.IPC_EXPORT_S3_CANCEL, (event) => {
    exportS3Cancel();
  });

  ipcMain.on(constants.IPC_AWS_HANDLE_CREDENTIALS, (event, credentials) => {
    testCredentials(credentials).then(
      () => {
        win.webContents.send(constants.IPC_AWS_HANDLE_CREDENTIALS, null);
      },
      error => {
        win.webContents.send(constants.IPC_AWS_HANDLE_CREDENTIALS, error);
      });
  });

});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  process.exit();
  app.exit(0);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rej at Promise:', p, '', reason);
});