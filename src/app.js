const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',  // Add more origins as needed
  'http://example.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  
}));

// Import routes
const stakingRoutes = require('./routes/actions/staking');
app.use('/api/staking', stakingRoutes);

const checkBalanceRoutes = require('./routes/general/checkBalance'); 
app.use('/api', checkBalanceRoutes); 

const checkMetamaskBalanceRoute = require('./routes/general/getMetamaskData')
app.use('/api', checkMetamaskBalanceRoute); 

const fetchContracts = require('./routes/contracts/getContracts')
app.use('/api', fetchContracts)

const getTransactionDetails = require('./routes/contracts/getTransactionDetails')
app.use('/api', getTransactionDetails)

module.exports = app;
