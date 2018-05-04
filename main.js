if (require('electron-squirrel-startup')) return;

// ./main.js
const { app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const url = require('url');
const {
  downloadManager,
  destroyDownloads
} = require('./electron_app/DownloadManager');
const { ExportS3, testS3Credentials, exportS3Cancel } = require('./electron_app/ExportS3');
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
const {
  exportGCPManager,
  exportGCPManagerCancel
} = require('./electron_app/ExportGCPManager');

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
  win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
  });

  if (process.platform === 'darwin') {
    // Create our menu entries so that we can use MAC shortcuts

    var template = [{
      label: app.getName(),
      submenu: [
        { label: "About " + app.getName(), selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
      ]
    }, {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "Cmd+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Cmd+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Cmd+X", selector: "cut:" },
        { label: "Copy", accelerator: "Cmd+C", selector: "copy:" },
        { label: "Paste", accelerator: "Cmd+V", selector: "paste:" },
        { label: "Select All", accelerator: "Cmd+A", selector: "selectAll:" }
      ]
    }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  };

  ipcMain.on(constants.IPC_EXPORT_TO_GCP_START, (event, destinationBucket, files, access_token) => {
    exportGCPManager(destinationBucket, files, access_token, win);
  });
  

  ipcMain.on(constants.IPC_EXPORT_TO_GCP_CANCEL, (event, file, access_token) => {
    exportGCPManagerCancel(file, access_token);
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

  ipcMain.on(constants.IPC_DOWNLOAD_START, (event, items, access_token) => {
    downloadManager(items, access_token, win);
  });

  ipcMain.on(constants.IPC_UPLOAD_START, (event, bucketName, files, access_token) => {
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
  ipcMain.on(constants.IPC_EXPORT_TO_S3_START, (event, data) => {
    ExportS3(win, data, app);
  });

  ipcMain.on(constants.IPC_EXPORT_TO_S3_CANCEL, (event) => {
    exportS3Cancel();
  });

  ipcMain.on(constants.IPC_AWS_HANDLE_CREDENTIALS, (event, credentials) => {
    testS3Credentials(credentials).then(
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

process.on('uncaughtException', function (error) {
  console.log(error);
});
