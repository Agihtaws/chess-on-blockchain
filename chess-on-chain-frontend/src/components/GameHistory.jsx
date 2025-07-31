import React, { useState, useEffect } from 'react';
import './GameHistory.css';

function GameHistory({ contract, account }) {
  const [gameIndices, setGameIndices] = useState([]);
  const [gameDetails, setGameDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Result type mapping
  const resultTypes = {
    1: "Win",
    2: "Loss",
    3: "Draw"
  };

  // Ending type mapping
  const endingTypes = {
    1: "Checkmate",
    2: "Resignation",
    3: "Timeout",
    4: "Draw Agreement",
    5: "Stalemate",
    6: "Insufficient Material",
    7: "Threefold Repetition",
    8: "Fifty-move Rule"
  };

  useEffect(() => {
    const fetchGameHistory = async () => {
      if (!contract || !account) return;
      
      try {
        // Get indices of all games played by the user
        const indices = await contract.getPlayerGameHistory(account);
        setGameIndices(indices.map(idx => Number(idx)));
        
        // Fetch details for each game
        const details = [];
        for (const idx of indices) {
          const game = await contract.getGameDetails(idx);
          details.push({
            index: Number(idx),
            player: game[0],
            gameMode: game[1],
            result: Number(game[2]),
            endingType: Number(game[3]),
            timestamp: Number(game[4])
          });
        }
        
        // Sort by timestamp (newest first)
        details.sort((a, b) => b.timestamp - a.timestamp);
        setGameDetails(details);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching game history:", error);
        setLoading(false);
      }
    };
    
    fetchGameHistory();
  }, [contract, account]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="history-container">
      <div className="game-history">
        <h2>Game History</h2>
        
        {loading ? (
          <div className="loading-spinner">Loading game history...</div>
        ) : gameDetails.length === 0 ? (
          <div className="empty-history">No games played yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Result</th>
                  <th>Ending</th>
                </tr>
              </thead>
              <tbody>
                {gameDetails.map((game) => (
                  <tr key={game.index} className={`result-${resultTypes[game.result].toLowerCase()}`}>
                    <td>{formatDate(game.timestamp)}</td>
                    <td>{game.gameMode.charAt(0).toUpperCase() + game.gameMode.slice(1)}</td>
                    <td>{resultTypes[game.result]}</td>
                    <td>{endingTypes[game.endingType]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameHistory;
