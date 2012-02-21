var socket = io.connect(window.location.hostname);
var date = new Date();

// on connection to server, ask for user's name with an anonmyous callback
socket.on('connect', function() {
  //call the server-side function 'adduser' and send one parameter (value of prompt)
  socket.emit('adduser', prompt("What's your name?"));
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function(username, data) {
  $('#conversation').append('<b style="font-size:8px;">' + date.toString() + '</b>' + ' <b>' + username + ':</b> ' + data + '<br>');
});

// listener, whenever the server emits 'updaterooms', this updates the room the client
socket.on('updaterooms', function (rooms, current_room) {
  $('#rooms').empty();
  $.each(rooms, function(key, value) {
    if (value == current_room) {
      $('#rooms').append('<div>' + value + '</div>');
    }
    else {
      $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
    }
  });
});

function switchRoom(room) {
  socket.emit('switchRoom', room);
}

// on load of page
$(function() {
  // when the client clicks SEND
  $('#datasend').click(function() {
    var message = $('#data').val();
    $('#data').val('');
    // tell the server to execute 'sendchat' and send along one parameter
    socket.emit('sendchat', message);
  });

  // when the client hits ENTER on their keyboard
  $('#data').keypress(function(e) {
    if(e.which == 13) {
      $(this).blur();
      $('#datasend').focus().click();
    }
  });
});
