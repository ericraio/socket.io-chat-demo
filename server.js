var   express = require('express')
    , app = express.createServer()
    , io  = require('socket.io').listen(app)
    , port = process.env.PORT || 3000;

app.listen(port);

// routing

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
      app.use(app.router);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// assuming io is the Socket.IO server object
io.configure(function () {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
});

// username which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1', 'room2', 'room3'];

io.sockets.on('connection', function (socket) {

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    // send client to room 1
    socket.join('room1');
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER', 'you have connected to room1');
    // echo to room 1 that a person has connected to their room
    socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
    // update the list of users in chat, client-side
    socket.emit('updaterooms', rooms, 'room1');
  });

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.sockets.in(socket.room).emit('updatechat', socket.username, data);
  });

  socket.on('switchRoom', function(newroom) {
    // leave the current room (stored in session)
    socket.leave(socket.room);
    // join new room, socket received as function parameter
    socket.join(newroom);
    socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
    //sent message to OLD room
    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + 'has left this room');
    // update socket session room title
    socket.room = newroom
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + 'has joined this room');
    socket.emit('updaterooms', rooms, newroom);
  });

  socket.on('disconnect', function () {
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});
