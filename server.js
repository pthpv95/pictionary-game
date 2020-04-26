const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(8080, ()=>{
  console.log('Pictionary app is up and running..');
});

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    socket.emit('news', { data });
  });

  socket.on('canvas', (data) => {
    io.emit('canvas-positions', data);
  });
});