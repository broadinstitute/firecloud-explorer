const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder, fileAlreadyExists } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents').handleEvents;
const environment = require('./helpers/environment');

let filePath = '';
let allDownloads = [];
let allNameItems = [];
let fileExists = true;
let itemsToRemove = [];

const downloadManager = (items, access_token, electronWin) => {

  items.forEach(item => {

    let count = 0;
    let fileName = item.displayName;
    console.log(item.path);

      const destination = item.preserveStructure ?
        path.join(item.destination, item.path.substring(item.path.lastIndexOf('/'), 0)) : item.destination;

    // resume the download if mtd exists already in the array
    if (!allNameItems.includes(destination)) {
      allNameItems.push(destination);

      do {
        fileExists = fileAlreadyExists(path.join(destination, fileName));
        if (fileExists) {
          count++;
          fileName = item.displayName.substring(0, item.displayName.indexOf('.')) + '(' + (count) + ')' +
            item.displayName.substring(item.displayName.indexOf('.'));
        }
      } while (fileExists);

      item.displayName = fileName;

      handleFolder(destination, (result) => {
        allDownloads.push(processDownload(access_token, item, result, electronWin));
      });
    } else {
      resumeCanceled();
    }
  });
};

const fileExistsPath = (path, fileName) => {
  return fileAlreadyExists(path.join(destination, fileName));
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
    if (dl.status !== 3 && dl.progress !== 100) {
      dl.stop();
    } else {
      itemsToRemove.push(dl);
    }
  });
  removeDownloaded();
};

const destroyDownloads = () => {
  stopAllDownloads();
  allDownloads.forEach(dl => {
    if (dl.status === -2 && dl.getStats().total.completed !== 100) {
      dl.destroy();
      console.log(dl.filePath.lastIndexOf('/'));

      allNameItems.splice(allNameItems.indexOf(dl.fileName), 0);
      console.log(allNameItems);
    }
  });
};

const removeDownloaded = () => {
  itemsToRemove.forEach( item => {
    allDownloads.splice(allDownloads.indexOf(item), 1);
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

const resumeCanceled = () => {
  allDownloads.forEach( dl => {
    if (dl.status === -2) {
      dl.resume();
    }
  })
};

module.exports = { downloadManager, destroyDownloads, stopAllDownloads };
