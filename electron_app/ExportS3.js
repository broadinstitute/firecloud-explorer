const fs = require('fs');
const path = require('path');
const electron = require('electron');
const { downloadManager } = require('./DownloadManager');
let AWS = require('aws-sdk');
AWS.config.httpOptions = { timeout: 5000 };
const constants = require('./helpers/environment').constants;
var request = require('request');
var s3List = [];
let s3 = null;

let electronWin = null;
let tempPath = (electron.app || electron.remote.app).getPath('userData');
const pathTemp = tempPath;
let gcsToken = '';
const ExportS3 = (win, data) => {
  electronWin = win;
  gcsToken = data.gcsToken;
  console.log(gcsToken);
  if (data.item.progress === 100) {
    uploadS3(data);
  } else {
    manageDownloadProcess(data); // TODO Manage failed downloads to export
  }
};

const testCredentials = (data) => {
  let errorMessage = null;
  s3 = new AWS.S3({
    accessKeyId: data.accessKey,
    secretAccessKey: data.secretKey,
    params: { Bucket: data.bucketName }
  });
  // BucketLocation is innocuous
  return new Promise((resolve, reject) => {
    s3.getBucketLocation({ Bucket: this.bucketName }, function (err) {
      if (err) {
        console.log('ERROR', err.message);
        // Three of these errors has the same error code (403) coming from AWS servers, so we identify them by their name on its properties.
        switch (err.code) {
          case 'InvalidAccessKeyId':
            errorMessage = 'Sorry, there is no AWS account with that Access Key Id.';
            break;
          case 'SignatureDoesNotMatch':
            errorMessage = 'Sorry, the Secret Access Key you provided is not correct.';
            break;
          case 'NoSuchBucket':
            errorMessage = 'Sorry, the specified bucket does not exist.';
            break;
          case 'AllAccessDisabled':
            errorMessage = 'Sorry, you don\'t have the proper permissions to export to that bucket.';
            break;
          default:
            errorMessage = ' Sorry, something went wrong.';
            break;
        }
        reject(errorMessage);
      } else {
        resolve(true);
      }
    });
  });
};

const manageDownloadProcess = (data) => {
  data.item.destination = path.join(tempPath, 'TempFolder');
  data.item.preserveStructure = false;
  downloadManager([data.item], data.gcsToken, electronWin);
};

const uploadS3 = (data) => {
  const filePathExport = data.preserveStructure ? data.item.path : data.item.displayName;
  const tempFilePath = path.join(tempPath, 'TempFolder', data.item.displayName);
  // const fileStream = fs.createReadStream(tempFilePath);
  var url = data.item.mediaLink;
  console.log(url);
  console.log('token' + data.gcsToken);

  const putParams = {
    Bucket: data.bucketName,
    Key: 'Imports/' + filePathExport
    // Body: remoteReadStream
  };


  var remoteReadStream = request.get(url, setHeader(data.gcsToken))
    .on('error', function (err) {
      console.log(err);
    })
    //.pipe(fs.createWriteStream('mi.cram.md5'));
    .pipe(putParams);
  //  };
  //remoteReadStream.on('error', (error) => { console.log(error) });
  /**s3.putObject(putParams, (putErr, putData) => {
    if (putErr) console.log(putErr);
    else {
      console.log('upload completo')
     // removeFile(tempFilePath, data.item); // TODO avisar que envíe el próximo item
    }
  }); */
  s3List.push(s3);

};

const setHeader = (access_token) => {
  return {
    port: 443,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    }
  };
};

const removeFile = (filePath, item) => {
  fs.unlink(filePath, (err) => {
    if (err)
      console.log('Error removing file ', err);
    tempPath = pathTemp;
    item.status = 'Exported to S3';
    electronWin.webContents.send(constants.IPC_EXPORT_S3_DOWNLOAD_STATUS, item); // considerar esta línea
  });
};

const exportS3Cancel = () => {
  s3List.forEach(s3 => {
    s3.abortMultipartUpload();
  });
};
module.exports = { ExportS3, testCredentials, exportS3Cancel };
