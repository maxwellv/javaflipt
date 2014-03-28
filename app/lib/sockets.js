'use strict';

exports.connection = function(socket){
  socket.emit('online', {date: new Date()});//sends message out
  socket.on('newMessage', messageReceived);//handles message coming in
  socket.on('ping', pong);
};

function pong(){
  this.emit('pong', 'Ping received, response sent.');
}

function messageReceived(data){
  //this function is called by the server receiving a message sent by the client's socket.emit
  //"this" is the client in question
  console.log('message received:', data.text);
  //this.broadcast.emit('message', data.text);
  this.emit('message', data.text);
}

