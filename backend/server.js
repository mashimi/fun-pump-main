const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ethers } = require("ethers");
// Load ENV Variables (replace with your actual setup)
require('dotenv').config()

const app = express();
app.use(express.json())

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Hardhat setup
const provider = new ethers.JsonRpcProvider(process.env.INKO_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS;
const factoryAbi = require('../app/abis/Factory.json'); // Adjust path to ABI

const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
// async function burn(tokenAddress, burnAmount){
//   // Send transaction
//   console.log("Will execute burn of ", burnAmount, " from: ", tokenAddress)
//   const tx = await factory.burnFromFactory(tokenAddress, burnAmount);
//   console.log("Burn transaction: ", tx)
//   await tx.wait();
// }

app.post('/burn', async (req, res) => {
    try {
      // Collect Data (Example)
        const tokenAddress = req.body.tokenAddress;
        const totalSupply = req.body.totalSupply;
      // Prepare Gemini Prompt
      const prompt = `Analyze the following token data for ${tokenAddress}. Decide if tokens should be burned, and if so, what percentage (between 0 and 5%).
        - Total Supply: ${totalSupply}
        Based on this data, provide only a single number from 0 to 5, representing the percentage to burn. If you are unsure, recommend 0.
      `

        // Send Prompt to Gemini
        const geminiResponse = await model.generateContent(prompt);
        const responseText = geminiResponse.response.text();
        console.log(responseText)

        const burnPercentage = parseInt(responseText.trim())

        if(isNaN(burnPercentage) || burnPercentage < 0 || burnPercentage > 5){
            res.status(400).json({ message: "Invalid response from AI" })
            return
        }

      // Execute Transaction (based on AI response)
        if (burnPercentage > 0) {
            const tokenContract = await factory.tokenToSale(tokenAddress);
            const balance = await ethers.getContractAt("Token", tokenContract.token).balanceOf(await factory.getAddress());
            const burnAmount = (balance * BigInt(burnPercentage)) / BigInt(100);
            console.log("Balance is: ", balance, " Will burn ", burnAmount)
           // Send transaction
          const tx = await factory.burnFromFactory(tokenAddress, burnAmount);
          await tx.wait();

        res.status(200).json({ message: `Burned ${burnPercentage}% of tokens based on AI decision.`, burnPercentage })
        return
        }

        res.status(200).json({ message: 'AI recommended no burn.' })
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});