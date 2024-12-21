const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');

router.post('/generate', async (req, res) => {
    try {
        const { prompt, width, height } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const image = await imageService.generateImage(prompt, width, height);
        res.json({ image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
