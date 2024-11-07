// Import necessary modules
const { Web3 } = require('web3'); // Import Web3 for interacting with Ethereum
require('dotenv').config(); // Import dotenv to load environment variables from a .env file
const contractABI = require('./ABI.json'); // Import the ABI of the smart contract

// Initialize Web3 with the HTTP provider using the Infura API URL from environment variables
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_API_URL));

// Retrieve the smart contract address from environment variables
const contractAddress = process.env.CONTRACT_ADDRESS;

// Create an instance of the smart contract
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to format numbers to a fixed length (e.g., 10 decimal places)
const formatNumber = (number, decimals = 10) => {
  return parseFloat(number).toFixed(decimals);
};

// Define the function to fetch detailed data from the Ethereum blockchain
const getAdvancedData = async () => {
  try {
    // Fetch the balance of the smart contract address in Wei
    const balance = await web3.eth.getBalance(contractAddress);
    const etherBalance = web3.utils.fromWei(balance, 'ether');

    // Fetch the current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Fetch the number of the latest block
    const latestBlock = await web3.eth.getBlockNumber();

    // Retrieve the network ID to confirm the network we are connected to
    const networkId = await web3.eth.net.getId();

    // Fetch the total stakes from the smart contract
    const totalStakes = await contract.methods.getStake().call();
    const formattedTotalStakes = web3.utils.fromWei(totalStakes, 'ether');

    // Collect all details in a single object
    const contractDetails = {
      etherBalance: formatNumber(etherBalance),
      totalStakes: formatNumber(formattedTotalStakes),
      gasPrice: formatNumber(gasPrice), // Gas price is often in Gwei and can be large
      latestBlock: latestBlock.toString(), // Block number is an integer
      networkId: networkId.toString(), // Network ID is an integer
    };

    return contractDetails;
  } catch (error) {
    // Handle and throw any errors encountered during the process
    throw new Error('Error interacting with the contract: ' + error.message);
  }
};

// Export the function for use in other parts of the application
module.exports = getAdvancedData;
