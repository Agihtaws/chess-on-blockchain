// components/ChessRules.jsx
import React from 'react';
import './ChessRules.css';

function ChessRules() {
  return (
    <div className="chess-rules">
      <h2>Chess Rules</h2>
      
      <section className="rule-section">
        <h3>Basic Rules</h3>
        <p>Chess is played on a square board of 8 rows and 8 columns, for a total of 64 squares of alternating colors (light and dark).</p>
        <p>Each player begins with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.</p>
        <p>The objective is to checkmate your opponent's king, where the king is under immediate attack (in "check") and there is no way to remove it from attack on the next move.</p>
      </section>

      <section className="rule-section">
        <h3>Piece Movements</h3>
        <ul>
          <li><strong>King:</strong> Can move exactly one square horizontally, vertically, or diagonally.</li>
          <li><strong>Queen:</strong> Can move any number of vacant squares diagonally, horizontally, or vertically.</li>
          <li><strong>Rook:</strong> Can move any number of vacant squares horizontally or vertically.</li>
          <li><strong>Bishop:</strong> Can move any number of vacant squares in any diagonal direction.</li>
          <li><strong>Knight:</strong> Can move in an 'L-shape' - two squares horizontally or vertically and then one square perpendicular to that direction. The knight is the only piece that can jump over other pieces.</li>
          <li><strong>Pawn:</strong> Can move forward one square, or two squares from their starting position. Pawns capture one square diagonally forward. When a pawn reaches the opposite edge of the board, it must be promoted to a queen, rook, bishop, or knight of the same color.</li>
        </ul>
      </section>

      <section className="rule-section">
        <h3>Special Moves</h3>
        <ul>
          <li><strong>Castling:</strong> The king moves two squares towards a rook, and the rook moves to the square the king crossed. This can only be done if neither piece has moved, there are no pieces between them, and the king is not in check or would pass through check.</li>
          <li><strong>En Passant:</strong> If a pawn advances two squares on its initial move and lands beside an opponent's pawn, the opponent's pawn can capture it as if it had only moved one square.</li>
          <li><strong>Promotion:</strong> When a pawn reaches the eighth rank, it must be exchanged for a queen, rook, bishop, or knight of the same color.</li>
        </ul>
      </section>

      <section className="rule-section">
        <h3>Game End Conditions</h3>
        <ul>
          <li><strong>Checkmate:</strong> When a king is in check and has no legal moves to escape.</li>
          <li><strong>Stalemate:</strong> When a player has no legal moves but their king is not in check, resulting in a draw.</li>
          <li><strong>Draw by Agreement:</strong> Players can agree to a draw at any point.</li>
          <li><strong>Threefold Repetition:</strong> If the same position occurs three times, a player can claim a draw.</li>
          <li><strong>Fifty-Move Rule:</strong> If no capture or pawn move has occurred in the last 50 moves, a player can claim a draw.</li>
          <li><strong>Insufficient Material:</strong> When neither player has enough pieces to force a checkmate (e.g., king vs. king).</li>
          <li><strong>Timeout:</strong> In timed games, if a player's time runs out and they haven't completed the required number of moves.</li>
        </ul>
      </section>

      <section className="rule-section">
        <h3>Blockchain Chess Special Rules</h3>
        <ul>
          <li>All games are recorded on the blockchain, creating a permanent record of your chess history.</li>
          <li>Game results affect your on-chain rating, which is visible to all players.</li>
          <li>Time controls vary by difficulty level:
            <ul>
              <li>Beginner: 10 minutes per player</li>
              <li>Intermediate: 5 minutes per player</li>
              <li>Advanced: 3 minutes per player</li>
            </ul>
          </li>
          <li>You must complete your current game before navigating to other sections of the app.</li>
        </ul>
      </section>
    </div>
  );
}

export default ChessRules;
