const { v4: uuidv4 } = require('uuid');

// Custom error classes
class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class ResourceError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ResourceError';
        this.details = details;
    }
}

class RateLimitError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'RateLimitError';
        this.details = details;
    }
}

// Helper function to create error log object
function createErrorLog(err, req) {
    return {
        timestamp: new Date().toISOString(),
        type: err.name || err.constructor.name,
        message: err.message,
        stack: err.stack,
        details: err.details,
        request: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent')
        }
    };
}

// Helper function to log error details
function logError(err, req) {
    const errorLog = createErrorLog(err, req);
    console.error('Error details:', errorLog);
}

// Main error handler middleware
function errorHandler(err, req, res, next) {
    logError(err, req);

    // Generate a unique request ID for tracking
    const requestId = uuidv4();

    // Handle specific error types
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: err.message,
            details: err.details
        });
    }

    if (err instanceof ResourceError) {
        return res.status(503).json({
            error: err.message,
            details: err.details
        });
    }

    if (err instanceof RateLimitError) {
        return res.status(429).json({
            error: err.message,
            details: err.details
        });
    }

    // Handle custom status codes
    const statusCode = err.statusCode || 500;
    const errorResponse = {
        error: process.env.NODE_ENV === 'development' ? err.message : (statusCode === 500 ? 'Internal server error' : err.message),
        requestId
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
}

module.exports = {
    ValidationError,
    ResourceError,
    RateLimitError,
    errorHandler
};
