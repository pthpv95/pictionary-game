const path = require("path");
const publicPath = path.join(__dirname, "./public");
const express = require("express");
const socketIO = require("socket.io");

const app = express();
var port = process.env.PORT || 8080;

const http = require("http");
var server = http.createServer(app);
var io = socketIO(server, {
  pingTimeout: 60000
});

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    socket.emit('news', { data });
  });

  socket.on('canvas', (data) => {
    io.emit('canvas-positions', data);
  });
});

app.use(express.static(publicPath));
server.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
