let AWS = require('aws-sdk');
let s3Stream = require('s3-upload-stream');
AWS.config.httpOptions = { timeout: 5000 };
const constants = require('./helpers/environment').constants;
const request = require('request');

let s3List = [];
let s3 = null;

let electronWin = null;
let gcsToken = '';
const ExportS3 = (win, data) => {
  electronWin = win;
  gcsToken = data.gcsToken;
  uploadS3(data);
};

const testS3Credentials = (data) => {
  let errorMessage = null;
  AWS.config.update({ accessKeyId: data.accessKey, secretAccessKey: data.secretKey });
  
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

const uploadS3 = (data) => {
  s3Stream = require('s3-upload-stream')(s3);
  const filePathExport = data.preserveStructure ? data.item.path : data.item.displayName;
  let url = data.item.mediaLink;

  let uploadStream = s3Stream.upload({
    Bucket: data.bucketName,
    Key: 'Imports/' + filePathExport
  });

  request.get(url, setHeader(data.gcsToken))
  .on('error', function (err) {
    console.log(err);
  }).pipe(uploadStream);
  // Handle errors.
  uploadStream.on('error', function (error) {
    console.log(error);
  });

  uploadStream.on('part', function (details) {
    // the message is send when the first 5MB has already transferred
    if (details.uploadedSize <= 5242890) {
      electronWin.webContents.send(constants.IPC_EXPORT_S3_DOWNLOAD_STATUS, data.item);
      // console.log(details);
    }
    // console.log(details.uploadedSize);
  });

  uploadStream.on('uploaded', function (details) {
    data.item.status = 'Exported to S3';
    data.item.progress = 100;
    electronWin.webContents.send(constants.IPC_EXPORT_S3_DOWNLOAD_STATUS, data.item);
  });
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

const exportS3Cancel = () => {
  s3List.forEach(s3 => {
    s3.abortMultipartUpload();
  });
};
module.exports = { ExportS3, testS3Credentials, exportS3Cancel };
