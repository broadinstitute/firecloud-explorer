const electronOauth2 = require('electron-oauth2');
const constants = require('./helpers/enviroment').constants;

class GoogleLoginWindow {
  static createOauth2Window(win) {
    return {
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
  }
  constructor(googleOptions, googleConfig, win, app, isLoggedIn) {
    this.googleOptions = googleOptions || null;
    this.googleConfig = googleConfig || null;
    this.myApiOauth = electronOauth2(this.googleConfig, GoogleLoginWindow.createOauth2Window(win)) || null;
    this.win = win || null;
    this.app = app || null;
    this.isLoggedIn = isLoggedIn || false;
    return this;
  }

  accessToken() {
     return this.myApiOauth.getAccessToken(this.googleOptions);
  }

  doLogin() {
    let doIt = this.promiseTimeout(150000, this.accessToken());
    // Wait for the promise to get resolved
    doIt.then(
      token => { // use your token.access_token
        this.relogin();
        this.win.webContents.send(constants.IPC_GOOGLE_LOGIN, { result: token });
      },
      reason => {
        dialog.warn('There was an error while trying to connect to Google. Please check your internet connection and try again.',
          (exitCode) => {
            if (process.platform !== 'darwin') {
              this.app.quit();
            }
            process.exit();
            this.app.exit(0);
          });
      }
    );
  }

  promiseTimeout(ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in ' + ms + 'ms.')
      }, ms)
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
  };

  relogin() {
    const winRelogin = {
      modal: false,
      frame: false,
      resizable: false,
      alwaysOnTop: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      },
      show: false,
      visible: false,
      transparent: true,
      width: 0,
      height: 0,
    };

      let timer = setInterval( () => {
        if (!this.isLoggedIn) {
          let apiOauth = electronOauth2(this.googleConfig, winRelogin);
          const resp = apiOauth.getAccessToken(this.googleOptions);
          resp.then( token => { this.win.webContents.send(constants.IPC_GOOGLE_LOGIN, {result: token}); });
        } else {
          clearInterval(timer);
          timer = null;
        }
      }, 3000000);
  }

  logOut() {
    this.isLoggedIn = true;
  }
}

module.exports = { GoogleLoginWindow };
