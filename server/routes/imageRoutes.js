const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const { v4: uuidv4 } = require('uuid');
const { validateImageRequest } = require('../middleware/validateRequest');

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

router.post('/generate', validateImageRequest, async (req, res) => {
    const requestId = uuidv4();
    
    try {
        const { prompt, width, height, model } = req.body;
        
        // Log request details
        console.log('Image generation request:', {
            requestId,
            prompt,
            width,
            height,
            model,
            timestamp: new Date().toISOString()
        });

        const result = await imageService.generateImage({
            requestId,
            prompt,
            width,
            height,
            model
        });

        res.json({
            requestId,
            ...result
        });
    } catch (error) {
        console.error('Error generating image:', error);
        
        // Check for specific error types
        if (error.message.includes('GPU memory')) {
            res.status(503).json({
                error: 'GPU resources are currently busy. Please try again in a few moments.',
                details: error.message
            });
        } else if (error.message.includes('rate limit')) {
            res.status(429).json({
                error: 'Rate limit exceeded. Please wait before making another request.',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Failed to generate image',
                details: error.message
            });
        }
    }
});

module.exports = router;
