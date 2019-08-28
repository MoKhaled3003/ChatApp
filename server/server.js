const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
var {generateMessage,generateLocMessage} = require('./utils/utils');

const publicPath = path.join(__dirname,'../public');
var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

io.on('connection',(socket)=>{
    console.log('user connected');

    socket.emit('newMessage',generateMessage('Admin','welcome to chat app'));
    socket.broadcast.emit('newMessage',generateMessage('Admin','new user joined'));

    socket.on('createMessage',(message,callback)=>{
        console.log(message);
        io.emit('newMessage',generateMessage(message.from,message.text));
        callback();

    });

    socket.on('createLocMessage',(coords,callback)=>{
        io.emit('newLocMessage',generateLocMessage('Admin',coords.latitude,coords.longitude));
        callback();
    });
});

app.use(express.static(publicPath));

server.listen(port,()=>{
    console.log(`server is on ${port}`);
});