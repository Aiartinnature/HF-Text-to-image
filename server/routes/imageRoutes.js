const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const { v4: uuidv4 } = require('uuid');

router.get('/models', (req, res) => {
    try {
        const models = imageService.getAvailableModels();
        res.json({ models });
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/cancel', (req, res) => {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const cancelled = imageService.cancelRequest(requestId);
        if (cancelled) {
            res.json({ message: 'Request cancelled successfully' });
        } else {
            res.status(404).json({ error: 'Request not found or already completed' });
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate', async (req, res) => {
    const requestId = uuidv4();
    
    try {
        const { prompt, width, height, model } = req.body;
        
        // Input validation
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Log request details
        console.log('Image generation request:', {
            requestId,
            prompt,
            width,
            height,
            model,
            timestamp: new Date().toISOString()
        });

        // Validate dimensions
        const parsedWidth = parseInt(width);
        const parsedHeight = parseInt(height);
        
        if (width && isNaN(parsedWidth)) {
            return res.status(400).json({ error: 'Width must be a number' });
        }
        if (height && isNaN(parsedHeight)) {
            return res.status(400).json({ error: 'Height must be a number' });
        }

        const image = await imageService.generateImage(prompt, parsedWidth, parsedHeight, model, requestId);
        
        if (!image) {
            throw new Error('Failed to generate image: No image data received');
        }

        res.json({ image, requestId });
    } catch (error) {
        console.error('Error in /generate endpoint:', error);
        
        // Don't send error for cancelled requests
        if (error.message === 'Image generation cancelled') {
            return res.status(499).json({ error: 'Request cancelled' });
        }

        res.status(500).json({ 
            error: error.message || 'Failed to generate image',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            requestId
        });
    }
});

module.exports = router;
