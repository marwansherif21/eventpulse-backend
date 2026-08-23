require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-event', (eventId) => {
        if (eventId) socket.join(String(eventId));
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

connectDB()
    .then(() => {
        httpServer.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Unable to start server:', error.message);
        process.exitCode = 1;
    });