const axios = require('axios');
const { Web3 } = require('web3');
require('dotenv').config();
const express = require('express');
const { isAddress } = require('web3-validator');
const router = express.Router();

// Initialize Web3 with Sepolia provider
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_API_URL));

// API endpoint for getting contracts info
router.get('/wallet-contracts/:address', async (req, res) => {
  const { address } = req.params;

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const response = await axios.get(
      `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const transactions = response.data.result;

    const contractAddresses = [...new Set(transactions.map(tx => tx.contractAddress).filter(Boolean))];

    const contractInfos = await Promise.all(contractAddresses.map(async (contractAddress) => {
      const balance = await web3.eth.getBalance(contractAddress);
      const etherBalance = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(10);

      // Get transaction count for the contract
      const contractTxResponse = await axios.get(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
      );

      const contractTransactions = contractTxResponse.data.result;

      return {
        contractAddress,
        balance: etherBalance,
        transactionCount: contractTransactions.length // Count of transactions
      };
    }));

    const gasPrice = await web3.eth.getGasPrice();
    const latestBlock = await web3.eth.getBlockNumber();
    const networkId = await web3.eth.net.getId();

    return res.status(200).json({
      gasPrice: gasPrice.toString(),
      latestBlock: latestBlock.toString(),
      networkId: networkId.toString(),
      contracts: contractInfos
    });
  } catch (error) {
    console.error('Error fetching contract info:', error);
    return res.status(500).json({ error: 'Error fetching contract info' });
  }
});

module.exports = router;
