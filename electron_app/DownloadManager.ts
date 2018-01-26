const Downloader = require('./Downloader');
const path = require('path');
const { handleFolder, fileAlreadyExists } = require('./helpers/handleDisk');
const downloadStats = require('./helpers/downloadInfo').downloadStats;
const handleEvents = require('./helpers/handleEvents');

let filePath = '';
const allDownloads = [];
let fileExists = true;

export class DownloadManagerClass {
  public downloadManager(items: any, access_token: any, electronWin: any): void {
    items.forEach(item => {
      let count = 0;
      let fileName = item.name;
      const destination = item.preserveStructure ?
        path.join(item.destination, item.path.substring(item.path.lastIndexOf('/'), 0)) : item.destination;
      do {
        fileExists = fileAlreadyExists(path.join(destination, fileName));
        if (fileExists) {
          count++;
          fileName = item.name.substring(0, item.name.indexOf('.')) + '(' + (count) + ')' +
            item.name.substring(item.name.indexOf('.'));
        }
      } while (fileExists);
      item.name = fileName;
      this.processItem(item, destination, access_token, electronWin);
    });
  }

  private processItem(item, itemDestination, token, win) {
    handleFolder(itemDestination, (result) => {
      allDownloads.push(this.processDownload(token, item, result, win));
    });
  }

  public processDownload(access_token: any, item: any, folder: any, win: any): any {
    filePath = path.join(folder, item.name);
    const dloader = new Downloader();
    const dl = dloader.download(item.mediaLink, filePath, this.setHeader(access_token));
    dl.start();
    downloadStats(dl, item, win);
    handleEvents(dl, item);
    return dl;
  }

  public stopAllDownloads(): void {
    allDownloads.forEach(dl => {
      if (dl.status !== 3) {
        dl.stop();
      }
    });
  }

  public destroyDownloads(): void {
    this.stopAllDownloads();
    allDownloads.forEach(dl => {
      if (dl.status === -2) {
        dl.destroy();
      }
    });
  }

  setHeader(access_token: any): any {
    return {
      count: 8,
      port: 443,
      headers: {
        'Authorization': 'Bearer ' + access_token,
      }
    };
  }
}
