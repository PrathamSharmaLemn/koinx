# Cryptocurrency Stats System

The project consists of two Node.js servers that work together to collect and expose cryptocurrency statistics:

1. **api-server**: Handles API endpoints and stores cryptocurrency data from CoinGecko
2. **worker-server**: Runs scheduled jobs to trigger data collection every 15 minutes

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (running locally or accessible via connection string)
- NATS Server (running locally or accessible via connection string)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd crypto-stats-project
```

### 2. Install NATS Server

Follow the installation instructions from the [NATS documentation](https://docs.nats.io/nats-server/installation).

For quick setup on macOS with Homebrew:
```bash
brew install nats-server
```


### 3. Install dependencies for both servers

```bash
# Install API server dependencies
cd api-server
npm install

# Install Worker server dependencies
cd ../worker-server
npm install
```

### 4. Configure environment variables

Each server has its own `.env` file with configuration. By default, the servers are configured to use:
- MongoDB at `mongodb+srv://<@user>:<@password>@cluster0.j0fvjct.mongodb.net/`
- NATS Server at `nats://localhost:4222`
- API server on port 3000
- Worker server on port 3001

Update these files if your configuration differs.

## Running the Application

### 1. Start MongoDB and NATS Server

Make sure MongoDB and NATS Server are running before starting the application.

### 2. Start the API Server

```bash
cd api-server
npm start
```

### 3. Start the Worker Server

```bash
cd worker-server
npm start
```

## API Endpoints

The API Server exposes the following endpoints:

### Get Latest Stats

Retrieves the latest statistics for a specific cryptocurrency.

```
GET /stats?coin=bitcoin
```

Parameters:
- `coin`: The cryptocurrency to get stats for. Must be one of: `bitcoin`, `ethereum`, or `matic-network`.

Example Response:
```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

### Get Price Deviation

Retrieves the standard deviation of the price for the last 100 records of a specific cryptocurrency.

```
GET /deviation?coin=bitcoin
```

Parameters:
- `coin`: The cryptocurrency to calculate deviation for. Must be one of: `bitcoin`, `ethereum`, or `matic-network`.

Example Response:
```json
{
  "deviation": 4082.48
}
```

### Health Check

Check if the server is running.

```
GET /health
```

## System Architecture

The system is designed with the following components:

1. **API Server**:
   - Exposes RESTful endpoints for accessing cryptocurrency data
   - Stores data in MongoDB
   - Subscribes to events from NATS to trigger data updates

2. **Worker Server**:
   - Runs a cron job every 15 minutes
   - Publishes events to NATS to trigger data updates

3. **MongoDB**: 
   - Stores cryptocurrency statistics
   - Data is structured with timestamps for historical analysis

4. **NATS**:
   - Message broker for inter-server communication
   - Decouples the worker from the API server

## Development

For development, you can use nodemon to automatically restart the servers when files change:

```bash
# API Server development mode
cd api-server
npm run dev

# Worker Server development mode
cd worker-server
npm run dev
```

