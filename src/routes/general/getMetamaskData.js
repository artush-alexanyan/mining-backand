const express = require('express');
const { Web3 } = require('web3');
require('dotenv').config();
const { isAddress } = require('web3-validator');

const router = express.Router();

// Initialize Web3 with Infura provider
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_API_URL));

// API endpoint for getting wallet info
router.get('/wallet-info/:address', async (req, res) => {
  const { address } = req.params;

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Fetch balance
    const balance = await web3.eth.getBalance(address);
    const etherBalance = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(10); // Ensures 18 decimal points

    // Fetch transaction count
    const transactionCount = await web3.eth.getTransactionCount(address);

    return res.status(200).json({
      balance: etherBalance,
      transactionCount: transactionCount.toString() // Convert to string
    });
  } catch (error) {
    console.error('Error fetching wallet info:', error); // Log the error
    return res.status(500).json({ error: 'Error fetching wallet info' });
  }
});

module.exports = router;
