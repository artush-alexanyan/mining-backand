// routes/staking.js
const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const contractABI = require('../../ABI.json');
require('dotenv').config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_API_URL));
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Retrieve private key and ensure it has the correct format
let privateKey = process.env.METAMASK_PRIVATE_KEY;

// Add '0x' prefix if it doesn't already have it
if (!privateKey.startsWith('0x')) {
  privateKey = '0x' + privateKey;
}

// Create account object from the private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Helper function to sign and send a transaction
const sendTransaction = async (method, options) => {
  const tx = method.send({
    from: account.address,
    ...options
  });
  return tx;
};

// Endpoint to stake Ether
router.post('/stake', async (req, res) => {
  const { amount } = req.body;
  // Check if amount is valid and greater than 0
  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid staking amount. Must provide a valid Ether amount.',
    });
  }  
  try {
    const weiAmount = web3.utils.toWei(amount, 'ether');
    const txReceipt = await sendTransaction(contract.methods.stake(), {
      value: weiAmount
    });

    res.status(200).json({
      message: 'Staked successfully',
      amount: amount,
      transactionHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber.toString()
    });
  } catch (error) {
    console.error('Failed to stake:', error);
    res.status(500).json({
      error: 'Failed to stake',
      message: error.message
    });
  }
});

// Endpoint to withdraw Ether
router.post('/withdraw', async (req, res) => {
  const { amount } = req.body;

  // Check if the amount is provided and is a valid number
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'The amount to withdraw must be a positive number.'
    });
  }

  try {
    const weiAmount = web3.utils.toWei(amount, 'ether');

    // Estimate the gas needed for the transaction
    const gasEstimate = await contract.methods.withdraw(weiAmount).estimateGas({ from: account.address });

    // Encode the function call
    const encodedABI = contract.methods.withdraw(weiAmount).encodeABI();

    // Send the transaction
    const txReceipt = await web3.eth.sendTransaction({
      from: account.address,
      to: contractAddress,
      gas: gasEstimate,
      data: encodedABI,
    });

    // Convert BigInt values to strings before sending the response
    res.status(200).json({
      message: 'Withdrawn successfully',
      amount: amount,
      transactionHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber.toString() // Convert blockNumber to string
    });
  } catch (error) {
    console.error('Failed to withdraw:', error);
    res.status(500).json({
      error: 'Failed to withdraw',
      message: error.message
    });
  }
});


// Endpoint to get current stake
router.get('/stake', async (req, res) => {
  try {
    const stake = await contract.methods.getStake().call({ from: account.address });
    const formattedStake = web3.utils.fromWei(stake, 'ether');

    res.status(200).json({
      message: 'Stake fetched successfully',
      stake: formattedStake
    });
  } catch (error) {
    console.error('Failed to fetch stake:', error);
    res.status(500).json({
      error: 'Failed to fetch stake',
      message: error.message
    });
  }
});

module.exports = router;
