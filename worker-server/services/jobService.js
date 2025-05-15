const natsClient = require('../utils/natsClient');

const triggerCryptoUpdate = async () => {
  try {
    console.log('Triggering cryptocurrency stats update...');
    
    // Publish event to trigger the update
    await natsClient.publish('crypto.update', { trigger: 'update' });
    
    console.log('Published event to trigger cryptocurrency stats update');
    return true;
  } catch (error) {
    console.error('Error triggering cryptocurrency stats update:', error);
    throw error;
  }
};

module.exports = {
  triggerCryptoUpdate
};