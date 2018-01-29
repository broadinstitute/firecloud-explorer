// ./main.js
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
import * as path from 'path';
import * as url from 'url';
import * as electronOauth2 from 'electron-oauth2';
import * as os from 'os';
import { UploadManagerClass } from './electron_app/UploadManager';
import { DownloadManagerClass } from './electron_app/DownloadManager';
const dialog = require('dialog');
const lazyNodeReader = require('./electron_app/FileSystemReader').lazyNodeReader;
const constants = require('./electron_app/helpers/enviroment').constants;
const progress_stream = require('./node_modules/progress-stream');
const fs = require('fs');
const { handleDiskSpace } = require('./electron_app/helpers/handleDisk');
require('dotenv').config();
if (require('electron-squirrel-startup')) { app.quit(); }

let win = null;
const downloadManager = new DownloadManagerClass();
const uploadManager = new UploadManagerClass();

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
  // win.webContents.openDevTools()
  win.once('ready-to-show', () => {
    win.show();
  });

  // ----- Google auth -----
  const googleConfig = {};
  const googleOptions = {};

  const windowParams = {
    parent: win,
    modal: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    }
  };

  const promiseTimeout = function (ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in ' + ms + 'ms.');
      }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]);
  };

  ipcMain.on(constants.IPC_CONFIGURE_ACCOUNT, (event, config, opt) => {
    this.googleConfig = config;
    this.googleOptions = opt;
  });

  ipcMain.on(constants.IPC_GOOGLE_AUTH, (event, config, options) => {
    const myApiOauth = electronOauth2(config, windowParams);

    const doLogin = function () {
      return myApiOauth.getAccessToken(options);
    };

    // Apply a timeout of 15 seconds to doLogin
    const doIt = promiseTimeout(150000, doLogin());

    // Wait for the promise to get resolved
    doIt.then(
      token => {
        // use your token.access_token
        win.webContents.send(constants.IPC_GOOGLE_LOGIN, {
          result: token
        });
      },
      reason => {
        dialog.warn('There was an error while trying to connect to Google. ' +
        'Please check your internet connection and try again.', function (exitCode) {
          if (process.platform !== 'darwin') {
            app.quit();
          }
          process.exit();
          app.exit(0);
        });
      }
    );
  });

  // ----- Google auth -----

  ipcMain.on(constants.IPC_START_DOWNLOAD, (event, items, access_token) => {
    downloadManager.downloadManager(items, access_token, win);
  });

  ipcMain.on(constants.IPC_START_UPLOAD, (event, bucketName, files, access_token) => {
    uploadManager.uploadManager(bucketName, files, access_token, win);
  });

  ipcMain.on(constants.IPC_UPLOAD_CANCEL, (event, file, access_token) => {
    uploadManager.uploadManagerCancel();
  });

  ipcMain.on(constants.IPC_DOWNLOAD_CANCEL, (event) => {
    downloadManager.destroyDownloads();
  });

  ipcMain.on(constants.IPC_GET_NODE_CONTENT, (event, nodePath) => {
    if (nodePath === '/') {
      nodePath = os.homedir();
    }
    const files = lazyNodeReader(nodePath, []);

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
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  process.exit();
  app.exit(0);
});

process.on('loaded', (reason, p) => {
  console.log('Unhandled Rej at Promise:', p, '', reason);
});
