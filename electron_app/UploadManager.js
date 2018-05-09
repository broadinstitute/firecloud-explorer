const fs = require('fs');
const process = require('process');
const mime = require('mime-types');
const req = require('request');
const constants = require('./helpers/environment').constants;
const progress = require('progress-stream');
let requestList = [];

const uploadManager = (bucketName, fileList = [], access_token, win) => {

  const url = constants.GOOGLE_API + bucketName + '/o?uploadType=resumable&name=';
  fileList.forEach(file => {
    const contentType = mime.lookup(file.path) ? mime.lookup(file.path) : 'application/octet-stream';
    const size = Number(file.size);

    let uri = url;

    if (file.preserveStructure === true) {
      if (process.platform === 'win32') {
        uri = uri + 'Uploads' + file.path.slice(file.path.indexOf(':') + 1).replace(/\\/g , '/');
      } else {
        uri = uri + 'Uploads' + file.path;
      }
    } else {
      uri = uri + 'Uploads/' + file.name;
    }

    let progressConf = progress({
      length: size
    });

    req.post({
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'X-Upload-Content-Type': contentType,
        'X-Upload-Content-Length': size
      },
      uri: uri,
      method: 'POST',
      json: false,
      resolveWithFullResponse: true
    },

      (err, resp, body) => {
        if (err) {
          console.log('Error!', err);
        } else {
          let location = resp.headers['location'];

          if (location !== undefined) {
            let reqConfig = req.put({
              uri: location
            },
              (err, resp, body) => {
                if (err) {
                  console.log('Error!', err);
                }
              });
            reqConfig.setHeader('Content-Length', size);
            fs.createReadStream(file.path).pipe(progressConf).pipe(reqConfig);
            requestList.push(reqConfig);

          } else {
            console.error("There was an error trying to get location for the following url: ", uri);
            win.webContents.send(constants.IPC_UPLOAD_FAILED, file);
          }
        }

        progressConf.on('progress', (progress) => {
          if (progress.percentage >= 100.0 && progress.delta === 0) {
            file.progress = 100;
            file.transferred = Number(file.size);
            win.webContents.send(constants.IPC_UPLOAD_COMPLETE, file);
          } else {
            file.progress = Math.round(progress.percentage);
            file.transferred = progress.transferred;
            win.webContents.send(constants.IPC_UPLOAD_STATUS, file);
          }
        });
      }
    )

  });
};

const uploadManagerCancel = () => {
  requestList.forEach(request => {
    request.abort();
  });
  requestList = [];
};

module.exports = { uploadManager, uploadManagerCancel };
