const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/rafidain');

const Room = mongoose.model('Room', { id: String, name: String, owner: String });

io.on('connection', (socket) => {
  console.log('مستخدم اتصل:', socket.id);
  
  socket.on('getRooms', async () => {
    const rooms = await Room.find();
    socket.emit('roomsUpdate', rooms);
  });
  
  socket.on('createRoom', async (data) => {
    await new Room(data).save();
    const rooms = await Room.find();
    io.emit('roomsUpdate', rooms);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`السيرفر شغال على ${PORT}`));
