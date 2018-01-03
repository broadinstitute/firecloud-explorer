var LoginPage = function () {
    var app;

    this.signInId = '#signIn';
    this.titleId = '#title';
    this.errorId = '.ui-messages-summary';
    this.error401 = 'Sorry, your FireCloud account is not authorized yet.';
    this.error403 = 'Sorry, your FireCloud account has not been activated yet.';
    this.error404 = 'Sorry, your Google account is not associated with FireCloud.';
    this.error500 = 'Sorry, something went wrong.'; 

    this.setApp = function(app) {
        this.app = app;
    }

    this.getTitleText = function() {
        return this.app.client.getText(this.titleId);
    }

    this.getButtonText = function() {
        return this.app.client.getText(this.signInId);
    }
}

module.exports = LoginPage;