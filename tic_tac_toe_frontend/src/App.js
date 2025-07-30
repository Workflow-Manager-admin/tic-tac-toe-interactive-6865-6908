import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Tic Tac Toe Game
 * - 2-player and AI mode
 * - Modern, minimal, responsive
 * - Score tracking, status, restart
 */

// THEME COLORS (from requirements)
const COLORS = {
  primary: "#3f51b5",
  secondary: "#f50057",
  accent: "#ffeb3b",
};

/**
 * Square component for a single cell.
 * @param {object} props
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={`cell ${value ? value : "empty"}`}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

/**
 * Game board: 3x3 grid
 * @param {object} props
 */
function Board({ squares, onSquareClick, winningLine }) {
  return (
    <div className="ttt-board">
      {[0, 1, 2].map(row =>
        <div className="ttt-row" key={row}>
          {[0, 1, 2].map(col => {
            const idx = 3 * row + col;
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onClick={() => onSquareClick(idx)}
                highlight={winningLine && winningLine.includes(idx)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Checks for a winner.
 * @param {Array} squares
 * @returns {object} {winner, line} or null
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line };
    }
  }
  if (squares.every(x => x)) {
    return { winner: null, line: null }; // Draw
  }
  return null; // Game on
}

/**
 * Basic AI for single-player mode.
 * Picks first available square (can be improved).
 */
function aiMove(squares, aiChar) {
  // Try to win
  for (let idx = 0; idx < 9; idx++) {
    if (!squares[idx]) {
      const clone = squares.slice();
      clone[idx] = aiChar;
      if (calculateWinner(clone)?.winner === aiChar) return idx;
    }
  }
  // Block opponent
  const player = aiChar === "O" ? "X" : "O";
  for (let idx = 0; idx < 9; idx++) {
    if (!squares[idx]) {
      const clone = squares.slice();
      clone[idx] = player;
      if (calculateWinner(clone)?.winner === player) return idx;
    }
  }
  // Pick center
  if (!squares[4]) return 4;
  // First available
  for (let idx = 0; idx < 9; idx++) if (!squares[idx]) return idx;
  return null;
}

// PUBLIC_INTERFACE
function App() {
  const [mode, setMode] = useState("2p"); // "2p" or "ai"
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("");
  const [score, setScore] = useState({ X: 0, O: 0, Draw: 0 });
  const [winningLine, setWinningLine] = useState(null);

  // For accessibility/UI
  useEffect(() => {
    document.body.style.background = "#fff";
  }, []);

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    setMode(newMode);
    handleRestart();
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || calculateWinner(squares)) return;
    const nextChar = xIsNext ? "X" : "O";
    const newSquares = squares.slice();
    newSquares[idx] = nextChar;
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus("");
    setWinningLine(null);
  }

  // Game state update
  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      if (result.winner === "X" || result.winner === "O") {
        setStatus(`Winner: ${result.winner}`);
        setWinningLine(result.line);
        setScore(score => ({
          ...score,
          [result.winner]: score[result.winner] + 1,
        }));
      } else if (result.winner == null) {
        setStatus("Draw!");
        setScore(score => ({
          ...score,
          Draw: score.Draw + 1,
        }));
      }
    } else {
      setStatus(`Next: ${xIsNext ? "X" : "O"}`);
      setWinningLine(null);
    }
  }, [squares]);

  // AI Move (if mode is "ai" and it's O's turn)
  useEffect(() => {
    if (
      mode === "ai" &&
      !calculateWinner(squares) &&
      !xIsNext // AI is always "O"
    ) {
      const move = aiMove(squares, "O");
      if (move !== null) {
        const newSquares = squares.slice();
        newSquares[move] = "O";
        setTimeout(() => {
          setSquares(newSquares);
          setXIsNext(true);
        }, 400); // delay for UI effect
      }
    }
  }, [xIsNext, mode, squares]);

  // PUBLIC_INTERFACE
  function renderStatus() {
    return (
      <div className="ttt-status" aria-live="polite">
        {status}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderScore() {
    return (
      <div className="ttt-score">
        <span>
          <strong style={{ color: COLORS.primary }}>X</strong>: {score.X}{" "}
        </span>
        <span>
          <strong style={{ color: COLORS.secondary }}>O</strong>: {score.O}{" "}
        </span>
        <span>
          <strong style={{ color: COLORS.accent }}>Draw</strong>: {score.Draw}
        </span>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderModeSwitch() {
    return (
      <div className="ttt-mode-switch" role="group" aria-label="Game mode">
        <button
          className={`ttt-btn${mode === "2p" ? " active" : ""}`}
          style={mode === "2p" ? { background: COLORS.primary } : {}}
          onClick={() => handleModeChange("2p")}
        >
          2-Player
        </button>
        <button
          className={`ttt-btn${mode === "ai" ? " active" : ""}`}
          style={mode === "ai" ? { background: COLORS.secondary } : {}}
          onClick={() => handleModeChange("ai")}
        >
          Play vs AI
        </button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderRestart() {
    return (
      <button
        className="ttt-btn restart"
        style={{ background: COLORS.accent, color: "#333" }}
        onClick={handleRestart}
        aria-label="Restart game"
      >
        Restart
      </button>
    );
  }

  return (
    <div className="ttt-app-container">
      <div className="ttt-game-panel">
        <header>
          <h1 className="ttt-title">Tic Tac Toe</h1>
          {renderModeSwitch()}
          {renderScore()}
        </header>
        <main>
          {renderStatus()}
          <Board
            squares={squares}
            onSquareClick={idx =>
              !calculateWinner(squares) &&
              (mode === "2p" || (mode === "ai" && xIsNext))
                ? handleSquareClick(idx)
                : null
            }
            winningLine={winningLine}
          />
        </main>
        <footer>
          {renderRestart()}
        </footer>
      </div>
      <div className="ttt-credit">
        <small>
          Made with <span style={{ color: COLORS.secondary }}>♥</span> React
        </small>
      </div>
    </div>
  );
}

export default App;
