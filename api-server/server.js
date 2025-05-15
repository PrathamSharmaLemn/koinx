const express = require('express');
const connectDB = require('./config/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const natsClient = require('./utils/natsClient');
const cryptoService = require('./services/cryptoService');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/', cryptoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Server is running' });
});

// Subscribe to NATS events
const setupNatsSubscription = async () => {
  try {
    await natsClient.subscribe('crypto.update', async (data) => {
      console.log('Received event:', data);
      if (data.trigger === 'update') {
        try {
          await cryptoService.storeCryptoStats();
          console.log('Successfully updated cryptocurrency stats');
        } catch (error) {
          console.error('Failed to update cryptocurrency stats:', error);
        }
      }
    });
  } catch (error) {
    console.error('Failed to set up NATS subscription:', error);
    // Retry after 5 seconds
    setTimeout(setupNatsSubscription, 5000);
  }
};

// Start the server
const startServer = async () => {
  try {
    // Connect to NATS and set up subscription
    await setupNatsSubscription();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down API server...');
  await natsClient.closeConnection();
  process.exit(0);
});

// Start the server
startServer();