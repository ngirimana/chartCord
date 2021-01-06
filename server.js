const express=require('express')
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/user');

const app =express();

const server=http.createServer(app);
const io=socketio(server); 
//set public folder
app.use(express.static(path.join(__dirname,'public')));
const bothName='ChardCord Bot';

//run when client connected

io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{

    const user=userJoin(socket.id,username,room);
    socket.join(user.room);
    //welcome current user
    socket.emit('message',formatMessage(bothName,'Welcome to ChatChord'))
    //broadcast when user connected
    socket.broadcast.to(user.room).emit("message", formatMessage(bothName,`${user.username} has joined the chat`));
    // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    })
   
    

    //listen for chat message
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    //when user disconnected
    socket.on('disconnect', ()=>{
    const user=userLeave(socket.id);
    if(user){
io.to(user.room).emit('message',formatMessage(bothName,` ${user.username} has left the chat`));
// Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }


    
    });

});

const port=process.env.PORT||3000


server.listen(port,()=>console.log(`Server is running on port ${port}`))