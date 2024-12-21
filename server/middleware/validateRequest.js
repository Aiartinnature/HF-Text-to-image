const config = require('../config/config');

const validateImageRequest = (req, res, next) => {
    const { prompt, width, height, model } = req.body;
    const errors = [];
    
    // Prompt validation
    if (!prompt) {
        errors.push('Prompt is required');
    } else if (typeof prompt !== 'string') {
        errors.push('Prompt must be a string');
    } else if (prompt.length < 3) {
        errors.push('Prompt must be at least 3 characters long');
    } else if (prompt.length > 500) {
        errors.push('Prompt must not exceed 500 characters');
    }

    // Width validation
    if (width !== undefined) {
        if (typeof width !== 'number') {
            errors.push('Width must be a number');
        } else if (width < 128 || width > 1024) {
            errors.push('Width must be between 128 and 1024 pixels');
        } else if (width % 8 !== 0) {
            errors.push('Width must be divisible by 8');
        }
    }

    // Height validation
    if (height !== undefined) {
        if (typeof height !== 'number') {
            errors.push('Height must be a number');
        } else if (height < 128 || height > 1024) {
            errors.push('Height must be between 128 and 1024 pixels');
        } else if (height % 8 !== 0) {
            errors.push('Height must be divisible by 8');
        }
    }

    // Model validation
    if (model !== undefined) {
        const availableModels = Object.keys(config.models);
        if (!availableModels.includes(model)) {
            errors.push(`Invalid model. Available models: ${availableModels.join(', ')}`);
        }
    }

    // Return all validation errors at once
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

const validateCancelRequest = (req, res, next) => {
    const { requestId } = req.body;
    const errors = [];

    if (!requestId) {
        errors.push('Request ID is required');
    } else if (typeof requestId !== 'string') {
        errors.push('Request ID must be a string');
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
        errors.push('Invalid request ID format');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

module.exports = {
    validateImageRequest,
    validateCancelRequest
};
