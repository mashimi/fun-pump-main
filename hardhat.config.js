require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    inkSepolia: {
      url: "https://rpc-gel-sepolia.inkonchain.com", // Primary RPC endpoint
      chainId: 763373, // Ink Sepolia Chain ID
      accounts: [process.env.PRIVATE_KEY], // Use your private key from .env
    },
  },
};