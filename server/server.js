require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const imageRoutes = require('./routes/imageRoutes');
const errorHandler = require('./middleware/errorHandler');

// Validate environment variables
if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('ERROR: HUGGINGFACE_API_KEY is not set in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/image', imageRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.HUGGINGFACE_API_KEY,
        port: port
    });
});
