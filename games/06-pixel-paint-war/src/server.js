const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Store active game rooms
// Key: roomCode, Value: { players: [], board: [], timer: 15, isActive: false }
const rooms = {};

// Helper to generate a random 5-letter Room Code
function generateRoomCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. CREATE GAME
    socket.on('createGame', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            players: [socket.id], // Player 1
            board: new Array(16).fill(0), // 4x4 grid (0=Empty, 1=Red, 2=Blue)
            timer: 15,
            isActive: false
        };
        socket.join(roomCode);
        
        // Tell the client the room code and their role
        socket.emit('roomCreated', { roomCode, playerRole: 1 });
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    // 2. JOIN GAME
    socket.on('joinGame', (roomCode) => {
        const code = roomCode.toUpperCase();
        const room = rooms[code];

        if (room && room.players.length === 1) {
            room.players.push(socket.id); // Player 2
            socket.join(code);
            
            // Tell the client their role
            socket.emit('gameJoined', { roomCode: code, playerRole: 2 });
            
            // Start the game since we have 2 players
            startGame(code);
            console.log(`User ${socket.id} joined room: ${code}`);
        } else {
            socket.emit('error', 'Room not found or already full.');
        }
    });

    // 3. TILE CLICK (The Core Gameplay)
    socket.on('tileClick', ({ roomCode, tileIndex, playerRole }) => {
        const room = rooms[roomCode];
        if (room && room.isActive) {
            // Update the board state on the server
            // 1 = Red (Player 1), 2 = Blue (Player 2)
            room.board[tileIndex] = playerRole;

            // Broadcast the updated board to ALL players in that room
            // // Server sends 'updateBoard' event -> Both clients re-render
            io.to(roomCode).emit('updateBoard', room.board);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // In a real app, we would clean up empty rooms here.
    });
});

function startGame(roomCode) {
    const room = rooms[roomCode];
    room.isActive = true;

    // Tell both players the game has started
    io.to(roomCode).emit('gameStart', { board: room.board });

    // Server-side timer to ensure both screens are perfectly synced
    const countdown = setInterval(() => {
        room.timer--;

        // Broadcast the current time to the room
        io.to(roomCode).emit('timerUpdate', room.timer);

        if (room.timer <= 0) {
            clearInterval(countdown);
            endGame(roomCode);
        }
    }, 1000);
}

function endGame(roomCode) {
    const room = rooms[roomCode];
    room.isActive = false;

    // Count tiles for each player
    const redCount = room.board.filter(tile => tile === 1).length;
    const blueCount = room.board.filter(tile => tile === 2).length;

    let winner = 'Draw';
    if (redCount > blueCount) winner = 'Red Wins!';
    else if (blueCount > redCount) winner = 'Blue Wins!';

    // Send the final result to everyone in the room
    io.to(roomCode).emit('gameOver', {
        winner,
        redCount,
        blueCount
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
