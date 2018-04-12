
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

    reqs.push(httpx.post(url, {}));

  });

  // request all at once, get only one response 
  Rx.Observable.forkJoin(reqs).subscribe(
    response => {

      response.forEach(item => {
        completed.push(
          {
            id: item.resource.id,
            transferred: item.totalBytesRewritten,
            size: item.resource.size,
            done: item.done,
            md5hash: item.resource.md5hash
          }
        );
      });
      // report progress 
      win.webContents.send(constants.IPC_EXPORT_TO_GCP_COMPLETE, completed);

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
