const express = require('express');
const cron = require('node-cron');
const connectDB = require('./config/db');
const jobService = require('./services/jobService');
const natsClient = require('./utils/natsClient');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Worker Server is running' });
});

// Schedule job to run every 15 minutes
const scheduleJob = () => {
  console.log('Scheduling cryptocurrency stats update job every 15 minutes');
  
  // Schedule job using node-cron (runs every 15 minutes) || UPDATE : set to 10 Seconds for testing purposes
  cron.schedule('*/10 * * * * *', async () => {
    console.log('Running scheduled job: triggering cryptocurrency stats update');
    try {
      await jobService.triggerCryptoUpdate();
      console.log('Job completed successfully');
    } catch (error) {
      console.error('Job failed:', error);
    }
  });
  
  // Also trigger once on startup
  jobService.triggerCryptoUpdate()
    .then(() => console.log('Initial trigger completed successfully'))
    .catch(error => console.error('Initial trigger failed:', error));
};

// Start the server
const startServer = async () => {
  try {
    // Schedule the job
    scheduleJob();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Worker Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Worker server...');
  await natsClient.closeConnection();
  process.exit(0);
});

// Start the server
startServer();