// components/ChessGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Game } from 'js-chess-engine';
import './ChessGame.css';

// Game constants
const GAME_MODES = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced"
};

const RESULT_WIN = 1;
const RESULT_LOSS = 2;
const RESULT_DRAW = 3;

const END_CHECKMATE = 1;
const END_RESIGNATION = 2;
const END_TIMEOUT = 3;
const END_DRAW_AGREEMENT = 4;
const END_STALEMATE = 5;
const END_INSUFFICIENT_MATERIAL = 6;
const END_THREEFOLD_REPETITION = 7;
const END_FIFTY_MOVE_RULE = 8;

function ChessGame({ gameMode, onGameEnd, onGameStateChange }) {
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState({});
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentGameMode, setCurrentGameMode] = useState(gameMode || GAME_MODES.BEGINNER);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState("Select game mode and start a new game");
  const [isGameActive, setIsGameActive] = useState(false);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [playerTimer, setPlayerTimer] = useState(600); // 10 minutes by default
  const [aiTimer, setAiTimer] = useState(600);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const playerTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  
  const aiDifficulty = useRef({
    [GAME_MODES.BEGINNER]: 1,
    [GAME_MODES.INTERMEDIATE]: 2,
    [GAME_MODES.ADVANCED]: 3
  });

  // Report game state changes to parent
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(isGameActive);
    }
  }, [isGameActive, onGameStateChange]);

  // Update game mode when prop changes
  useEffect(() => {
    if (gameMode) {
      setCurrentGameMode(gameMode);
      updateTimerByDifficulty(gameMode);
    }
  }, [gameMode]);

  // Update timer based on difficulty
  const updateTimerByDifficulty = (mode) => {
    let timeLimit = 600; // Default 10 minutes for beginner
    
    if (mode === GAME_MODES.INTERMEDIATE) {
      timeLimit = 300; // 5 minutes
    } else if (mode === GAME_MODES.ADVANCED) {
      timeLimit = 180; // 3 minutes
    }
    
    setPlayerTimer(timeLimit);
    setAiTimer(timeLimit);
  };

  useEffect(() => {
    if (game && !isPlayerTurn && isGameActive) {
      // AI's turn
      makeAIMove();
    }
  }, [isPlayerTurn, game, isGameActive]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    };
  }, []);

  const startNewGame = () => {
    // Update timer based on selected difficulty
    updateTimerByDifficulty(currentGameMode);
    
    const newGame = new Game();
    setGame(newGame);
    setBoard(newGame.exportJson().pieces);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setIsPlayerTurn(true);
    setGameStatus(`Game started! You're playing as white against ${currentGameMode} AI.`);
    setIsGameActive(true);
    setShowBoard(true);
    
    // Notify parent component about game state change
    if (onGameStateChange) {
      onGameStateChange(true);
    }
    
    // Start player's timer
    startPlayerTimer();
  };

  const startPlayerTimer = () => {
  if (aiTimerRef.current) clearInterval(aiTimerRef.current);
  playerTimerRef.current = setInterval(() => {
    setPlayerTimer(prev => {
      if (prev <= 1) {
        clearInterval(playerTimerRef.current);
        // Only call handleTimeout if the game is still active
        if (isGameActive) {
          handleTimeout();
        }
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

  const startAiTimer = () => {
    if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    aiTimerRef.current = setInterval(() => {
      setAiTimer(prev => {
        if (prev <= 1) {
          clearInterval(aiTimerRef.current);
          // AI timeout - player wins
          showNotification("AI ran out of time! You win!", "success");
          handleGameEnd(RESULT_WIN, END_TIMEOUT);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
  // Player timeout - player loses
  showNotification("Time's up! You lost the game.", "error");
  
  // Set game as inactive immediately to prevent double calls
  setIsGameActive(false);
  
  // Call handleGameEnd with a slight delay to ensure state update
  setTimeout(() => {
    handleGameEnd(RESULT_LOSS, END_TIMEOUT);
  }, 100);
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Display notification
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSquareClick = (square) => {
    if (!isGameActive || !isPlayerTurn) return;

    // If no piece is selected yet
    if (!selectedPiece) {
      const piece = board[square];
      if (piece && isWhitePiece(piece)) {
        setSelectedPiece(square);
        const moves = game.moves(square);
        setPossibleMoves(moves || []);
      }
    } 
    // If a piece is already selected
    else {
      // If clicking on a possible move square
      if (possibleMoves.includes(square)) {
        try {
          // Make the move
          game.move(selectedPiece, square);
          setBoard(game.exportJson().pieces);
          setSelectedPiece(null);
          setPossibleMoves([]);
          
          // Check if game is over after player's move
          const gameState = game.exportJson();
          if (gameState.isFinished) {
            if (gameState.checkMate) {
              showNotification("Checkmate! You won the game!", "success");
              handleGameEnd(RESULT_WIN, END_CHECKMATE);
            } else if (gameState.stalemate) {
              showNotification("Stalemate! The game is a draw.", "info");
              handleGameEnd(RESULT_DRAW, END_STALEMATE);
            } else {
              showNotification("Draw! The game ended in a draw.", "info");
              handleGameEnd(RESULT_DRAW, END_DRAW_AGREEMENT);
            }
            return;
          }
          
          setIsPlayerTurn(false);
          setGameStatus("AI is thinking...");
        } catch (error) {
          console.error("Invalid move:", error);
          showNotification("Invalid move! Try again.", "error");
        }
      } 
      // If clicking on another own piece
      else if (board[square] && isWhitePiece(board[square])) {
        setSelectedPiece(square);
        const moves = game.moves(square);
        setPossibleMoves(moves || []);
      } 
      // If clicking elsewhere, deselect
      else {
        setSelectedPiece(null);
        setPossibleMoves([]);
      }
    }
  };

  const makeAIMove = () => {
    // Start AI "thinking" timer
    startAiTimer();
    
    setTimeout(() => {
      if (!game || !isGameActive) return;
      
      try {
        const aiMove = game.aiMove(aiDifficulty.current[currentGameMode]);
        const from = Object.keys(aiMove)[0];
        const to = aiMove[Object.keys(aiMove)[0]];
        
        setBoard(game.exportJson().pieces);
        
        // Check if game is over after AI's move
        const gameState = game.exportJson();
        if (gameState.isFinished) {
          if (gameState.checkMate) {
            showNotification("Checkmate! AI won the game.", "error");
            handleGameEnd(RESULT_LOSS, END_CHECKMATE);
          } else if (gameState.stalemate) {
            showNotification("Stalemate! The game is a draw.", "info");
            handleGameEnd(RESULT_DRAW, END_STALEMATE);
          } else {
            showNotification("Draw! The game ended in a draw.", "info");
            handleGameEnd(RESULT_DRAW, END_DRAW_AGREEMENT);
          }
          return;
        }
        
        setGameStatus(`AI moved ${from} to ${to}. Your turn!`);
        setIsPlayerTurn(true);
        
        // Start player's timer again
        startPlayerTimer();
      } catch (error) {
        console.error("AI move error:", error);
        showNotification("Error in AI move. Try restarting the game.", "error");
        setGameStatus("Error in AI move. Try restarting the game.");
      }
    }, 1000); // Simulate AI thinking time
  };

  const handleGameEnd = (result, endingType) => {
  // Stop all timers
  if (playerTimerRef.current) clearInterval(playerTimerRef.current);
  if (aiTimerRef.current) clearInterval(aiTimerRef.current);
  
  // Show a simple processing overlay
  setShowProcessingOverlay(true);
  
  let resultMessage = "";
  if (result === RESULT_WIN) {
    resultMessage = "You won!";
  } else if (result === RESULT_LOSS) {
    resultMessage = "You lost!";
  } else {
    resultMessage = "Game ended in a draw!";
  }
  
  setGameStatus(`Game over! ${resultMessage}`);
  
  // Wait a moment before recording result to blockchain
  setTimeout(() => {
    // Report the game result to the blockchain
    if (onGameEnd) {
      onGameEnd(result, endingType).then(() => {
        // After transaction and popup are complete, reset the game UI
        resetGameUI();
      }).catch(error => {
        console.error("Error in game end processing:", error);
        // Even on error, reset the game UI
        resetGameUI();
      });
    }
  }, 1500);
};

// Add a new function to reset the game UI
const resetGameUI = () => {
  // Clear the processing overlay
  setShowProcessingOverlay(false);
  
  // Reset the game state
  setGame(null);
  setBoard({});
  setSelectedPiece(null);
  setPossibleMoves([]);
  setIsPlayerTurn(true);
  setGameStatus("Select game mode and start a new game");
  setIsGameActive(false);
  setShowBoard(false);
  
  // Reset timers
  updateTimerByDifficulty(currentGameMode);
  
  // Notify parent component about game state change
  if (onGameStateChange) {
    onGameStateChange(false);
  }
};


  const isWhitePiece = (piece) => {
    return piece === piece.toUpperCase();
  };

  const handleResign = () => {
    if (isGameActive) {
      showNotification("You resigned the game.", "info");
      handleGameEnd(RESULT_LOSS, END_RESIGNATION);
    }
  };

  const offerDraw = () => {
    if (isGameActive) {
      showNotification("Draw offer accepted!", "info");
      handleGameEnd(RESULT_DRAW, END_DRAW_AGREEMENT);
    }
  };

  const resetGame = () => {
  // Check if there's an active game
  if (isGameActive) {
    // Ask for confirmation with transaction warning
    if (window.confirm("Abandoning this game will count as a loss and require a blockchain transaction. Continue?")) {
      // Show notification about the transaction
      showNotification("Processing resignation transaction...", "info");
      
      // Handle as resignation
      handleGameEnd(RESULT_LOSS, END_RESIGNATION);
      
      // The rest of the reset will happen after the transaction completes
      return;
    } else {
      // User canceled, don't reset
      return;
    }
  }
  
  // If no active game or user confirmed, proceed with normal reset
  if (playerTimerRef.current) clearInterval(playerTimerRef.current);
  if (aiTimerRef.current) clearInterval(aiTimerRef.current);
  
  setGame(null);
  setBoard({});
  setSelectedPiece(null);
  setPossibleMoves([]);
  setIsPlayerTurn(true);
  setGameStatus("Select game mode and start a new game");
  setIsGameActive(false);
  setShowBoard(false);
  
  // Notify parent component about game state change
  if (onGameStateChange) {
    onGameStateChange(false);
  }
  
  updateTimerByDifficulty(currentGameMode);
};


  const renderBoard = () => {
    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    return (
      <div className="chess-board">
        {rows.map((row) => (
          <div key={row} className="board-row">
            {cols.map((col) => {
              const square = `${col}${row}`;
              const piece = board[square];
              const isSelected = selectedPiece === square;
              const isPossibleMove = possibleMoves.includes(square);
              const isDark = (row + cols.indexOf(col)) % 2 === 1;
              
              return (
                <div
                  key={square}
                  className={`board-square ${isDark ? 'dark' : 'light'} 
                             ${isSelected ? 'selected' : ''} 
                             ${isPossibleMove ? 'possible-move' : ''}`}
                  onClick={() => handleSquareClick(square)}
                >
                  {piece && (
                    <div className={`chess-piece ${piece.toLowerCase()}`}>
                      {getPieceSymbol(piece)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const getPieceSymbol = (piece) => {
    const symbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece];
  };

  return (
    <div className="chess-game">
      {!showBoard ? (
        <div className="game-start-container">
          <div className="difficulty-selection">
            <h3>Select Difficulty</h3>
            <div className="difficulty-options">
              <button 
                className={currentGameMode === GAME_MODES.BEGINNER ? "selected" : ""}
                onClick={() => setCurrentGameMode(GAME_MODES.BEGINNER)}
              >
                Beginner (10 min)
              </button>
              <button 
                className={currentGameMode === GAME_MODES.INTERMEDIATE ? "selected" : ""}
                onClick={() => setCurrentGameMode(GAME_MODES.INTERMEDIATE)}
              >
                Intermediate (5 min)
              </button>
              <button 
                className={currentGameMode === GAME_MODES.ADVANCED ? "selected" : ""}
                onClick={() => setCurrentGameMode(GAME_MODES.ADVANCED)}
              >
                Advanced (3 min)
              </button>
            </div>
            <button className="start-game-btn" onClick={startNewGame}>
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="game-layout">
          <div className="game-board-container">
            <div className="game-status">{gameStatus}</div>
            {renderBoard()}
            <div className="timer-container">
              <div className="timer ai-timer">AI: {formatTime(aiTimer)}</div>
              <div className="timer player-timer">You: {formatTime(playerTimer)}</div>
            </div>
          </div>
          
          <div className="game-controls-sidebar">
            <button className="control-btn new-game-btn" onClick={resetGame}>
              New Game
            </button>
            <button 
              className="control-btn resign-btn" 
              onClick={handleResign}
              disabled={!isGameActive}
            >
              Resign
            </button>
            <button 
              className="control-btn draw-btn" 
              onClick={offerDraw}
              disabled={!isGameActive}
            >
              Offer Draw
            </button>
          </div>
        
        {showProcessingOverlay && (
  <div className="processing-overlay">
    <div className="processing-message">
      Processing game result...
    </div>
  </div>
)}

        </div>
      )}
      
      {/* Notification component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default ChessGame;
