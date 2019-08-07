const express = require('express');
const app = express();
const io = require('socket.io');
const  bodyParser  = require("body-parser");

const http = require('http').Server(app);
const socket = io(http);
const port = 3000;

const Chat =  require('./Schema/ChatSchema');
const connect = require('./configs/db');

app.use(bodyParser.json());
app.use("/chats", require('./routes/index'));

socket.on("connection", (socket)=>{
    console.log("user connected");
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });  
    socket.on("chat message", function(msg) {
        console.log("message: "  +  msg);
        //broadcast message to everyone in port:5000 except yourself.
        socket.broadcast.emit("received", { message: msg  });

        //save chat to the database
        connect.then(db  =>  {
            console.log("connected correctly to the server");

            let  chatMessage  =  new Chat({ message: msg, sender: "Anonymous"});
            chatMessage.save();
        });
    });
});

socket.on("chat message", function(msg) {
    console.log("message: "  +  msg);
    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit("received", { message: msg  });
});

http.listen(port, ()=>{
    console.log("App listening in port:", port);
});



