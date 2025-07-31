import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

function Leaderboard({ contract }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!contract) return;
      
      try {
        const data = await contract.getLeaderboard();
        
        // Process the returned arrays into objects
        const addresses = data[0];
        const ratings = data[1];
        const gamesPlayed = data[2];
        const gamesWon = data[3];
        
        const leaderboard = [];
        for (let i = 0; i < addresses.length; i++) {
          leaderboard.push({
            rank: i + 1,
            address: addresses[i],
            displayAddress: `${addresses[i].substring(0, 6)}...${addresses[i].substring(addresses[i].length - 4)}`,
            rating: Number(ratings[i]),
            gamesPlayed: Number(gamesPlayed[i]),
            gamesWon: Number(gamesWon[i]),
            winRate: Number(gamesPlayed[i]) > 0 
              ? ((Number(gamesWon[i]) / Number(gamesPlayed[i])) * 100).toFixed(1) 
              : 0
          });
        }
        
        setLeaderboardData(leaderboard);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [contract]);

  return (
    <div className="leaderboard-container">
      <h2>Global Leaderboard</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading leaderboard data...</div>
      ) : leaderboardData.length === 0 ? (
        <div className="empty-leaderboard">No players on the leaderboard yet.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Games</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player) => (
                <tr key={player.address} className={player.address === window.ethereum.selectedAddress ? "current-player" : ""}>
                  <td>{player.rank}</td>
                  <td>{player.displayAddress}</td>
                  <td>{player.rating}</td>
                  <td>{player.gamesPlayed}</td>
                  <td>{player.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
