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
        processDownload(access_token, item, result)
      );
    } else {
      processDownload(access_token, item, item.destination);
    }
  });
};

const processDownload = (access_token, item, folder) => {
  filePath = path.join(folder, item.name);
  const dl = new mtd(filePath, item.mediaLink, setHeader(access_token));
  dl.start();
};

const setHeader = (access_token) => {
  return {
    count: 8,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    }
  };
};

module.exports = downloadManager;
