const fs = require('fs');
const mime = require('mime-types');
const req = require('request');
const constants = require('./helpers/enviroment');
const progress = require('progress-stream');


const uploadManager = (bucketName, fileList = [], access_token, win) => {

    const url = constants.GOOGLE_API + bucketName + '/o?uploadType=resumable&name=';

    fileList.forEach(file => {
        const contentType = mime.lookup(file.path) ? mime.lookup(file.path) : 'application/octet-stream';
        const size = file.size;
        var str = progress({
            length: size
        });
        str.on('progress', function(progress) {
            file.progress = Math.round(progress.percentage);
            file.transferred = progress.transferred;
            file.size = progress.length;            
            win.webContents.send(constants.IPC_UPLOAD_STATUS, file);
        });
        req.post({
            headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'X-Upload-Content-Type': contentType,
                    'X-Upload-Content-Length': size
                },
                uri: url + 'uploads/' + file.name,
                method: 'POST',
                json: false,
                resolveWithFullResponse: true
            },
            function (err, resp, body) {
                if (err) {
                    console.log('Error!', err);
                } else {
                    var location = resp.headers['location'];
                    if(location !== undefined) {
                        var reqConfig = req.put({uri: location},
                            function (err, resp, body) {
                              if (err) {
                                  console.log('Error!', err);
                              } else {
                                  console.log('URL: ' + body);
                              }
                          });
                          reqConfig.setHeader('Content-Length', size);
                          fs.createReadStream(file.path).pipe(str).pipe(reqConfig);
                    } else {
                        console.log(JSON.stringify(resp));
                        console.error("There was an error trying to connect to google");
                    }
                    
                }
            }
        );
    })
}

module.exports = uploadManager;
