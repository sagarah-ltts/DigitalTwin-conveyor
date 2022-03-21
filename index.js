const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('util');
const port = process.env.PORT || 5000
const clients = []; //track connected clients

//Server Web Client
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

//make one reference to event name so it can be easily renamed 
const chatEvent = "speedChangeEvent";
const boxEvent = "boxLoadEvent";
const tempEvent = "tempChangeEvent";
const vibrationEvent = "vibrationChangeEvent";
var rpmEvent = "rpmChangeEvent";
//When a client connects, bind each desired event to the client socket
io.on('connection', socket => {
  //track connected clients via log
  clients.push(socket.id);
  const clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
  io.emit(chatEvent, clientConnectedMsg);
  io.emit(boxEvent, clientConnectedMsg);
  io.emit(tempEvent, clientConnectedMsg);
  io.emit(vibrationEvent, clientConnectedMsg);
  io.emit(rpmEvent, clientConnectedMsg);
  console.log(clientConnectedMsg);

  //track disconnected clients via log
  socket.on('disconnect', () => {
    clients.pop(socket.id);
    const clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
    io.emit(chatEvent, clientDisconnectedMsg);
    io.emit(boxEvent, clientDisconnectedMsg);
    io.emit(tempEvent, clientDisconnectedMsg);
    io.emit(vibrationEvent, clientDisconnectedMsg);
    io.emit(rpmEvent, clientDisconnectedMsg);
    console.log(clientDisconnectedMsg);
  })
  //multicast received message from client
  socket.on(boxEvent, msg => {
    const boxAdded = msg;
    io.emit(boxEvent, boxAdded);
    console.log('multicastBox: ' + boxAdded);
  });
  //multicast received message from client
  socket.on(chatEvent, msg => {
    const combinedMsg = msg;
    io.emit(chatEvent, combinedMsg);
    console.log('multicast: ' + combinedMsg);
  });
  //multicast received message from client
  socket.on(tempEvent, msg => {
    const combinedMsg = msg;
    io.emit(tempEvent, combinedMsg);
    console.log('multicastTemp: ' + combinedMsg);
  });
  //multicast received message from client
  socket.on(vibrationEvent, msg => {
    const combinedMsg = msg;
    io.emit(vibrationEvent, combinedMsg);
    console.log('multicast vibrationEvent: ' + combinedMsg);
  });
  //multicast received message from client
  socket.on(rpmEvent, msg => {
    const combinedMsg = msg;
    io.emit(rpmEvent, combinedMsg);
    console.log('multicast vibrationEvent: ' + combinedMsg);
  });
  //multicast received message from client
  socket.on("stop", msg => {
    const combinedMsg = msg;
    console.log('stop: ' + combinedMsg);
    stopStream();
    io.emit("stop", combinedMsg);
  });
  //multicast received message from client
  socket.on("start", msg => {
    const combinedMsg = msg;
    console.log('start: ' + combinedMsg);
    startStream();
    io.emit("start", combinedMsg);
  });
});
var stopMachine, startBoxAdd;

function startStream() {
  stopMachine = setInterval(function() {
    //rpm ===1000-1500rpm  ///gear ratio=25:1 //drive roller diamert = 110 mm
    var mass = 10; //blet mass + total box*mass per box
    var rpmRange = Math.floor(Math.random() * (1500 - 1000)) + 1000;
    // sliderRpm.innerHTML = rpmRange;
    // slider.innerHTML = Math.floor(((rpmRange / 20) * (3.14 * 250)) / 1000); //speed mtr/min
    // sliderTemp.innerHTML = Math.floor((1 / 2) * (mass) * (Math.sqrt(slider.innerHTML)));
    var speed = Math.floor(((rpmRange / 20) * (3.14 * 250)) / 1000);;
    // sliderVibration.innerHTML = Math.floor(rpmRange / 60);
    io.emit('rpmChangeEvent', rpmRange);
    io.emit('tempChangeEvent', Math.floor((1 / 2) * (mass) * (Math.sqrt(speed))));
    io.emit('vibrationChangeEvent', Math.floor(rpmRange / 60));
    io.emit('speedChangeEvent', speed);
  }, 5000);
  startBoxAdd = setInterval(addBoxes, 5000);
}

function addBoxes() {
  var boxType = "BadBox";
  var whichBox = Math.random() < 0.8;
  if (whichBox) {
    boxType = "AddBox";
  }
  io.emit('boxLoadEvent', boxType);
  clearInterval(startBoxAdd);
  startBoxAdd = setInterval(addBoxes, Math.floor(Math.random() * (20000 - 2500)) + 2500);

  return false;
}

function stopStream() {
  io.emit('rpmChangeEvent', 0);
  io.emit('tempChangeEvent', 0);
  io.emit('vibrationChangeEvent', 0);
  io.emit('speedChangeEvent', 0);
  clearInterval(startBoxAdd);
  clearInterval(stopMachine);
}
//Start the Server
http.listen(port, () => {
  console.log('listening on *:' + port);
  startStream();
});
