const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
const {isRealString} = require('./utils/validators');
var {generateMessage,generateLocMessage} = require('./utils/utils');
var {Users} = require('./utils/users');

const publicPath = path.join(__dirname,'../public');
var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIo(server);
var users = new Users();

io.on('connection',(socket)=>{
    console.log('user connected');

    socket.on('join',(params,callback)=>{
        if(!isRealString(params.name) || !isRealString(params.room)){
           return callback('provide a valid name and room name');
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room);
        io.to(params.room).emit('updateUsersList',users.getUsersList(params.room));
        socket.emit('newMessage',generateMessage('Admin','welcome to chat app'));
        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined.`));

        callback();

    });

    socket.on('createMessage',(message,callback)=>{
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
        }
        callback();

    });

    socket.on('createLocMessage',(coords,callback)=>{
        var user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocMessage',generateLocMessage(user.name,coords.latitude,coords.longitude));
        }
        callback();
    });
    socket.on('disconnect',()=>{
        var user = users.removeUser(socket.id);

        io.to(user.room).emit('updateUsersList',users.getUsersList(user.room));
        io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has Left`));

    });
   
});

app.use(express.static(publicPath));

server.listen(port,()=>{
    console.log(`server is on ${port}`);
});