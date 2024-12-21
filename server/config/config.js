require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    huggingface: {
        apiUrl: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        apiKey: process.env.HUGGINGFACE_API_KEY,
        defaultParams: {
            guidance_scale: 7.5,
            num_inference_steps: 50,
            defaultWidth: 1024,
            defaultHeight: 1024
        }
    }
};

module.exports = config;
