import firebaseConfig from "./firebase-config.js";

let initializeApp, getDatabase, ref, set, onValue, update, serverTimestamp, get;
let db;

async function initGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const forceReal = urlParams.get('mode') === 'real';
  const shouldUseMock = !forceReal && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (shouldUseMock) {
    console.warn("Using MOCK Firebase (LocalStorage) for testing/local mode. Add ?mode=real to URL to test real backend.");
    const mock = await import("./mock-firebase.js");
    getDatabase = mock.getDatabase;
    ref = mock.ref;
    set = mock.set;
    onValue = mock.onValue;
    update = mock.update;
    serverTimestamp = mock.serverTimestamp;
    get = mock.get;

    // Mock Init
    db = getDatabase();
  } else {
    // Real Firebase
    const appMod = await import("firebase/app");
    const dbMod = await import("firebase/database");

    initializeApp = appMod.initializeApp;
    getDatabase = dbMod.getDatabase;
    ref = dbMod.ref;
    set = dbMod.set;
    onValue = dbMod.onValue;
    update = dbMod.update;
    serverTimestamp = dbMod.serverTimestamp;
    get = dbMod.get;

    // Initialize Firebase
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.error("Firebase Configuration is not set up yet!");
      alert("Notice: Firebase is not configured.");
    }
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }

  // Global Offset to sync local clock with Firebase Server clock
  let serverTimeOffset = 0;
  onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
    serverTimeOffset = snap.val() || 0;
  });

  // Start App Logic
  initializeUI(serverTimeOffset);
}

// Wrap original UI setup in function to run after imports
function initializeUI(serverTimeOffset) {


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
  let latestBoard = []; // Fix: Track the latest board state

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
    try {
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
    } catch (e) {
      console.error("Failed to create game:", e);
      alert("Error creating game. Please check your network connection or Firebase configuration.");
    }
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
        // Use Server Timestamp for high-precision game starting
        startTime: serverTimestamp()
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
        latestBoard = data.board; // Fix: Update latest board state
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
    const startAt = data.startTime;
    // Wait for the server to sync the timestamp (initial value may be a local estimate object)
    if (!startAt || typeof startAt !== 'number') return;

    const timerInterval = setInterval(() => {
      // Current time adjusted by the server offset
      const now = Date.now() + serverTimeOffset;
      const elapsed = Math.floor((now - startAt) / 1000);
      const remaining = Math.max(0, 15 - elapsed);

      timerVal.innerText = remaining;

      if (remaining <= 0) {
        clearInterval(timerInterval);
        // To prevent race conditions, only Player 1 (Creator) triggers the end state
        if (myRole === 1) endGame(latestBoard); // Fix: Use latestBoard instead of initial data.board
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
}
initGame();
