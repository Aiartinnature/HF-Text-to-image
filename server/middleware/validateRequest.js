const config = require('../config/config');
const { ValidationError } = require('./errorHandler');

const validateImageRequest = (req, res, next) => {
    const { prompt, width, height, model } = req.body;
    const errors = [];
    
    // Prompt validation
    if (!prompt) {
        errors.push('Prompt is required');
    } else if (typeof prompt !== 'string') {
        errors.push('Prompt must be a string');
    } else if (prompt.length < 1 || prompt.length > 1000) {
        errors.push('Prompt must be between 1 and 1000 characters');
    }

    // Width validation
    if (width !== undefined) {
        if (typeof width !== 'number') {
            errors.push('Width must be a number');
        } else if (width < 128 || width > 1024) {
            errors.push('Width must be between 128 and 1024 pixels');
        } else if (width % 8 !== 0) {
            errors.push('Width must be a multiple of 8');
        }
    }

    // Height validation
    if (height !== undefined) {
        if (typeof height !== 'number') {
            errors.push('Height must be a number');
        } else if (height < 128 || height > 1024) {
            errors.push('Height must be between 128 and 1024 pixels');
        } else if (height % 8 !== 0) {
            errors.push('Height must be a multiple of 8');
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
        next(new ValidationError('Validation failed', errors));
        return;
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
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
        errors.push('Invalid request ID format');
    }

    if (errors.length > 0) {
        next(new ValidationError('Validation failed', errors));
        return;
    }

    next();
};

module.exports = {
    validateImageRequest,
    validateCancelRequest
};
