const cryptoService = require('../services/cryptoService');

// Get latest stats for a cryptocurrency
const getStats = async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    const stats = await cryptoService.getLatestStats(coin);
    res.json(stats);
  } catch (error) {
    console.error('Error in getStats controller:', error);
    
    if (error.message.includes('Invalid cryptocurrency') || 
        error.message.includes('No data found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to retrieve cryptocurrency stats' });
  }
};

// Get standard deviation of price for a cryptocurrency
const getDeviation = async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    const deviation = await cryptoService.getPriceDeviation(coin);
    res.json(deviation);
  } catch (error) {
    console.error('Error in getDeviation controller:', error);
    
    if (error.message.includes('Invalid cryptocurrency') || 
        error.message.includes('No data found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to calculate price deviation' });
  }
};

module.exports = {
  getStats,
  getDeviation
};