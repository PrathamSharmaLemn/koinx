const axios = require('axios');
const CryptoStat = require('../models/CryptoStat');
require('dotenv').config();

/**
 * Fetches cryptocurrency data from CoinGecko API and stores it in MongoDB
 */
const storeCryptoStats = async () => {
  try {
    console.log('Fetching cryptocurrency stats from CoinGecko...');
    
    // CoinGecko API endpoint
    const url = process.env.COINGECKO_API_URL;
    
    // Coins we're interested in
    const coins = ['bitcoin', 'ethereum', 'matic-network'];
    
    // API parameters
    const params = {
      vs_currency: 'usd',
      ids: coins.join(','),
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h'
    };
    
    const response = await axios.get(url, { params });
    
    // Process each coin and save to database
    for (const coinData of response.data) {
      const cryptoStat = new CryptoStat({
        coin: coinData.id,
        price: coinData.current_price,
        marketCap: coinData.market_cap,
        change24h: coinData.price_change_percentage_24h || 0
      });
      
      await cryptoStat.save();
      console.log(`Saved stats for ${coinData.id}`);
    }
    
    console.log('All cryptocurrency stats stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing cryptocurrency stats:', error);
    throw error;
  }
};

/**
 * Retrieves the latest stats for a specific cryptocurrency
 */
const getLatestStats = async (coin) => {
  try {
    // Validate coin parameter
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      throw new Error('Invalid cryptocurrency');
    }
    
    const latestStat = await CryptoStat.findOne({ coin })
      .sort({ timestamp: -1 });
    
    if (!latestStat) {
      throw new Error(`No data found for ${coin}`);
    }
    
    return {
      price: latestStat.price,
      marketCap: latestStat.marketCap,
      "24hChange": latestStat.change24h
    };
  } catch (error) {
    console.error(`Error getting latest stats for ${coin}:`, error);
    throw error;
  }
};

const getPriceDeviation = async (coin) => {
  try {
    // Validate coin parameter
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      throw new Error('Invalid cryptocurrency');
    }
    
    // Get the last 100 records for the specified coin
    const stats = await CryptoStat.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('price');
    
    if (stats.length === 0) {
      throw new Error(`No data found for ${coin}`);
    }
    
    // Extract just the prices
    const prices = stats.map(stat => stat.price);
    
    // Calculate mean
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate sum of squared differences
    const squaredDifferences = prices.map(price => Math.pow(price - mean, 2));
    const sumSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0);
    
    // Calculate standard deviation
    const standardDeviation = Math.sqrt(sumSquaredDiff / prices.length);
    
    return {
      deviation: parseFloat(standardDeviation.toFixed(2))
    };
  } catch (error) {
    console.error(`Error calculating price deviation for ${coin}:`, error);
    throw error;
  }
};

module.exports = {
  storeCryptoStats,
  getLatestStats,
  getPriceDeviation
};