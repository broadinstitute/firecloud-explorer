const fs = require('fs');
const mime = require('mime-types');
const req = require('request');


const uploadManager = (bucketName, fileList = [], access_token) => {

    const url = 'https://www.googleapis.com/upload/storage/v1/b/' + bucketName + '/o?uploadType=resumable&name=';

    fileList.forEach(file => {
        const contentType = mime.lookup(file.path);
        const size = file.size;
        console.log("uri" + url + 'uploads/' + file.name);
        req.post({
            headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'X-Upload-Content-Type': contentType,
                    'X-Upload-Content-Length': size,
                    'Content-Length': size
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
                    console.log("location:" + location);
                    
                    var reqConfig = req.put({uri: location},
                      function (err, resp, body) {
                        if (err) {
                            console.log('Error!', err);
                        } else {
                            console.log('URL: ' + body);
                        }
                    });
                    reqConfig.setHeader('Content-Length', size);
                    fs.createReadStream(file.path).pipe(reqConfig);
                }
            }
        );
    })
}

module.exports = uploadManager;
