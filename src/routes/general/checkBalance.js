const express = require('express');
const router = express.Router();
const getAdvancedData = require('../../init'); 

// Endpoint to get contract advanced data
router.get('/contract-info', async (req, res) => {
  try {
    const data = await getAdvancedData();
    res.json({ contractData: data });
  } catch (error) {
    console.error('Failed to fetch contract data:', error);
    res.status(500).json({ error: 'Failed to fetch contract data' });
  }
});

module.exports = router;
