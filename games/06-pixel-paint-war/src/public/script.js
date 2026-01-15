// Initialize Socket.io connection
const socket = io();

// UI Elements
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gridContainer = document.getElementById('grid');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const joinInput = document.getElementById('join-input');
const waitingMsg = document.getElementById('waiting-message');
const roomDisplay = document.getElementById('room-display');
const timerVal = document.getElementById('timer-val');
const playerStatus = document.getElementById('player-status');
const winnerDisplay = document.getElementById('winner-display');
const redFinal = document.getElementById('red-final');
const blueFinal = document.getElementById('blue-final');

// Local Game State
let currentRoom = null;
let myRole = null; // 1 = Red, 2 = Blue

// --- LOBBY LOGIC ---

// Create Game: Client sends 'createGame' to server
createBtn.addEventListener('click', () => {
    socket.emit('createGame');
});

// Join Game: Client sends 'joinGame' + code to server
joinBtn.addEventListener('click', () => {
    const code = joinInput.value.trim();
    if (code.length === 5) {
        socket.emit('joinGame', code);
    } else {
        alert('Please enter a 5-letter code.');
    }
});

// Server says room is created (for Player 1)
socket.on('roomCreated', ({ roomCode, playerRole }) => {
    currentRoom = roomCode;
    myRole = playerRole;
    waitingMsg.style.display = 'block';
    roomDisplay.innerText = roomCode;
    createBtn.style.display = 'none';
    joinBtn.style.display = 'none';
    joinInput.style.display = 'none';

    // Set UI to red
    playerStatus.innerText = 'You are Red';
    playerStatus.classList.add('red');
});

// Server says joint successfully (for Player 2)
socket.on('gameJoined', ({ roomCode, playerRole }) => {
    currentRoom = roomCode;
    myRole = playerRole;

    // Set UI to blue
    playerStatus.innerText = 'You are Blue';
    playerStatus.classList.add('blue');
});

socket.on('error', (msg) => {
    alert(msg);
});

// --- GAMEPLAY LOGIC ---

// Server starts the game when 2 players are in
socket.on('gameStart', ({ board }) => {
    lobbyScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    renderBoard(board);
});

// Create the 4x4 grid in the DOM
function renderBoard(board) {
    gridContainer.innerHTML = '';
    board.forEach((value, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');

        // Value 1 = Red, Value 2 = Blue, 0 = Empty
        if (value === 1) tile.classList.add('red');
        if (value === 2) tile.classList.add('blue');

        // Handle tile click
        tile.addEventListener('click', () => {
            // // Client sends 'tileClick' event -> Server receives and updates global state
            socket.emit('tileClick', {
                roomCode: currentRoom,
                tileIndex: index,
                playerRole: myRole
            });
        });

        gridContainer.appendChild(tile);
    });
}

// Server sends updated board after any player clicks
socket.on('updateBoard', (newBoard) => {
    renderBoard(newBoard);
});

// Server broadcasts the synchronized timer every second
socket.on('timerUpdate', (seconds) => {
    timerVal.innerText = seconds;
});

// Server signals the game is over and sends results
socket.on('gameOver', ({ winner, redCount, blueCount }) => {
    gameOverScreen.style.display = 'flex';
    winnerDisplay.innerText = winner;
    redFinal.innerText = redCount;
    blueFinal.innerText = blueCount;
});
