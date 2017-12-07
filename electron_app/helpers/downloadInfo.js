const net = require('net');
const http = require('net');

const downloadState = {
  'status': 'downloading',
  'speed': '60Mb/s',
  'ETA': '3600s'
};

/* http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify(downloadState));
}).listen(5505); */

var service = net.createServer((socket) => {
  socket.write(JSON.stringify(downloadState));
  socket.pipe(socket);
});

service.listen(5500, '127.0.0.1', () => {
  console.log('connection created');
});

// module.exports = { service };