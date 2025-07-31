import React from 'react';
import './PlayerProfile.css';

function PlayerProfile({ stats }) {
  if (!stats) {
    return <div className="player-profile">Loading player stats...</div>;
  }

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) 
    : 0;
  
  const drawRate = stats.gamesPlayed > 0 
    ? ((stats.gamesDrawn / stats.gamesPlayed) * 100).toFixed(1) 
    : 0;
  
  const lossRate = stats.gamesPlayed > 0 
    ? (((stats.gamesPlayed - stats.gamesWon - stats.gamesDrawn) / stats.gamesPlayed) * 100).toFixed(1) 
    : 0;

  return (
    <div className="player-profile">
      <h2>Player Profile</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.rating}</div>
          <div className="stat-label">Rating</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.gamesPlayed}</div>
          <div className="stat-label">Games Played</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.gamesWon}</div>
          <div className="stat-label">Wins</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.gamesDrawn}</div>
          <div className="stat-label">Draws</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.gamesPlayed - stats.gamesWon - stats.gamesDrawn}</div>
          <div className="stat-label">Losses</div>
        </div>
      </div>
      
      <div className="performance-chart">
        <h3>Performance</h3>
        <div className="chart-bar">
          <div className="bar-segment win" style={{ width: `${winRate}%` }} title={`Win: ${winRate}%`}></div>
          <div className="bar-segment draw" style={{ width: `${drawRate}%` }} title={`Draw: ${drawRate}%`}></div>
          <div className="bar-segment loss" style={{ width: `${lossRate}%` }} title={`Loss: ${lossRate}%`}></div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color win"></div>
            <div>Win: {winRate}%</div>
          </div>
          <div className="legend-item">
            <div className="legend-color draw"></div>
            <div>Draw: {drawRate}%</div>
          </div>
          <div className="legend-item">
            <div className="legend-color loss"></div>
            <div>Loss: {lossRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerProfile;
