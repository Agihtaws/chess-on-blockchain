// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChessGame {
    struct Player {
        address playerAddress;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 gamesDrawn;
        uint256 rating;
    }
    
    // Game modes
    string public constant BEGINNER = "beginner";
    string public constant INTERMEDIATE = "intermediate";
    string public constant ADVANCED = "advanced";
    
    // Game results
    uint8 public constant RESULT_WIN = 1;
    uint8 public constant RESULT_LOSS = 2;
    uint8 public constant RESULT_DRAW = 3;
    
    // Game ending types
    uint8 public constant END_CHECKMATE = 1;
    uint8 public constant END_RESIGNATION = 2;
    uint8 public constant END_TIMEOUT = 3;
    uint8 public constant END_DRAW_AGREEMENT = 4;
    uint8 public constant END_STALEMATE = 5;
    uint8 public constant END_INSUFFICIENT_MATERIAL = 6;
    uint8 public constant END_THREEFOLD_REPETITION = 7;
    uint8 public constant END_FIFTY_MOVE_RULE = 8;
    
    mapping(address => Player) public players;
    mapping(address => uint256[]) private playerGameIndices;
    
    // Array to track top players by rating for leaderboard
    address[] private topPlayers;
    uint256 private constant MAX_LEADERBOARD_SIZE = 10;
    
    // Enhanced on-chain storage for game results
    struct GameResultMinimal {
        address player;
        string gameMode;
        uint8 result;        // Win, Loss, or Draw
        uint8 endingType;    // How the game ended
        uint256 timestamp;
    }
    
    GameResultMinimal[] public gameResults;
    
    // Events for storing detailed data off-chain
    event GameCompleted(
        address indexed player, 
        string gameMode, 
        string timeControl, 
        uint8 result,
        uint8 endingType,
        uint256 timestamp
    );
    
    event PlayerRegistered(
        address indexed player, 
        uint256 initialRating, 
        uint256 timestamp
    );
    
    function registerPlayer() external {
        require(players[msg.sender].playerAddress == address(0), "Player already registered");
        
        players[msg.sender] = Player({
            playerAddress: msg.sender,
            gamesPlayed: 0,
            gamesWon: 0,
            gamesDrawn: 0,
            rating: 1200 // Default ELO rating
        });
        
        // Add player to leaderboard if there's space
        if (topPlayers.length < MAX_LEADERBOARD_SIZE) {
            topPlayers.push(msg.sender);
            _sortPlayerInLeaderboard(topPlayers.length - 1);
        }
        
        emit PlayerRegistered(msg.sender, 1200, block.timestamp);
    }
    
    // Game recording function with enhanced result tracking
    function recordGameResult(
        string calldata gameMode, 
        string calldata timeControl, 
        uint8 result, 
        uint8 endingType
    ) external {
        require(players[msg.sender].playerAddress != address(0), "Player not registered");
        require(result >= RESULT_WIN && result <= RESULT_DRAW, "Invalid result");
        require(endingType >= END_CHECKMATE && endingType <= END_FIFTY_MOVE_RULE, "Invalid ending type");
        
        // Update player stats
        players[msg.sender].gamesPlayed += 1;
        
        // Update rating based on result
        if (result == RESULT_WIN) {
            players[msg.sender].gamesWon += 1;
            players[msg.sender].rating += 10;
        } else if (result == RESULT_DRAW) {
            players[msg.sender].gamesDrawn += 1;
            players[msg.sender].rating += 5; // Half points for draws
        } else if (result == RESULT_LOSS) {
            if (players[msg.sender].rating > 10) {
                players[msg.sender].rating -= 10;
            }
        }
        
        // Store minimal data on-chain
        uint256 gameIndex = gameResults.length;
        gameResults.push(GameResultMinimal({
            player: msg.sender,
            gameMode: gameMode,
            result: result,
            endingType: endingType,
            timestamp: block.timestamp
        }));
        
        // Track which games belong to this player
        playerGameIndices[msg.sender].push(gameIndex);
        
        // Update leaderboard after rating change
        _updateLeaderboard(msg.sender);
        
        // Emit detailed event for off-chain tracking
        emit GameCompleted(msg.sender, gameMode, timeControl, result, endingType, block.timestamp);
    }
    
    // Batch record multiple games to save gas when submitting several results
    function batchRecordResults(
        string[] calldata gameModes,
        string[] calldata timeControls,
        uint8[] calldata results,
        uint8[] calldata endingTypes
    ) external {
        require(players[msg.sender].playerAddress != address(0), "Player not registered");
        require(
            gameModes.length == results.length && 
            timeControls.length == results.length && 
            endingTypes.length == results.length, 
            "Array length mismatch"
        );
        
        uint256 wins = 0;
        uint256 draws = 0;
        
        // Process all games
        for (uint256 i = 0; i < results.length; i++) {
            require(results[i] >= RESULT_WIN && results[i] <= RESULT_DRAW, "Invalid result");
            require(endingTypes[i] >= END_CHECKMATE && endingTypes[i] <= END_FIFTY_MOVE_RULE, "Invalid ending type");
            
            if (results[i] == RESULT_WIN) wins++;
            if (results[i] == RESULT_DRAW) draws++;
            
            uint256 gameIndex = gameResults.length;
            gameResults.push(GameResultMinimal({
                player: msg.sender,
                gameMode: gameModes[i],
                result: results[i],
                endingType: endingTypes[i],
                timestamp: block.timestamp
            }));
            
            playerGameIndices[msg.sender].push(gameIndex);
            
            emit GameCompleted(msg.sender, gameModes[i], timeControls[i], results[i], endingTypes[i], block.timestamp);
        }
        
        // Update player stats in one go
        players[msg.sender].gamesPlayed += results.length;
        players[msg.sender].gamesWon += wins;
        players[msg.sender].gamesDrawn += draws;
        
        // Update rating based on overall performance
        if (wins > 0) {
            players[msg.sender].rating += 10 * wins;
        }
        
        if (draws > 0) {
            players[msg.sender].rating += 5 * draws;  // Half points for draws
        }
        
        uint256 losses = results.length - wins - draws;
        if (losses > 0) {
            uint256 ratingLoss = 10 * losses;
            if (players[msg.sender].rating > ratingLoss) {
                players[msg.sender].rating -= ratingLoss;
            } else {
                players[msg.sender].rating = 0;
            }
        }
        
        // Update leaderboard after all games are recorded
        _updateLeaderboard(msg.sender);
    }
    
    // Function to get leaderboard data
    function getLeaderboard() external view returns (
        address[] memory playerAddresses,
        uint256[] memory ratings,
        uint256[] memory gamesPlayed,
        uint256[] memory gamesWon
    ) {
        uint256 size = topPlayers.length;
        
        playerAddresses = new address[](size);
        ratings = new uint256[](size);
        gamesPlayed = new uint256[](size);
        gamesWon = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            address playerAddr = topPlayers[i];
            playerAddresses[i] = playerAddr;
            ratings[i] = players[playerAddr].rating;
            gamesPlayed[i] = players[playerAddr].gamesPlayed;
            gamesWon[i] = players[playerAddr].gamesWon;
        }
        
        return (playerAddresses, ratings, gamesPlayed, gamesWon);
    }
    
    // Update the leaderboard after each game
    function _updateLeaderboard(address playerAddress) private {
        // Check if player is already in leaderboard
        bool isInLeaderboard = false;
        uint256 playerIndex = 0;
        
        for (uint256 i = 0; i < topPlayers.length; i++) {
            if (topPlayers[i] == playerAddress) {
                isInLeaderboard = true;
                playerIndex = i;
                break;
            }
        }
        
        if (isInLeaderboard) {
            // Re-sort the player if their rating changed
            _sortPlayerInLeaderboard(playerIndex);
        } else if (
            // Add to leaderboard if it's not full or player rating is higher than lowest rated player
            topPlayers.length < MAX_LEADERBOARD_SIZE || 
            (topPlayers.length > 0 && players[playerAddress].rating > players[topPlayers[topPlayers.length - 1]].rating)
        ) {
            if (topPlayers.length == MAX_LEADERBOARD_SIZE) {
                // Remove the lowest rated player
                topPlayers.pop();
            }
            
            // Add the new player and sort them
            topPlayers.push(playerAddress);
            _sortPlayerInLeaderboard(topPlayers.length - 1);
        }
    }
    
    // Helper function to sort a player in the leaderboard
    function _sortPlayerInLeaderboard(uint256 index) private {
        uint256 i = index;
        while (i > 0 && players[topPlayers[i]].rating > players[topPlayers[i-1]].rating) {
            // Swap positions
            address temp = topPlayers[i];
            topPlayers[i] = topPlayers[i-1];
            topPlayers[i-1] = temp;
            i--;
        }
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 gamesPlayed, 
        uint256 gamesWon,
        uint256 gamesDrawn,
        uint256 rating
    ) {
        Player memory p = players[player];
        return (p.gamesPlayed, p.gamesWon, p.gamesDrawn, p.rating);
    }
    
    // More gas-efficient way to get player game history
    function getPlayerGameHistory(address player) external view returns (uint256[] memory) {
        return playerGameIndices[player];
    }
    
    // Get game details by index
    function getGameDetails(uint256 gameIndex) external view returns (
        address player, 
        string memory gameMode, 
        uint8 result,
        uint8 endingType,
        uint256 timestamp
    ) {
        require(gameIndex < gameResults.length, "Game does not exist");
        GameResultMinimal memory game = gameResults[gameIndex];
        return (game.player, game.gameMode, game.result, game.endingType, game.timestamp);
    }
}
