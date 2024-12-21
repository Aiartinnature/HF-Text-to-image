const validateImageRequest = (req, res, next) => {
    const { prompt, width, height, model } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Optional validation for width and height
    if (width && (width < 128 || width > 1024)) {
        return res.status(400).json({ error: 'Width must be between 128 and 1024 pixels' });
    }

    if (height && (height < 128 || height > 1024)) {
        return res.status(400).json({ error: 'Height must be between 128 and 1024 pixels' });
    }

    next();
};

module.exports = {
    validateImageRequest
};
