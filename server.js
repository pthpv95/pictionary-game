const path = require("path");
const publicPath = path.join(__dirname, "./public");

const express = require("express");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 8080;

const http = require("http");
const server = http.createServer(app);
const io = socketIO(server, {
  pingTimeout: 60000
});

io.on('connect', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    socket.emit('news', { data });
  });

  socket.on('canvas', (data) => {
    const splits = data.split('_');
    socket.to(splits[0]).emit('canvas-positions', splits[1]);
  });

  socket.on('canvas-finished', (data) => {
    socket.to(data.roomId).emit('new-canvas-finished', 'hello everyone in room 1.');
  });

  socket.on('room', (room) => {
    socket.join(room);
  })
});

app.use(express.static(publicPath));
server.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
