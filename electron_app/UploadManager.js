const fs = require('fs');
const mime = require('mime-types');
const req = require('request');
const constants = require('./helpers/environment').constants;
const progress = require('progress-stream');
var requestList = [];

const uploadManager = (bucketName, fileList = [], access_token, win) => {

  const url = constants.GOOGLE_API + bucketName + '/o?uploadType=resumable&name=';
  fileList.forEach(file => {
    const contentType = mime.lookup(file.path) ? mime.lookup(file.path) : 'application/octet-stream';
    const size = file.size;
    var progressConf = progress({
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
          var location = resp.headers['location'];
          if (location !== undefined) {
            var reqConfig = req.put({
                uri: location
              },
              function (err, resp, body) {
                if (err) {
                  console.log('Error!', err);
                }
              });
            reqConfig.setHeader('Content-Length', size);
            fs.createReadStream(file.path).pipe(progressConf).pipe(reqConfig);
            requestList.push(reqConfig);

          } else {
            console.error("There was an error trying to connect to google");
          }

        }
        progressConf.on('progress', function (progress) {
          file.progress = Math.round(progress.percentage);
          file.transferred = progress.transferred;
          win.webContents.send(constants.IPC_UPLOAD_STATUS, file);
        });
        progressConf.on('end', function () {
          file.progress = 100;
          file.transferred = Number(file.size);
          win.webContents.send(constants.IPC_UPLOAD_COMPLETE, file);
        });
      }
    );
  })
}

const uploadManagerCancel = () => {
  requestList.forEach(request => {
    request.abort();
  });
}

module.exports = {
  uploadManager,
  uploadManagerCancel
};
