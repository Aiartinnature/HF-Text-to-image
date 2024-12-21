git push -u origin masterrequire('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    huggingface: {
        apiUrl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        apiKey: process.env.HUGGINGFACE_API_KEY,
        defaultParams: {
            guidance_scale: 7.5,
            num_inference_steps: 50,
            defaultWidth: 1024,
            defaultHeight: 1024
        }
    },
    models: {
        'flux-schnell': {
            id: 'black-forest-labs/FLUX.1-schnell',
            name: 'FLUX Schnell',
            description: 'Fast and efficient model for quick generations'
        },
        'flux-dev': {
            id: 'black-forest-labs/FLUX.1-dev',
            name: 'FLUX Dev',
            description: 'Development version with latest features and improvements'
        },
        'newreality-xl': {
            id: 'stablediffusionapi/newrealityxl-global-nsfw',
            name: 'NewReality XL',
            description: 'Advanced model for high-quality photorealistic generations'
        },
        'sdxl-lora': {
            id: 'stabilityai/stable-diffusion-xl-base-1.0',
            name: 'SDXL LoRA',
            description: 'Fine-tuned SDXL model with LoRA for enhanced text-to-image generation'
        },
        'stable-diffusion-xl': {
            id: 'stabilityai/stable-diffusion-xl-base-1.0',
            name: 'Stable Diffusion XL',
            description: 'Latest version with significantly improved quality and photorealism'
        },
        'stable-diffusion-v2.1': {
            id: 'stabilityai/stable-diffusion-2-1',
            name: 'Stable Diffusion v2.1',
            description: 'Improved version with better quality and consistency'
        },
        'stable-diffusion-v1.5': {
            id: 'runwayml/stable-diffusion-v1-5',
            name: 'Stable Diffusion v1.5',
            description: 'Original stable diffusion model, good for general purpose image generation'
        },
        'openjourney': {
            id: 'prompthero/openjourney',
            name: 'Openjourney',
            description: 'Optimized for artistic and creative styles'
        }
    }
};

module.exports = config;
