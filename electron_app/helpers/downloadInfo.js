const net = require('net');

const downloadState = {
  'status': 'downloading',
  'speed': '60Mb/s',
  'ETA': '3600s'
};

var clientSocket = new net.Socket();

var service = net.createServer((clientSocket) => {
  clientSocket.write(JSON.stringify(downloadState));
  clientSocket.write('HOLA');
  clientSocket.pipe(clientSocket);
});

var stats = dl.getStats();
allDownloads.forEach(dl => {
  
})

service.listen(5500, '127.0.0.1', () => {
  console.log('connection created');
});

service.on('connection', (socket) => {
  var info = {};

  allDownloads.forEach(dl => {
    var stats = dl.getStats();
    info.progress = stats.total.completed;
    info.id = 'NOMBRE DESCARGA';
  });
  socket.write(info);
});

module.exports = { service };