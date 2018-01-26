const fs = require('fs');
const mime = require('mime-types');
const req = require('request');
const constants = require('./helpers/enviroment');
const progress = require('progress-stream');
const requestList = [];

export class UploadManagerClass {
  public uploadManager(bucketName: any, fileList = [], access_token: any, win: any): void {
    const url = constants.GOOGLE_API + bucketName + '/o?uploadType=resumable&name=';
    fileList.forEach(file => {
      const contentType = mime.lookup(file.path) ? mime.lookup(file.path) : 'application/octet-stream';
      const size = file.size;
      const progressConf = progress({
        length: size
      });
      req.post({
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'X-Upload-Content-Type': contentType,
          'X-Upload-Content-Length': size
        },
        uri: url + 'Uploads/' + file.name,
        method: 'POST',
        json: false,
        resolveWithFullResponse: true
      },
        function (err, resp, body) {
          if (err) {
            console.log('Error!', err);
          } else {
            const location = resp.headers['location'];
            if (location !== undefined) {
              const reqConfig = req.put({
                uri: location
              },
                function (error, response, responseBody) {
                  if (error) {
                    console.log('Error!', error);
                  }
                });
              reqConfig.setHeader('Content-Length', size);
              fs.createReadStream(file.path).pipe(progressConf).pipe(reqConfig);
              requestList.push(reqConfig);

            } else {
              console.log(JSON.stringify(resp));
              console.error('There was an error trying to connect to google');
            }

          }
          progressConf.on('progress', function (itemProgress) {
            file.progress = Math.round(itemProgress.percentage);
            file.transferred = itemProgress.transferred;
            win.webContents.send(constants.IPC_UPLOAD_STATUS, file);
          });
        }
      );
    });
  }

  public uploadManagerCancel (): void {
    requestList.forEach(request => {
      request.abort();
    });
  }
}
