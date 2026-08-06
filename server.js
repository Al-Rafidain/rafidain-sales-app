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
app.use(express.static(path.join(__dirname, '../'))); // يشغل index.html

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// قاعدة بيانات - هسه محلي بعدين نبدلها بمونكو
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/rafidain');

const Room = mongoose.model('Room', { id: String, name: String, owner: String });

io.on('connection', (socket) => {
  console.log('مستخدم اتصل:', socket.id);

  socket.on('getRooms', async () => {
    const rooms = await Room.find();
    socket.emit('roomsUpdate', rooms);
  });

  socket.on('createRoom', async (data) => {
    const room = new Room(data);
    await room.save();
    io.emit('roomsUpdate', await Room.find()); // نحدث الكل
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`السيرفر شغال على المنفذ ${PORT}`));
