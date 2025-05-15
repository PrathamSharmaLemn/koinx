const mongoose = require('mongoose');

const CryptoStatSchema = new mongoose.Schema({
  coin: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum', 'matic-network']
  },
  price: {
    type: Number,
    required: true
  },
  marketCap: {
    type: Number,
    required: true
  },
  change24h: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by coin and timestamp
CryptoStatSchema.index({ coin: 1, timestamp: -1 });

module.exports = mongoose.model('CryptoStat', CryptoStatSchema);