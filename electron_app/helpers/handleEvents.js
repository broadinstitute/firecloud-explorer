const constants = require('./environment').constants;
const handleEvents = (dl, item, win) => {
  item = item || 1;

  dl.on('start', function() {
    //  console.log('EVENT - Download '+ item +' started !');
  });

  dl.on('error', function() {
    //  console.log('EVENT - Download '+ item +' error !');
    // console.log(dl.error);
  });

  dl.on('end', function() {
    console.log('EVENT - Download '+ item.filePath +' finished !');
    win.webContents.send(constants.IPC_DOWNLOAD_COMPLETE, item);
    // console.log(dl.getStats());
  });

  dl.on('retry', function() {
    //  console.log('EVENT - Download '+ item +' error, retrying...');
  });

  dl.on('stopped', function() {
    console.log('EVENT - Download '+ item.filePath +' stopped...');
    console.log(dl.getStats().total);
  });

  dl.on('destroyed', function() {
    //  console.log('EVENT - Download '+ item +' destroyed...');
  });
};
module.exports = { handleEvents };
