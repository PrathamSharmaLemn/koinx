const { connect, StringCodec } = require('nats');
require('dotenv').config();

let natsConnection = null;
const sc = StringCodec();

const connectNats = async () => {
  try {
    if (!natsConnection) {
      natsConnection = await connect({ servers: process.env.NATS_URL });
      console.log(`Connected to NATS at ${process.env.NATS_URL}`);
    }
    return natsConnection;
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    throw error;
  }
};

const subscribe = async (subject, callback) => {
  try {
    const nc = await connectNats();
    console.log(`Subscribing to ${subject}`);
    
    const subscription = nc.subscribe(subject);
    
    (async () => {
      for await (const msg of subscription) {
        const data = JSON.parse(sc.decode(msg.data));
        callback(data);
      }
    })().catch(err => console.error(`Subscription error: ${err}`));
    
    return subscription;
  } catch (error) {
    console.error(`Error subscribing to ${subject}:`, error);
    throw error;
  }
};

const publish = async (subject, data) => {
  try {
    const nc = await connectNats();
    nc.publish(subject, sc.encode(JSON.stringify(data)));
    console.log(`Published message to ${subject}`);
  } catch (error) {
    console.error(`Error publishing to ${subject}:`, error);
    throw error;
  }
};

const closeConnection = async () => {
  if (natsConnection) {
    await natsConnection.close();
    console.log('NATS connection closed');
    natsConnection = null;
  }
};

module.exports = {
  connectNats,
  subscribe,
  publish,
  closeConnection
};