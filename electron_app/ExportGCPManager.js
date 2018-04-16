
const axios = require("axios");
const { Rxios } = require('rxios');
const Rx = require('rxjs');
const forkJoin = require('rxjs/observable/forkJoin');

const req = require('request');
const progress = require('progress-stream');
var urlencode = require('urlencode');
var requestList = [];
const constants = require('./helpers/environment').constants;

const exportGCPManager = (destinationBucket, fileList = [], access_token, win) => {
  var i = 0;
  let completed = [];
  let failed = [];

  const reqs = [];
  const httpx = new Rxios(
    {
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Accept': 'application/json, text/plain, */*',
        'Content-Length': 0,
        'User-Agent': 'Firecloud DataShuttle'
      },
      params: {},
      timeout: 4000000,
    }
  );

  fileList.forEach(file => {

    // build here an array of fileList.length requests 
    const sourceObject = file.path.substring(file.path.indexOf('/') + 1, file.path.length);
    const destinationObject = file.preserveStructure ? sourceObject : file.name;

    var url = constants.GCP_API + file.bucketName
      + '/o/' + urlencode(sourceObject)
      + '/rewriteTo/b/' + urlencode(destinationBucket)
      + '/o/' + urlencode('Imports/' + destinationObject)
      + '?fields=done,totalBytesRewritten,resource';

    const postReq = httpx.post(url, { "metadata": { "sourceId": file.id } })
      .catch(err => Rx.Observable.of(
        {
          done: false,
          error: err,
          sourceId: file.id
        }
      )
      );

    // if (error.response) {
    //   // The request was made and the server responded with a status code
    //   // that falls out of the range of 2xx
    //   console.log(error.response.data);
    //   console.log(error.response.status);
    //   console.log(error.response.headers);
    // } else if (error.request) {
    //   // The request was made but no response was received
    //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //   // http.ClientRequest in node.js
    //   console.log(error.request);
    // } else {
    //   // Something happened in setting up the request that triggered an Error
    //   console.log('Error', error.message);
    // }
    // console.log(error.config);

    reqs.push(postReq);

  });

  // request all at once, get only one response 
  Rx.Observable.forkJoin(reqs)
    .subscribe(
      response => {
        response.forEach(item => {

          if (item.done === true) {
            completed.push(
              {
                id: item.resource.id,
                transferred: item.totalBytesRewritten,
                size: item.resource.size,
                done: item.done,
                sourceId: item.resource.metadata.sourceId,
                md5hash: item.resource.md5hash
              }
            );
          } else {
            failed.push(
              {
                id: item.sourceId,
                transferred: 0,
                done: item.done,
                sourceId: item.sourceId,
              });
          }
        });

        // report progress 
        win.webContents.send(constants.IPC_EXPORT_TO_GCP_COMPLETE, completed);
        win.webContents.send(constants.IPC_EXPORT_TO_GCP_FAILED, failed);
      },
      err => {
        //how errors should be handled here ????
        console.log(err);
      });
}

const exportGCPManagerCancel = () => {
  requestList.forEach(request => {
    request.abort();
  });
}

module.exports = {
  exportGCPManager,
  exportGCPManagerCancel
};
