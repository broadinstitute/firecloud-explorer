const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder, fileAlreadyExists } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents');
const environment = require('./helpers/environment');

let filePath = '';
let allDownloads = [];
let fileExists = true;

const downloadManager = (items, access_token, electronWin) => {
  items.forEach(item => {
    let count = 0;
    let fileName = item.displayName;
    const destination = item.preserveStructure ?
      path.join(item.destination, item.path.substring(item.path.lastIndexOf('/'), 0)) : item.destination;
    do {
      fileExists = fileAlreadyExists(path.join(destination, fileName));
      if (fileExists) {
        count++;
        fileName = item.displayName.substring(0, item.displayName.indexOf('.')) + '(' + (count) + ')' +
          item.displayName.substring(item.displayName.indexOf('.'));
      }
    } while (fileExists);
    item.displayName = fileName;
    processItem(item, destination, access_token, electronWin);
  });
};

const processItem = (item, itemDestination, token, win) => {
  handleFolder(itemDestination, (result) => {
    allDownloads.push(processDownload(token, item, result, win));
  });
};

const processDownload = (access_token, item, folder, win) => {
  filePath = path.join(folder, item.displayName);
  const dloader = new Downloader();
  const dl = dloader.download(item.mediaLink, filePath, setHeader(access_token));
  dl.start();
  downloadStats(dl, item, win);
  handleEvents(dl, item);
  return dl;
};

const stopAllDownloads = () => {
  allDownloads.forEach(dl => {
    if (dl.status !== 3) {
      dl.stop();
    }
  });
};

const destroyDownloads = () => {
  stopAllDownloads();
  allDownloads.forEach(dl => {
    if (dl.status === -2) {
      dl.destroy();
    }
  });
};

const setHeader = (access_token) => {
  return {
    count: 8,
    port: 443,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    },
    onStart: function (meta) {
      if (environment.TESTING)
        console.log('META', meta);
    }
  };
};

module.exports = { downloadManager, destroyDownloads };
