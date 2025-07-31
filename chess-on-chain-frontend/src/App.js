// App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ChessGame from './components/ChessGame';
import PlayerProfile from './components/PlayerProfile';
import GameHistory from './components/GameHistory';
import Leaderboard from './components/Leaderboard';
import ChessRules from './components/ChessRules';
import './App.css';

// Your contract address
const CONTRACT_ADDRESS = "0x6fc39bFdC9F30028D9EBC4Eaab1d066187f4F35c";

// Your contract ABI (using your existing ABI)
const CONTRACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "gameMode",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "timeControl",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "result",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "endingType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "GameCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "initialRating",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PlayerRegistered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ADVANCED",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "BEGINNER",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_CHECKMATE",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_DRAW_AGREEMENT",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_FIFTY_MOVE_RULE",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_INSUFFICIENT_MATERIAL",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_RESIGNATION",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_STALEMATE",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_THREEFOLD_REPETITION",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "END_TIMEOUT",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "INTERMEDIATE",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "RESULT_DRAW",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "RESULT_LOSS",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "RESULT_WIN",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "gameModes",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "timeControls",
          "type": "string[]"
        },
        {
          "internalType": "uint8[]",
          "name": "results",
          "type": "uint8[]"
        },
        {
          "internalType": "uint8[]",
          "name": "endingTypes",
          "type": "uint8[]"
        }
      ],
      "name": "batchRecordResults",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "gameResults",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "gameMode",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "result",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "endingType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameIndex",
          "type": "uint256"
        }
      ],
      "name": "getGameDetails",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "gameMode",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "result",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "endingType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLeaderboard",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "playerAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "ratings",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "gamesPlayed",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "gamesWon",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerGameHistory",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "gamesPlayed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gamesWon",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gamesDrawn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "rating",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "players",
      "outputs": [
        {
          "internalType": "address",
          "name": "playerAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "gamesPlayed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gamesWon",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gamesDrawn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "rating",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "gameMode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "timeControl",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "result",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "endingType",
          "type": "uint8"
        }
      ],
      "name": "recordGameResult",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "registerPlayer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('beginner');
  const [activeTab, setActiveTab] = useState('play');
  const [isConnected, setIsConnected] = useState(false);
  const [isActiveGame, setIsActiveGame] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          handleDisconnect();
        } else if (isConnected) {
          // User switched accounts but is still connected
          setAccount(accounts[0]);
          initContract(accounts[0]);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [isConnected]);

  useEffect(() => {
    // Check if user was previously disconnected
    const disconnectedFlag = localStorage.getItem('walletDisconnected');
    
    if (disconnectedFlag === 'true') {
      setIsConnected(false);
      setLoading(false);
      return;
    }
    
    initEthers();
  }, []);

  const initEthers = async () => {
    if (window.ethereum) {
      try {
        // Use ethers v5 provider
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        // Get connected accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          await initContract(accounts[0]);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        alert("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.");
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask to use this application.");
      setLoading(false);
    }
  };

  const initContract = async (accountAddress) => {
    try {
      // Create contract instance
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const chessContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(chessContract);
      
      // Check if player is registered
      await checkPlayerRegistration(chessContract, accountAddress);
      
    } catch (error) {
      console.error("Error initializing contract:", error);
      setLoading(false);
    }
  };

  const checkPlayerRegistration = async (contractInstance, playerAddress) => {
    try {
      setCheckingRegistration(true);
      
      // Try to get player data from the contract
      const player = await contractInstance.players(playerAddress);
      
      // Use ethers v5 constants
      const zeroAddress = ethers.constants.AddressZero;
      
      // Check if player address is not zero address and rating is not zero
      const isReg = player && player.playerAddress !== zeroAddress;
      
      console.log("Player registration check:", isReg ? "Registered" : "Not registered");
      
      if (isReg) {
        // Player is already registered, fetch their stats
        const stats = await contractInstance.getPlayerStats(playerAddress);
        const playerData = {
          gamesPlayed: Number(stats[0]),
          gamesWon: Number(stats[1]),
          gamesDrawn: Number(stats[2]),
          rating: Number(stats[3])
        };
        console.log("Loaded player stats:", playerData);
        setPlayerStats(playerData);
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
      
      setCheckingRegistration(false);
      setLoading(false);
    } catch (error) {
      console.error("Error checking player registration:", error);
      
      // Try an alternative approach if the first one fails
      try {
        // Try to get player stats - this will fail if player is not registered
        const stats = await contractInstance.getPlayerStats(playerAddress);
        if (stats) {
          const playerData = {
            gamesPlayed: Number(stats[0]),
            gamesWon: Number(stats[1]),
            gamesDrawn: Number(stats[2]),
            rating: Number(stats[3])
          };
          setPlayerStats(playerData);
          setIsRegistered(true);
        }
      } catch (innerError) {
        // If this also fails, player is definitely not registered
        console.log("Player is not registered based on stats check");
        setIsRegistered(false);
      }
      
      setCheckingRegistration(false);
      setLoading(false);
    }
  };

  const registerPlayer = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      // First check if player is already registered to prevent unnecessary transactions
      try {
        const player = await contract.players(account);
        const zeroAddress = ethers.constants.AddressZero;
        
        if (player && player.playerAddress !== zeroAddress) {
          console.log("Player is already registered, loading stats...");
          
          // Get stats directly
          const stats = await contract.getPlayerStats(account);
          setPlayerStats({
            gamesPlayed: Number(stats[0]),
            gamesWon: Number(stats[1]),
            gamesDrawn: Number(stats[2]),
            rating: Number(stats[3])
          });
          
          setIsRegistered(true);
          setLoading(false);
          return;
        }
      } catch (checkError) {
        console.log("Error pre-checking registration:", checkError);
        // Continue with registration attempt
      }
      
      // Attempt to register
      const tx = await contract.registerPlayer();
      await tx.wait();
      
      // Get initial stats
      const stats = await contract.getPlayerStats(account);
      setPlayerStats({
        gamesPlayed: Number(stats[0]),
        gamesWon: Number(stats[1]),
        gamesDrawn: Number(stats[2]),
        rating: Number(stats[3])
      });
      
      setIsRegistered(true);
      setLoading(false);
    } catch (error) {
      console.error("Error registering player:", error);
      
      // If error is "already registered", try to load player data
      if (error.message && (
          error.message.includes("Player already registered") || 
          error.message.includes("execution reverted")
      )) {
        try {
          // Get player stats
          const stats = await contract.getPlayerStats(account);
          setPlayerStats({
            gamesPlayed: Number(stats[0]),
            gamesWon: Number(stats[1]),
            gamesDrawn: Number(stats[2]),
            rating: Number(stats[3])
          });
          
          // Mark as registered
          setIsRegistered(true);
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
        }
      } else {
        alert("Failed to register. Please try again.");
      }
      
      setLoading(false);
    }
  };

  // In App.jsx
  const handleGameEnd = async (result, endingType) => {
    if (!contract || !isRegistered) return Promise.reject("No contract or not registered");
    
    try {
      // Record game result
      const tx = await contract.recordGameResult(
        gameMode,
        "10+0", // Default time control
        result,
        endingType
      );
      await tx.wait();
      
      // Update player stats
      const stats = await contract.getPlayerStats(account);
      setPlayerStats({
        gamesPlayed: Number(stats[0]),
        gamesWon: Number(stats[1]),
        gamesDrawn: Number(stats[2]),
        rating: Number(stats[3])
      });
      
      setIsActiveGame(false);
      
      // Show alert
      alert("Game result recorded successfully!");
      
      // Return resolved promise
      return Promise.resolve();
      
    } catch (error) {
      console.error("Error recording game result:", error);
      alert("Failed to record game result. Please try again.");
      
      // Return rejected promise
      return Promise.reject(error);
    }
  };

  const handleDisconnect = () => {
    // Clear states
    setAccount(null);
    setContract(null);
    setIsRegistered(false);
    setPlayerStats(null);
    setIsConnected(false);
    
    // Set disconnected flag in localStorage
    localStorage.setItem('walletDisconnected', 'true');
    
    // Clear any cached provider data
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
    
    // Clear any MetaMask cached connection
    if (window.ethereum && window.ethereum._state) {
      try {
        // This is a workaround to force MetaMask to forget the connection
        window.ethereum._state.accounts = [];
        window.ethereum._state.isConnected = false;
      } catch (err) {
        console.log("Could not reset MetaMask state", err);
      }
    }
    
    // Force page refresh with cache clearing
    window.location.reload();
  };

  const connectWallet = async () => {
    // Remove disconnected flag
    localStorage.removeItem('walletDisconnected');
    setLoading(true);
    await initEthers();
  };

  // Function to handle game state changes
  const handleGameStateChange = (isActive) => {
    setIsActiveGame(isActive);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Chess on Blockchain</h1>
        <div className="wallet-info">
          {account && isConnected ? (
            <div className="account-controls">
              <span>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              <button className="disconnect-btn" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      
      {!isConnected ? (
        <div className="simple-message">
          <h2>Please connect your wallet to play</h2>
        </div>
      ) : !isRegistered ? (
        <div className="registration-prompt">
          <h2>Welcome to Chess on Blockchain</h2>
          <p>You need to register before playing.</p>
          <button 
            onClick={registerPlayer}
            disabled={checkingRegistration}
          >
            {checkingRegistration ? "Checking..." : "Register"}
          </button>
        </div>
      ) : (
        <div className="main-content">
          <div className="tabs">
            <button 
              className={activeTab === 'play' ? 'active' : ''} 
              onClick={() => setActiveTab('play')}
            >
              Play
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => {
                if (!isActiveGame) {
                  setActiveTab('profile');
                } else {
                  alert("Please finish or resign your current game before navigating to Profile.");
                }
              }}
            >
              Profile
            </button>
            <button 
              className={activeTab === 'history' ? 'active' : ''} 
              onClick={() => {
                if (!isActiveGame) {
                  setActiveTab('history');
                } else {
                  alert("Please finish or resign your current game before navigating to History.");
                }
              }}
            >
              History
            </button>

            <button 
              className={activeTab === 'leaderboard' ? 'active' : ''} 
              onClick={() => {
                if (!isActiveGame) {
                  setActiveTab('leaderboard');
                } else {
                  alert("Please finish or resign your current game before navigating to Leaderboard.");
                }
              }}
            >
              Leaderboard
            </button>
            <button 
              className={activeTab === 'rules' ? 'active' : ''} 
              onClick={() => {
                if (!isActiveGame) {
                  setActiveTab('rules');
                } else {
                  alert("Please finish or resign your current game before navigating to Rules.");
                }
              }}
            >
              Rules
            </button>
          </div>
          
          {activeTab === 'play' && (
            <div className="game-section">
              <ChessGame 
                onGameEnd={handleGameEnd}
                onGameStateChange={handleGameStateChange}
              />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <PlayerProfile stats={playerStats} />
          )}
          
          {activeTab === 'history' && (
            <GameHistory 
              contract={contract} 
              account={account}
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard 
              contract={contract}
            />
          )}
          
          {activeTab === 'rules' && (
            <ChessRules />
          )}
        </div>
      )}
    </div>
  );
}
export default App;
