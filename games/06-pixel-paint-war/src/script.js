import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, serverTimestamp, get } from "firebase/database";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// UI Elements
const lobbyScreen = document.getElementById("lobby-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const gridContainer = document.getElementById("grid");
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const joinInput = document.getElementById("join-input");
const waitingMsg = document.getElementById("waiting-message");
const roomDisplay = document.getElementById("room-display");
const timerVal = document.getElementById("timer-val");
const playerStatus = document.getElementById("player-status");
const winnerDisplay = document.getElementById("winner-display");
const redFinal = document.getElementById("red-final");
const blueFinal = document.getElementById("blue-final");

// Local Game State
let currentRoom = null;
let myRole = null; // 1 = Red, 2 = Blue
let gameActive = false;

// --- UTILS ---
function generateRoomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

// --- LOBBY LOGIC ---

createBtn.addEventListener("click", async () => {
  const roomCode = generateRoomCode();
  currentRoom = roomCode;
  myRole = 1;

  const roomRef = ref(db, 'rooms/' + roomCode);
  await set(roomRef, {
    player1: "active",
    player2: null,
    board: new Array(16).fill(0),
    status: "waiting",
    startTime: null
  });

  setupRoomListener(roomCode);

  // UI Update
  waitingMsg.style.display = "block";
  roomDisplay.innerText = roomCode;
  createBtn.style.display = "none";
  joinBtn.style.display = "none";
  joinInput.style.display = "none";
  playerStatus.innerText = "You are Red";
  playerStatus.classList.add("red");
});

joinBtn.addEventListener("click", async () => {
  const code = joinInput.value.trim().toUpperCase();
  if (code.length !== 5) return alert("Enter 5-letter code.");

  const roomRef = ref(db, 'rooms/' + code);
  const snapshot = await get(roomRef);

  if (snapshot.exists() && !snapshot.val().player2) {
    currentRoom = code;
    myRole = 2;

    await update(roomRef, {
      player2: "active",
      status: "playing",
      startTime: serverTimestamp() // Official start time
    });

    setupRoomListener(code);

    playerStatus.innerText = "You are Blue";
    playerStatus.classList.add("blue");
  } else {
    alert("Room full or doesn't exist.");
  }
});

// --- GAME SYNC ---

function setupRoomListener(roomCode) {
  const roomRef = ref(db, 'rooms/' + roomCode);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Handle Game Start
    if (data.status === "playing" && !gameActive) {
      startGame(data);
    }

    // Handle Board Updates
    if (gameActive) {
      renderBoard(data.board);
    }

    // Handle Game Over
    if (data.status === "finished") {
      showResults(data);
    }
  });
}

function startGame(data) {
  gameActive = true;
  lobbyScreen.style.display = "none";
  gameScreen.style.display = "block";

  // Start Local Timer synced to Database
  const startAt = data.startTime; // Might be slightly null initially until sync
  if (!startAt) return;

  const timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startAt) / 1000);
    const remaining = Math.max(0, 15 - elapsed);

    timerVal.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (myRole === 1) endGame(data.board); // Only Player 1 "calls" the end
    }
  }, 100);
}

function renderBoard(board) {
  gridContainer.innerHTML = "";
  board.forEach((value, index) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (value === 1) tile.classList.add("red");
    if (value === 2) tile.classList.add("blue");

    // Every game must include logic for Touch Events in addition to click
    const handleAction = (e) => {
      e.preventDefault(); // Prevent double trigger on mobile
      if (gameActive) {
        const newBoard = [...board];
        newBoard[index] = myRole;
        // Sync the new board state to the Cloud
        update(ref(db, 'rooms/' + currentRoom), { board: newBoard });
      }
    };

    // Handle both Desktop clicks and Mobile touches
    tile.addEventListener("click", handleAction);
    tile.addEventListener("touchstart", handleAction, { passive: false });

    gridContainer.appendChild(tile);
  });
}

// TODO: Generate asset via Nano Banana: Individual grid tile pixel art with glowing borders.
// Using colored squares as placeholders for now per gemini.md guidelines.

async function endGame(finalBoard) {
  gameActive = false;
  const redCount = finalBoard.filter(tile => tile === 1).length;
  const blueCount = finalBoard.filter(tile => tile === 2).length;

  let winner = "Draw";
  if (redCount > blueCount) winner = "Red Wins!";
  else if (blueCount > redCount) winner = "Blue Wins!";

  await update(ref(db, 'rooms/' + currentRoom), {
    status: "finished",
    winner,
    redCount,
    blueCount
  });
}

function showResults(data) {
  gameOverScreen.style.display = "flex";
  winnerDisplay.innerText = data.winner;
  redFinal.innerText = data.redCount;
  blueFinal.innerText = data.blueCount;
}
