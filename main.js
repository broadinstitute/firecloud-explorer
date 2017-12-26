// ./main.js
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
const path = require('path');
const url = require('url');
const electronOauth2 = require('electron-oauth2');
const downloadManager = require('./electron_app/DownloadManager');
const lazyFileSystemReader = require('./electron_app/FileSystemReader').lazyFileSystemReader;
const lazyNodeReader = require('./electron_app/FileSystemReader').lazyNodeReader;
const recursiveFileSystemReader = require('./electron_app/FileSystemReader').recursiveFileSystemReader;
const constants = require('./electron_app/helpers/enviroment');
const uploadManager = require('./electron_app/UploadManager');
const fs = require('fs');
const os = require('os');
const {
  handleDiskSpace
} = require('./electron_app/helpers/handleDisk');

require('dotenv').config();

let win = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'src/assets/icons/png/64x64.png')
  });

  win.maximize();
  // win.setMenu(null);

  // Specify entry point
  if (process.env.PACKAGE === 'true') {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    win.loadURL(process.env.HOST);
  }
  // Show dev tools
  // Remove this line before distributing
   win.webContents.openDevTools()

  // Remove window once app is closed
  win.on('closed', function () {
    app.quit();
    win = null;
  });

  // ----- Google auth -----
  var googleConfig = {};
  var googleOptions = {};

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
  }

  ipcMain.on(constants.IPC_CONFIRGURE_ACCOUNT, (event, googleConfig, googleOptions) => {
    this.googleConfig = googleConfig;
    this.googleOptions = googleOptions;
  });

  ipcMain.on(constants.IPC_GOOGLE_AUTH, (event) => {
    const myApiOauth = electronOauth2(this.googleConfig, windowParams);
    myApiOauth.getAccessToken(this.googleOptions)
      .then(token => {
        // use your token.access_token 
        win.webContents.send(constants.IPC_SEND_RENDERER, {
          result: token
        });
      })
      .catch((reason) => console.warn('Google Pop-up Warning ' + reason));
  });
  // ----- Google auth -----

  ipcMain.on(constants.IPC_START_DOWNLOAD, (event, items, access_token) => {
    downloadManager(items, access_token, win);
  });

  ipcMain.on(constants.IPC_START_UPLOAD, (event, bucketName, files, access_token) => {
    uploadManager(bucketName, files, access_token);
  });

  ipcMain.on(constants.IPC_GET_FILESYSTEM, (event, folderPath) => {
    let home = os.homedir() + path.sep + 'Documents';
    let files = recursiveFileSystemReader(home /*folderPath*/ , []);
    win.webContents.send(constants.IPC_GET_FILESYSTEM, {
      result: files
    });
  });

  ipcMain.on(constants.IPC_GET_NODE_CONTENT, (event, nodePath) => {
    console.log("nodePath: " + nodePath);
    if (nodePath === '/') {
      nodePath = os.homedir();
    }
    console.log('------------------------------- ' + nodePath);
    var files = lazyNodeReader(nodePath, []);

    win.webContents.send(constants.IPC_GET_NODE_CONTENT, {
      result: files
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

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
  process.exit();
  app.exit(0);
});

app.on('before-quit', () => {
  win = null;
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rej at Promise:', p, '', reason);
});
