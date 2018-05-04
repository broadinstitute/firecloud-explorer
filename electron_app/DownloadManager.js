const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder, fileAlreadyExists } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents');
const environment = require('./helpers/environment');
const fs = require('fs');

let filePath = '';
let allDownloads = [];
let itemsName = [];

const downloadManager = (items, access_token, electronWin) => {
  items.forEach(item => {
    let fileExists = false;
    let count = 0;
    let fileName = item.displayName;
    let fileExistsDirectory = false;

    if (!item.preserveStructure && itemsName.indexOf(fileName) > -1) {
      fileExistsDirectory = true;
    }
    itemsName.push(fileName);
    const destination = item.preserveStructure ?
      path.join(item.destination, item.path.substring(item.path.lastIndexOf('/'), 0)) : item.destination;

    do {
      // if (!fileExists) {
      let filePath = path.join(destination, fileName).split("\\").join("\\\\");
      if (fileExistsDirectory || exists(filePath) || exists(filePath.concat('.mtd'))) {
        count++;
        fileName = item.displayName.substring(0, item.displayName.indexOf('.')) + '(' + (count) + ')' +
          item.displayName.substring(item.displayName.indexOf('.'));
        fileExists = true;
        fileExistsDirectory = false;
      }
      else {
        fileExists = false;
        fileExistsDirectory = false;

        item.displayName = fileName;
        itemsName.push(fileName);
        handleFolder(destination, (result) => {
          allDownloads.push(processDownload(access_token, item, result, electronWin));
        });

      }

    } while (fileExists);
    // item.displayName = fileName;

    // handleFolder(destination, (result) => {
    //   allDownloads.push(processDownload(access_token, item, result, electronWin));
    // });

  });
};

const exists = (filePath) => {
  let result = false;
  try {
    fs.statSync(filePath);
    result = true;
  } catch (error) {
    if (!error.errno === FILE_DOESNT_EXIST || error.errno === FILE_ALREADY_EXISTS) {
      result = true;
    }
  } finally {
    return result;
  }
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
