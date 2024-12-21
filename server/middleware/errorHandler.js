// Custom error classes
class ValidationError extends Error {
    constructor(message, details = []) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
        this.statusCode = 400;
    }
}

class ResourceError extends Error {
    constructor(message, details = '') {
        super(message);
        this.name = 'ResourceError';
        this.details = details;
        this.statusCode = 503;
    }
}

class RateLimitError extends Error {
    constructor(message, details = '') {
        super(message);
        this.name = 'RateLimitError';
        this.details = details;
        this.statusCode = 429;
    }
}

// Error logging function
const logError = (err, req) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        type: err.name || 'Error',
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

    console.error('Error details:', errorLog);
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
    logError(err, req);

    // Set default status code and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong!';
    let details = err.details;

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            // Already handled by the error class
            break;
        case 'ResourceError':
            // Already handled by the error class
            break;
        case 'RateLimitError':
            // Already handled by the error class
            break;
        case 'TypeError':
            statusCode = 400;
            message = 'Invalid input type';
            break;
        case 'SyntaxError':
            statusCode = 400;
            message = 'Invalid request syntax';
            break;
        default:
            // Hide internal error details in production
            if (process.env.NODE_ENV === 'production') {
                details = undefined;
            }
    }

    // Send error response
    res.status(statusCode).json({
        error: message,
        details: details,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    errorHandler,
    ValidationError,
    ResourceError,
    RateLimitError
};
