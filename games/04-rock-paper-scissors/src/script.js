/**
 * Rock Paper Scissors - Educational Game
 *
 * This script demonstrates:
 * 1. DOM selection and manipulation
 * 2. Event listeners and handling
 * 3. Conditional logic and game state management
 */

// --- Game State Variables ---
let playerScore = 0;
let computerScore = 0;
const WINNING_SCORE = 3;
let isGameOver = false;

// --- DOM Elements ---
const landingScreen = document.getElementById("landing-screen");
const gameScreen = document.getElementById("game-screen");
const usernameInput = document.getElementById("username-input");
const startBtn = document.getElementById("start-btn");
const errorMessage = document.getElementById("error-message");
const playerLabel = document.getElementById("player-label");
const changeNameBtn = document.getElementById("change-name-btn");
const leaderboardContainer = document.getElementById("leaderboard-container");

const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const resultTextEl = document.getElementById("result-text");
const roundInfoEl = document.getElementById("round-info");
const resetBtn = document.getElementById("reset-btn");
const choiceButtons = document.querySelectorAll(".choice-btn");

// --- Initialization ---
loadLeaderboard();

// --- Event Listeners ---

// Start game button
startBtn.addEventListener("click", startGame);

// Change name button
changeNameBtn.addEventListener("click", changeName);

// Allow pressing Enter in the username input
usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") startGame();
});

// Listen for clicks on player choice buttons
choiceButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (!isGameOver) {
      playRound(button.id);
    }
  });
});

// Listen for click on reset button
resetBtn.addEventListener("click", resetGame);

// --- Core Game Functions ---

/**
 * Validates username and switches from landing to game screen
 */
function startGame() {
  const username = usernameInput.value.trim();

  if (username === "") {
    errorMessage.classList.remove("hidden");
    usernameInput.style.borderColor = "var(--danger)";
    return;
  }

  // Set player label
  playerLabel.textContent = username;

  // Transition screens
  landingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

/**
 * Returns to the landing screen to change the name
 */
function changeName() {
  resetGame();
  landingScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

/**
 * Executes one round of the game based on the player's choice
 * @param {string} playerChoice - 'rock', 'paper', or 'scissors'
 */
function playRound(playerChoice) {
  const computerChoice = getComputerChoice();
  const result = determineWinner(playerChoice, computerChoice);

  updateScore(result);
  displayRoundResult(result, playerChoice, computerChoice);
  checkGameOver();
}

/**
 * Randomly generates a choice for the computer
 * @returns {string} 'rock', 'paper', or 'scissors'
 */
function getComputerChoice() {
  const choices = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

/**
 * Determines the winner of a single round
 * @param {string} player - player's choice
 * @param {string} computer - computer's choice
 * @returns {string} 'player', 'computer', or 'draw'
 */
function determineWinner(player, computer) {
  if (player === computer) return "draw";

  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "player";
  }

  return "computer";
}

/**
 * Updates the score counts and DOM elements
 * @param {string} roundWinner
 */
function updateScore(roundWinner) {
  if (roundWinner === "player") {
    playerScore++;
    playerScoreEl.textContent = playerScore;
  } else if (roundWinner === "computer") {
    computerScore++;
    computerScoreEl.textContent = computerScore;
  }
}

/**
 * Updates the UI messages based on round result
 */
function displayRoundResult(result, player, computer) {
  const emojis = {rock: "✊", paper: "✋", scissors: "✌️"};

  roundInfoEl.innerText = `You chose ${emojis[player]} • Computer chose ${emojis[computer]}`;

  resultTextEl.classList.remove("win", "lose", "draw");

  if (result === "player") {
    resultTextEl.textContent = "You win this round!";
    resultTextEl.classList.add("win");
  } else if (result === "computer") {
    resultTextEl.textContent = "Computer wins this round!";
    resultTextEl.classList.add("lose");
  } else {
    resultTextEl.textContent = "It's a draw!";
    resultTextEl.classList.add("draw");
  }
}

/**
 * Checks if a player has reached the winning score
 */
function checkGameOver() {
  if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
    isGameOver = true;

    // Disable choice buttons
    choiceButtons.forEach(btn => btn.disabled = true);

    // Display final result
    if (playerScore === WINNING_SCORE) {
      resultTextEl.textContent = "CONGRATULATIONS! YOU WON THE GAME! 🏆";
      resultTextEl.className = "win";
    } else {
      resultTextEl.textContent = "GAME OVER! COMPUTER WON THE GAME. 🤖";
      resultTextEl.className = "lose";
    }

    roundInfoEl.textContent = "Click \"Play Again\" to restart.";

    // Show reset button
    resetBtn.style.display = "block";

    // Save result to leaderboard if player won
    if (playerScore === WINNING_SCORE) {
      saveToLeaderboard(playerLabel.textContent, playerScore);
    }
  }
}

/**
 * Saves a winning result to local storage
 * @param {string} name
 * @param {number} score
 */
function saveToLeaderboard(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("rps-leaderboard")) || [];
  leaderboard.push({name, score, date: new Date().toLocaleDateString()});

  // Keep only top 10 or recent 10 items
  leaderboard = leaderboard.slice(-10).reverse();

  localStorage.setItem("rps-leaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

/**
 * Loads and displays the leaderboard from local storage
 */
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("rps-leaderboard")) || [];

  if (leaderboard.length === 0) {
    leaderboardContainer.innerHTML = "<p class=\"empty-list\">No games won yet.</p>";
    return;
  }

  leaderboardContainer.innerHTML = leaderboard.map(item => `
        <div class="leaderboard-item">
            <span class="leaderboard-name">${item.name}</span>
            <span class="leaderboard-score">${item.score} Wins • ${item.date}</span>
        </div>
    `).join("");
}

/**
 * Resets the game to initial state
 */
function resetGame() {
  playerScore = 0;
  computerScore = 0;
  isGameOver = false;

  playerScoreEl.textContent = 0;
  computerScoreEl.textContent = 0;

  resultTextEl.textContent = "Choose your weapon!";
  resultTextEl.classList.remove("win", "lose", "draw");
  roundInfoEl.textContent = "The game is waiting for your move.";

  choiceButtons.forEach(btn => btn.disabled = false);
  resetBtn.style.display = "none";
}
