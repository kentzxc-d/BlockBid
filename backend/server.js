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
const { syncEvents } = require('./services/syncEvents');
const { requireAuth } = require('./middleware/auth');

app.use('/api/evaluate-bids', requireAuth, evaluateBidsRouter);
app.use('/api/ai/enhance', requireAuth, aiEnhanceRouter);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BlockBid Express Backend is running.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    
    // Start the background blockchain sync (runs immediately, then every 15 seconds)
    console.log("Starting background blockchain sync...");
    syncEvents();
    setInterval(syncEvents, 15 * 1000);
  });
}

module.exports = app;
