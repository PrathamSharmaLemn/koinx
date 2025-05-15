const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// Route for getting latest stats
router.get('/stats', cryptoController.getStats);

// Route for getting price deviation
router.get('/deviation', cryptoController.getDeviation);

module.exports = router;