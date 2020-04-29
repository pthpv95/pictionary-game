var canvasModule = (function(){
  'use strict';
  const socket = io();
  var roomId = 'room 1';
  var isErasing = false;
  var ctxPositions = [];
  var positions = [];

  var drawingBoard = document.getElementById('drawing-board');
  var canvas = document.createElement('canvas');
  drawingBoard.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  canvas.width  = drawingBoard.clientWidth;
  canvas.height = drawingBoard.clientHeight; 

  // handle later
  //resize();

  // last known position
  var pos = { x: 0, y: 0 };
  var from = null;

  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mousedown', mouseDown);
  document.addEventListener('mouseenter', setPosition);
  document.addEventListener('mouseup', onMouseOut)
  document.addEventListener('mouseover', onMouseOver);

  document.addEventListener('touchmove', onMove)

  function onMouseOver(e){
    if(e.target != canvas) return;
  }

  function mouseDown(e){
    if(e.target != canvas) return;
    setPosition(e)
  }

  // new position from mouse event
  function setPosition(e) {
    if (e.target !== canvas) {
      return;
    }

    pos.x = e.clientX - drawingBoard.offsetLeft;
    pos.y = e.clientY - drawingBoard.offsetTop;
  }

  function onMouseOut(e) {
    if(e.target !== canvas) return;
    ctxPositions.push({
      from,
      to: pos
    });

    positions = [];

    from = null;
    socket.emit('canvas-finished', {roomId, message: 'canvas stoke just finished.'});
  }

  // resize canvas
  function resize(e) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }

  function onMove(e){
    if(isErasing){
      console.log('clearing');
    }else{
      draw(e);
    }
  }

  function draw(e) {
    // mouse left button must be pressed
    if (e.buttons !== 1 || e.target != canvas) return;

    ctx.beginPath(); // begin
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.moveTo(pos.x, pos.y); // from
    setPosition(e);
    
    ctx.lineTo(pos.x, pos.y); // to
    ctx.stroke(); // draw it!
    var newPos = {...pos};
    if(!from){
      from = {...pos};
    };
    
    if(newPos !== pos){
      var payload = `${roomId}_${pos.x}.${pos.y}`;
      socket.emit('canvas', payload);
      ctxPositions.push({from, to: newPos});
    }
  }

  var eraserBtn = document.getElementById('eraser-btn');
  eraserBtn.addEventListener('click', function(){
    isErasing = !isErasing;
  });

  var downloadbtn = document.getElementById('download-btn');
    downloadbtn.addEventListener('click', () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(ctxPositions, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "data.txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  var btnEle = document.getElementById('clear-btn');
  btnEle.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var payload = `${roomId}_${0}.${0}`;
    socket.emit('canvas', payload)
  });

  var saveBtnEle = document.getElementById('save-btn');
  saveBtnEle.addEventListener('click', () => {
    renderCanvas(ctxPositions);
  });

  function renderCanvas(_positions){
    if(_positions && _positions.length == 0){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    ctx.beginPath(); // begin
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    _positions.forEach((item) => {
      ctx.moveTo(_positions[0].x, _positions[0].y);
      _positions.forEach((pos, index) => {
        if(index != 0){
          ctx.lineTo(pos.x, pos.y);
        }
      })
      ctx.stroke();
    })
  }

  // socket io
  socket.on('new-canvas', (data) => {
    console.log('new canvas created');
  });
  
  socket.on('canvas-positions', (data) => {
    var splits = data.split('.');
    var x = splits[0];
    var y = splits[1];

    if(x == 0 && y == 0){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      from = null;
      return;
    }

    if(!from){
      from = {x,y};
    }
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    from = {x, y};
  });

  socket.emit('room', 'room 1');

  socket.on('new-canvas-finished', function(data){
    from = null;
  });

  return ctx;
})();