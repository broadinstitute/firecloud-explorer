const req = require('request');
const progress = require('progress-stream');
var urlencode = require('urlencode');
var requestList = [];
const constants = require('./helpers/environment').constants;

const exportGCPManager = (destinationBucket,  fileList = [], access_token, win) => {
  var i = 0;
  fileList.forEach(file => {
    const sourceObject = file.path.substring(file.path.indexOf('/') + 1, file.path.length);
    const destinationObject = file.preserveStructure ? sourceObject : file.name;   
        
   var url = constants.GCP_API + file.bucketName + '/o/' + urlencode(sourceObject) + '/rewriteTo/b/' + urlencode(destinationBucket) + '/o/' + urlencode('Imports/' + destinationObject);
   var reqConfig = req.post({
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        uri: url,
        method: 'POST'
      },
      function (err, resp, body) {
        if (err) {
          console.log('Error!', err);
        } else {
          if(resp.statusCode === 200){
            file.status = 0;
            file.progress = 100;
            file.transferred = new Number(file.size);
            console.log('complete', file.displayName);
            win.webContents.send(constants.IPC_EXPORT_TO_GCP_COMPLETE, file);
          } else {
            file.status = 0;
            file.progress = 0;    
            file.transferred = 0;       
            console.log('failed', file.displayName);
            win.webContents.send(constants.IPC_EXPORT_TO_GCP_FAILED, file);
          }
        
        }
        reqConfig.end();
        requestList.push(reqConfig);
      }
    );
  })
  
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
