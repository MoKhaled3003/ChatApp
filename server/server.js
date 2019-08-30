const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
const {isRealString} = require('./utils/validators');
var {generateMessage,generateLocMessage} = require('./utils/utils');

const publicPath = path.join(__dirname,'../public');
var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

io.on('connection',(socket)=>{
    console.log('user connected');

    socket.on('join',(params,callback)=>{
        if(!isRealString(params.name) || !isRealString(params.room)){
            callback('provide a valid name and room name');
        }
        socket.join(params.room);
        socket.emit('newMessage',generateMessage('Admin','welcome to chat app'));
        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined.`));

        socket.on('createMessage',(message,callback)=>{
            console.log(message);
            io.emit('newMessage',generateMessage(params.name,message.text));
            callback();
    
        });

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