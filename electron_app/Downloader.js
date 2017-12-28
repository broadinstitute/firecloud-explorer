const Download = require('./Download');
const Formatters = require('./Formatters');
const util = require('util');

let extend = function (target) {
  let sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (let prop in source) {
      target[prop] = source[prop];
    }
  });
  return target;
};

/*
  ------------------------------------------
  - Downloader class
  ------------------------------------------
 */
const Downloader = function () {
  this._downloads = [];
};

Downloader.prototype._defaultOptions = {
  //To set the total number of download threads
  threadsCount: 2, //(Default: 6)

  //HTTP method
  method: 'GET', //(Default: GET)

  //If no data is received the download times out. It is measured in seconds.
  timeout: 5000, //(Default: 5 seconds)

  //Control the part of file that needs to be downloaded.
  range: '0-100', //(Default: '0-100')
};

Downloader.prototype.download = function (url, filePath, options) {
  let options = extend({}, this._defaultOptions, options);

  let dl = new Download();

  dl.setUrl(url);
  dl.setFilePath(filePath);
  dl.setOptions(options);

  this._downloads.push(dl);
  return dl;
};

Downloader.prototype.resumeDownload = function (filePath) {
  let dl = new Download();

  if (!filePath.match(/\.mtd$/)) {
    filePath += '.mtd';
  }

  dl.setUrl(null);
  dl.setFilePath(filePath);
  dl.setOptions({});

  this._downloads.push(dl);

  return dl;
};

// For backward compatibility, will be removed in next releases
Downloader.prototype.restart = util.deprecate(function (filePath) {
  return this.resumeDownload(filePath);
}, 'Downloader `restart(filePath)` is deprecated, please use `resumeDownload(filePath)` instead.');

Downloader.prototype.getDownloadByUrl = function (url) {
  let dlFound = null;

  this._downloads.forEach(function (dl) {
    if (dl.url === url || (dl.meta && dl.meta.url && dl.meta.url == url)) {
      dlFound = dl;
    }
  });

  return dlFound;
};

Downloader.prototype.getDownloadByFilePath = function (filePath) {
  let dlFound = null;

  let mtdRegex = new RegExp('(.mtd)*$', 'g');

  filePath = filePath.replace(mtdRegex, '');

  this._downloads.forEach(function (dl) {
    let dlFilePath = dl.filePath.replace(mtdRegex, '');

    if (dlFilePath === filePath) {
      dlFound = dl;
    }
  });

  return dlFound;
};

Downloader.prototype.removeDownloadByFilePath = function (filePath) {
  let dlFound = false;

  let mtdRegex = new RegExp('(.mtd)*$', 'g');

  filePath = filePath.replace(mtdRegex, '');

  for (let i = 0; i < this._downloads.length; i++) {
    let dlFilePath = this._downloads[i].filePath.replace(mtdRegex, '');

    if (dlFilePath === filePath) {
      this._downloads.splice(i, 1);
      dlFound = true;
    }
  }

  return dlFound;
};

Downloader.prototype.getDownloads = function () {
  return this._downloads;
};

Downloader.prototype.Formatters = Formatters;
Downloader.Formatters = Formatters;

module.exports = Downloader;
