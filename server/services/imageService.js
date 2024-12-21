const axios = require('axios');
const config = require('../config/config');

class ImageService {
    constructor() {
        this.apiUrl = config.huggingface.apiUrl;
        this.apiKey = config.huggingface.apiKey;
        this.defaultParams = config.huggingface.defaultParams;
    }

    async generateImage(prompt, width = this.defaultParams.defaultWidth, height = this.defaultParams.defaultHeight) {
        try {
            const response = await axios({
                method: 'post',
                url: this.apiUrl,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    inputs: prompt,
                    parameters: {
                        width: parseInt(width),
                        height: parseInt(height),
                        guidance_scale: this.defaultParams.guidance_scale,
                        num_inference_steps: this.defaultParams.num_inference_steps
                    }
                },
                responseType: 'arraybuffer'
            });

            if (!response.data) {
                throw new Error('No data received from API');
            }

            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            return `data:image/png;base64,${base64Image}`;
        } catch (error) {
            console.error('Image generation error:', error.response?.data ? error.response.data.toString() : error.message);
            throw new Error('Failed to generate image');
        }
    }
}

module.exports = new ImageService();
