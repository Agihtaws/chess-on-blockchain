const hre = require("hardhat");

async function main() {
  console.log("Deploying ChessGame contract to Somnia Testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance to ensure account exists and has funds
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance));
  
  if (balance.toString() === '0') {
    console.error("Account has no funds. Please fund your account first.");
    return;
  }

  try {
    // Deploy ChessGame contract
    const ChessGame = await hre.ethers.getContractFactory("ChessGame");
    console.log("Compiling and deploying contract with enhanced game outcomes and leaderboard support...");
    
    // Deploy the contract without custom gas estimation
    const chessGame = await ChessGame.deploy();
    
    // Wait for deployment
    console.log("Waiting for deployment transaction to be mined...");
    await chessGame.waitForDeployment();
    const chessGameAddress = await chessGame.getAddress();
    
    console.log("ChessGame deployed to:", chessGameAddress);
    console.log("Deployment transaction:", chessGame.deploymentTransaction().hash);
    
    // Log available game result types
    console.log("Game Result Types:");
    console.log("- RESULT_WIN (1): Player won the game");
    console.log("- RESULT_LOSS (2): Player lost the game");
    console.log("- RESULT_DRAW (3): Game ended in a draw");
    
    // Log available game ending types
    console.log("Game Ending Types:");
    console.log("- END_CHECKMATE (1): Game ended by checkmate");
    console.log("- END_RESIGNATION (2): Game ended by resignation");
    console.log("- END_TIMEOUT (3): Game ended by timeout/flagging");
    console.log("- END_DRAW_AGREEMENT (4): Game ended by mutual draw agreement");
    console.log("- END_STALEMATE (5): Game ended by stalemate");
    console.log("- END_INSUFFICIENT_MATERIAL (6): Draw due to insufficient material");
    console.log("- END_THREEFOLD_REPETITION (7): Draw by threefold repetition");
    console.log("- END_FIFTY_MOVE_RULE (8): Draw by fifty-move rule");
    
    // Log leaderboard functionality
    console.log("Leaderboard Functionality:");
    console.log("- Global leaderboard tracks top 10 players by rating");
    console.log("- Leaderboard updates automatically after each game");
    console.log("- Players can view rankings through the getLeaderboard() function");
    
    // Check final balance
    const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Final account balance:", hre.ethers.formatEther(finalBalance));
    console.log("Gas used (in ETH):", hre.ethers.formatEther(balance - finalBalance));
    
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
