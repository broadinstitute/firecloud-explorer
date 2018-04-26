const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder, fileAlreadyExists, deleteMTD } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents');
const environment = require('./helpers/environment');

let filePath = '';
let allDownloads = [];
let allNameItems = [];
let fileExists = true;

const downloadManager = (items, access_token, electronWin) => {

  items.forEach(item => {

    let count = 0;
    let fileName = item.displayName;

    // resume the download if mtd exists already in the array
    if (!allNameItems.includes(fileName)) {
      allNameItems.push(fileName);
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

      handleFolder(destination, (result) => {
        allDownloads.push(processDownload(access_token, item, result, electronWin));
      });
    } else {
      resumeCanceled();
    }
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
      console.log('detiene ', dl.filePath);
    } else {
      removeDownload(dl);
      console.log('no se detiene un item ya descargado -> ', dl.filePath);
    }
  });
};

const destroyDownloads = () => {
  stopAllDownloads();
  allDownloads.forEach(dl => {
    if (dl.status === 3) {
      removeDownload(dl);
    }
    if (dl.status === -2) {
      console.log('status ', dl.status);
      console.log(dl.filePath, ' destruir descarga');
      dl.destroy();
    }
  });
};

const removeDownload = (dl) => {
  const del = allDownloads.splice(allDownloads.indexOf(dl), 1);
  console.log('removed -> ', del.length);
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
  console.log('continua descarga');
  allDownloads.forEach( dl => {
    if (dl.status === -2) {
      console.log('resume canceled', dl.filePath, ' ', dl.status);
      dl.resume();
    }
  })
};

module.exports = { downloadManager, destroyDownloads, stopAllDownloads, removeDownload };
