const mtd = require('zeltice-mt-downloader');
const path = require('path');
const os = require('os');

const handleFolder = require('./helpers/handleDisk');

let downElements = [];

const downloadManager = (items, access_token) => {
  let filePath = '';
  const options = setHeader(access_token);
  items.forEach(item => {
    if (item.preserveStructure) {
      const structurePath = item.path.substring(item.path.lastIndexOf('/'), 0);
      handleFolder(path.join(item.destination, structurePath)).then(result =>
        processDownload(options, item, result)
      );
    } else {
      processDownload(options, item, item.destination);
    }
  });
};

const processDownload = (options, item, folder) => {
  filePath = path.join(folder, item.name);
  if (downElements.indexOf(filePath) === -1) {
    downElements.push(filePath);
    const dl = new mtd(filePath, item.mediaLink, options);
    dl.start();
  }
};

const setHeader = (access_token) => {
  return  {
    count: 8,
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
