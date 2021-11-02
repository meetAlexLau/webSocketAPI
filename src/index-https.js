const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./UserSchema');


const key = fs.readFileSync('/certs/cert.key');
const cert = fs.readFileSync('/certs/cert.crt');
const app = express();
const server = https.createServer({key, cert}, app);
const io = new Server(server);

app.use(bodyParser.json({limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())

const users = {};

const CONNECTION_URL = 'mongodb+srv://timhsu:7xvPjvAEI3jMuhhf@users.xnee2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const PORT = process.env.PORT || 443;
const MONGOOSE_PORT = 5001

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  if(!users[socket.id]){
    users[socket.id] = [socket.id, " has entered the server"];
    io.sockets.emit('entered', users);
    socket.on('go somewhere', function(users) {
      io.sockets.emit('go somewhere', users);
    })

    mongoose.connect(CONNECTION_URL, { useNewUrlparser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Local Database Connected");
    }, error => {
      console.log(error);
      console.log("Local Database Error Connection");
    });

    let newUser = new User({ name: socket.id, location: "Place" })
    newUser.save()
    // .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    // .catch((error) => console.log(error.message))
  }
});


server.listen(PORT, () => {
  console.log(`listening on PORT:${PORT}`);
});
http.createServer(app).listen(80);