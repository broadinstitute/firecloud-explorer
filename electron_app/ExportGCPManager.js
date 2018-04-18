const { Rxios } = require('rxios');
const Rx = require('rxjs');
const urlencode = require('urlencode');
const requestList = [];
const constants = require('./helpers/environment').constants;

const exportGCPManager = (destinationBucket, fileList = [], access_token, win) => {
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
      // transformResponse: [function (data) {
      //   // Do whatever you want to transform the data
      //   const single = {
      //     id: data.resource.id,
      //     transferred: data.totalBytesRewritten,
      //     size: data.resource.size,
      //     done: data.done,
      //     sourceId: data.resource.metadata.sourceId,
      //     md5hash: data.resource.md5hash
      //   }
      //   win.webContents.send(constants.IPC_EXPORT_TO_GCP_COMPLETE_SINGLE, single);
      //   return data;
      // }],
    }
  );

  timedOut = [];
  fileList.forEach(file => {

    timedOut.push(
      {
        id: file.id,
        transferred: 0,
        done: false,
        sourceId: file.id
      });

    // build here an array of fileList.length requests 
    const sourceObject = file.path.substring(file.path.indexOf('/') + 1, file.path.length);
    const destinationObject = file.preserveStructure ? file.path : file.displayName;

    let url = constants.GCP_API + file.bucketName
      + '/o/' + urlencode(sourceObject)
      + '/rewriteTo/b/' + urlencode(destinationBucket)
      + '/o/' + urlencode('Imports/' + destinationObject)
      + '?fields=done,totalBytesRewritten,resource';

    // sourceId here will be included in response as metadata
    // and will be used to mark file as completed.
    // otherwise, original id is lost.
    const postReq = httpx.post(url, { "metadata": { "sourceId": file.id } }, { timeout: 60000 })
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
  const completed = [];
  const failed = [];
  Rx.Observable.forkJoin(reqs)
    .timeout(180000)
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
      },
      err => {
        // how errors should be handled here ????
        // we should log elsewhere ....
        // console.log(err);

        // any error will cause all items to be marked as failed
        // and process should move to next batch
        if (timedOut.length > 0) {
          win.webContents.send(constants.IPC_EXPORT_TO_GCP_FAILED, timedOut);
        }
      },
      () => {
        // report progress 
        if (completed.length > 0) {
          win.webContents.send(constants.IPC_EXPORT_TO_GCP_COMPLETE, completed);
        }

        if (failed.length > 0) {
          win.webContents.send(constants.IPC_EXPORT_TO_GCP_FAILED, failed);
        }
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
