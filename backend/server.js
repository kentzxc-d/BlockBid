const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../web/.env.local' }); // Use the same .env.local from the frontend

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const evaluateBidsRouter = require('./routes/evaluate-bids');
const aiEnhanceRouter = require('./routes/ai-enhance');

app.use('/api/evaluate-bids', evaluateBidsRouter);
app.use('/api/ai/enhance', aiEnhanceRouter);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BlockBid Express Backend is running.' });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
