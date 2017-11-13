// ./main.js
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path');
const url = require('url');
const electronOauth2 = require('electron-oauth2');

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
  if (process.env.PACKAGE === 'true'){
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
  // win.webContents.openDevTools()

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

  ipcMain.on('configure-gaccount', (event, googleConfig, googleOptions) => {
    this.googleConfig = googleConfig;
    this.googleOptions = googleOptions;
  });

  ipcMain.on('google-oauth', (event) => {
    const myApiOauth = electronOauth2(this.googleConfig, windowParams);
    myApiOauth.getAccessToken(this.googleOptions)
    .then(token => {
      // use your token.access_token 
        win.webContents.send('sendRendererMessage', { result: token });
    })
    .catch((reason) => console.warn('Google Pop-up Warning ' + reason));
  });
  // ----- Google auth -----

});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
