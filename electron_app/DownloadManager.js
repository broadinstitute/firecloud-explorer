const mtd = require('zeltice-mt-downloader');
const Downloader = require('./Downloader');
const path = require('path');
const os = require('os');
const { handleFolder } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;


const service = require('./helpers/downloadInfo').service;

const downloadManager = (items, access_token, win) => {
  let filePath = '';
  items.forEach(item => {
    if (item.preserveStructure) {
      const structurePath = item.path.substring(item.path.lastIndexOf('/'), 0);
      handleFolder(path.join(item.destination, structurePath)).then(result =>
        processDownload(access_token, item, result, win)
      );
    } else {
      processDownload(access_token, item, item.destination, win);
    }
  });
};

const processDownload = (access_token, item, folder, win) => {
  filePath = path.join(folder, item.name);
  var dl_test = new Downloader();
  var dl = dl_test.download(item.mediaLink, filePath, setHeader(access_token));
  dl.start();
  downloadStats(dl, item, win);
};

const setHeader = (access_token) => {
  return {
    count: 8,
    port: 443,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    }
  };
};

module.exports = downloadManager;
