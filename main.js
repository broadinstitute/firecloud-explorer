// ./main.js
//const OAuth2Provider = require("electron-oauth-helper");
const { OAuth2Client } = require('google-auth-library');

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
const path = require('path');
const url = require('url');
//const { electronOauth2 } = require('electron-oauth-helper');
const {
  downloadManager,
  destroyDownloads
} = require('./electron_app/DownloadManager');
const lazyNodeReader = require('./electron_app/FileSystemReader').lazyNodeReader;
const constants = require('./electron_app/helpers/enviroment');
const os = require('os');
const {
  handleDiskSpace
} = require('./electron_app/helpers/handleDisk');
const {
    uploadManager,
    uploadManagerCancel
} = require('./electron_app/UploadManager');

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
  win.setMenu(null);

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
  //  win.webContents.openDevTools()

  // ----- Google auth -----
  //var googleConfig = {};
  var googleOptions = {};

  const googleConfig = {
    clientId: '60387149286-vj4e50v7dneg598m9ead6jqtu67ifj2p.apps.googleusercontent.com',
    clientSecret: 'c8Gc0oD4Eof7xL95rMrPP1N7',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
    useBasicAuthorizationHeader: false,
    redirectUri: 'http://localhost:4200'
  };

  const myApiOauth = new OAuth2Client(googleConfig);

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

  ipcMain.on(constants.IPC_CONFIRGURE_ACCOUNT, (event, googleConfig, googleOptions) => {
    this.googleConfig = googleConfig;
    this.googleOptions = googleOptions;
  });

  ipcMain.on(constants.IPC_GOOGLE_AUTH, (event) => {
    //const myApiOauth = new electronOauth2(this.googleConfig);
    
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
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
  process.exit();
  app.exit(0);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rej at Promise:', p, '',reason);
});
