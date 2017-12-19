const constants = require('./enviroment');
const Downloader = require('../Downloader');


var downloadStats = function(dl, num, win) {
  num = num || 1;
	var timer = setInterval(function() {
    if (dl.status === 0) {
			// possibly creating disk space
		} else if(dl.status == 1) {
			var stats = dl.getStats();
			stats.name = num;
      win.webContents.send(constants.IPC_DOWNLOAD_STATUS, stats);
		} else if(dl.status == 3) {
			// completed
      win.webContents.send(constants.IPC_DOWNLOAD_STATUS, dl.getStats());
		}
		if(dl.status === -1 || dl.status === 3 || dl.status === -3) {
			clearInterval(timer);
			timer = null;
		}
	}, 100);
};

module.exports = { downloadStats };