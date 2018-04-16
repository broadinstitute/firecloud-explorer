const { Rxios } = require('rxios');
const Rx = require('rxjs');
const urlencode = require('urlencode');
const requestList = [];
const constants = require('./helpers/environment').constants;

const exportGCPManager = (destinationBucket, fileList = [], access_token, win) => {
  let completed = [];
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
    const destinationObject = file.preserveStructure ? file.path : file.name;

    let url = constants.GCP_API + file.bucketName
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
};

const exportGCPManagerCancel = () => {
  requestList.forEach(request => {
    request.abort();
  });
};

module.exports = {
  exportGCPManager,
  exportGCPManagerCancel
};
