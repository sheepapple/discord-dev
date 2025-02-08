const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve gauge.html when visiting the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gauge.html'));
});

// Start server
server.listen(3000, () => {
    console.log('Gauge activity server listening on port 3000');
});

/*
// Example: Emitting a test volume update every 5 seconds (for debugging)
setInterval(() => {
    const testDb = -90 + Math.random() * 90; // random dB between -90 and 0
    console.log('Emitting test volumeUpdate:', testDb);
    io.emit('volumeUpdate', testDb);
  }, 5000);
*/

module.exports = io; // Export Socket.IO instance


