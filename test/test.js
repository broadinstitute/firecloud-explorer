const Application = require('spectron').Application;
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const loginPage = require('./pageObjects/login.page.js');

var LoginPage = new loginPage();

var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

if (process.platform === 'win32') {
    electronPath += '.cmd';
}

var appPath = path.join(__dirname, '..');

var app = new Application({
            path: electronPath,
            args: [appPath]
        });

global.before(function () {
    chai.should();
    chai.use(chaiAsPromised);
    LoginPage.setApp(app);
});

describe('FireCloud Explorer', function () {

    this.timeout(10000);

    beforeEach(function () {
        return app.start();
    });
  
    afterEach(function () {
        return app.stop();
    });
  
    it('opens a window', function () {
      return app.client.waitUntilWindowLoaded()
        .getWindowCount().should.eventually.equal(1);
    });

    it('shows title', function () {
        return LoginPage.getTitleText().should.eventually.equal("FireCloud Explorer");
    }); 

    it('check button text', function () {
        return LoginPage.getButtonText().should.eventually.equal("Sign In");
    });

    it('clicks Sign In', function () {
        return app.client
        .click(LoginPage.signInId)
        .getText(LoginPage.errorId).should.eventually.equal(LoginPage.error401)
    }); 
  
});
  
