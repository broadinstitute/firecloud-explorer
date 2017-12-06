const mtd = require('zeltice-mt-downloader');
const Downloader = require('./Downloader');
const path = require('path');
const os = require('os');
const handleEvents = require('./helpers/handleEvents');
const printStats = require('./helpers/printStats');
const handleFolder = require('./helpers/handleDisk');

let downElements = [];

const downloadManager = (items, access_token) => {
  let filePath = '';
  const options = setHeader(access_token);
  items.forEach(item => {
    if (item.preserveStructure) {
      const structurePath = item.path.substring(item.path.lastIndexOf('/'), 0);
      handleFolder(path.join(item.destination, structurePath)).then(result =>
        processDownload(access_token, item, result)
      );
    } else {
      processDownload(access_token, item, item.destination);
    }
  });
};
const registerDlEvents = (num, dl) => {
  handleEvents(dl, num);
  printStats(dl, num);
};

const processDownload = (access_token, item, folder) => {
  filePath = path.join(folder, item.name);
  if (downElements.indexOf(filePath) === -1) {
    downElements.push(filePath);
    var dl_test = new Downloader();
    var dl = dl_test.download(item.mediaLink, filePath, setHeader(access_token));
    dl.start();
    handleEvents(dl, item.name);
    printStats(dl, item.name);
  }
};

const setHeader = (access_token) => {
  return {
    count: 8,
    port: 443,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    },
    onStart: function (meta) {
      console.log('Download started');
    },
    onEnd: function (err, result) {
      if (err) console.error(err);
      else {
        console.log('Download Complete');
      }
    }
  };
};

module.exports = downloadManager;
