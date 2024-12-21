const errorHandler = (err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        details: err.details || 'No additional details'
    });
    
    res.status(500).json({ 
        error: err.message || 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.details : undefined
    });
};

module.exports = errorHandler;
