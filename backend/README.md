# FeliStore Backend

Node.js Express API server for FeliStore marketplace.

## Features

- RESTful API built with Express
- CORS enabled
- Environment variable configuration

## Getting Started

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

The server will start on port 3000 by default (or the PORT specified in .env file).

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
