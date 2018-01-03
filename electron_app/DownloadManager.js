const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents');

let filePath = '';
let allDownloads = [];

const downloadManager = (items, access_token, win) => {
  items.forEach(item => {
    if (item.preserveStructure) {
      const structurePath = item.path.substring(item.path.lastIndexOf('/'), 0);
      handleFolder(path.join(item.destination, structurePath)).then(result => {
        allDownloads.push(processDownload(access_token, item, result, win));
      });
    } else {
      allDownloads.push(processDownload(access_token, item, item.destination, win));
    }
  });
};

const processDownload = (access_token, item, folder, win) => {
  filePath = path.join(folder, item.name);
  let dloader = new Downloader();
  let dl = dloader.download(item.mediaLink, filePath, setHeader(access_token));
  dl.start();
  downloadStats(dl, item, win);
  handleEvents(dl, item);
  return dl;
};

const stopAllDownloads = () => {
  allDownloads.forEach(dl => {
    if(dl.status !== 3) {
      dl.stop();
    }
  });
};

const destroyDownloads = () => {
  stopAllDownloads();
  allDownloads.forEach(dl => {
    if(dl.status === -2){
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
    }
  };
};

module.exports = { downloadManager, destroyDownloads };
