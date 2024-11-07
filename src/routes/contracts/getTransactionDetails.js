const express = require('express');
const axios = require('axios');
const { Web3 } = require('web3');
require('dotenv').config();
const { isAddress } = require('web3-validator');

const router = express.Router();

// Initialize Web3 with Sepolia provider
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_API_URL));

// API endpoint for getting detailed transactions by contract address
router.get('/contract-transactions/:contractAddress', async (req, res) => {
  const { contractAddress } = req.params;

  if (!isAddress(contractAddress)) {
    return res.status(400).json({ error: 'Invalid contract address' });
  }

  try {
    const response = await axios.get(
      `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const transactions = response.data.result;

    return res.status(200).json({
      contractAddress,
      transactions
    });
  } catch (error) {
    console.error('Error fetching contract transactions:', error);
    return res.status(500).json({ error: 'Error fetching contract transactions' });
  }
});

module.exports = router;
