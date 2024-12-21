const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const { v4: uuidv4 } = require('uuid');
const { validateImageRequest, validateCancelRequest } = require('../middleware/validateRequest');
const { ValidationError, ResourceError, RateLimitError } = require('../middleware/errorHandler');

router.get('/models', (req, res, next) => {
    try {
        const models = imageService.getAvailableModels();
        res.json({ models });
    } catch (error) {
        next(error);
    }
});

router.post('/cancel', validateCancelRequest, async (req, res, next) => {
    try {
        const { requestId } = req.body;
        const cancelled = imageService.cancelRequest(requestId);
        
        if (cancelled) {
            res.json({ 
                message: 'Request cancelled successfully',
                requestId 
            });
        } else {
            throw new ValidationError('Request not found or already completed');
        }
    } catch (error) {
        next(error);
    }
});

router.post('/generate', validateImageRequest, async (req, res, next) => {
    const requestId = uuidv4();
    
    try {
        const { prompt, width, height, model } = req.body;
        
        // Log request details
        console.log('Image generation request:', {
            requestId,
            prompt,
            width,
            height,
            model
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
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        // Convert specific errors to our custom error types
        if (error.message.includes('GPU memory')) {
            next(new ResourceError('GPU resources are currently busy', error.message));
        } else if (error.message.includes('rate limit')) {
            next(new RateLimitError('Rate limit exceeded', error.message));
        } else if (error.message === 'Image generation cancelled') {
            res.status(499).json({ 
                error: 'Request cancelled',
                requestId 
            });
        } else {
            next(error);
        }
    }
});

module.exports = router;
