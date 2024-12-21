const axios = require('axios');
const config = require('../config/config');

class ImageService {
    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!this.apiKey) {
            throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
        }
        this.defaultParams = config.huggingface.defaultParams;
        this.activeRequests = new Map();
    }

    cancelRequest(requestId) {
        console.log(`Attempting to cancel request: ${requestId}`);
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            console.log(`Found active request ${requestId}, cancelling...`);
            controller.abort();
            this.activeRequests.delete(requestId);
            return true;
        }
        console.log(`No active request found for ID: ${requestId}`);
        return false;
    }

    async generateImage(prompt, width, height, modelKey = null, requestId = null) {
        const controller = new AbortController();
        if (requestId) {
            console.log(`Starting new request: ${requestId}`);
            this.activeRequests.set(requestId, controller);
        }

        try {
            console.log('Generating image with parameters:', {
                modelKey,
                width,
                height,
                promptLength: prompt?.length,
                requestId
            });

            let model = config.models[modelKey];
            if (!model && !modelKey) {
                console.log('No model selected, using default FLUX model');
                model = config.models['flux-schnell'];
            } else if (!model) {
                throw new Error(`Invalid model selected: ${modelKey}`);
            }

            const apiUrl = `https://api-inference.huggingface.co/models/${model.id}`;
            console.log(`Using model: ${model.name} (${model.id})`);

            const requestData = {
                inputs: prompt,
                parameters: {
                    width: parseInt(width) || this.defaultParams.defaultWidth,
                    height: parseInt(height) || this.defaultParams.defaultHeight,
                    guidance_scale: this.defaultParams.guidance_scale,
                    num_inference_steps: this.defaultParams.num_inference_steps
                }
            };

            console.log('Making API request to:', apiUrl);
            const response = await axios({
                method: 'post',
                url: apiUrl,
                data: requestData,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                signal: controller.signal,
                validateStatus: false,
                timeout: 120000 // 2 minute timeout
            });

            console.log('Response status:', response.status);

            // Check for non-200 response
            if (response.status !== 200) {
                const errorText = Buffer.from(response.data).toString('utf-8');
                console.error('API Error Response:', errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    let errorMessage = errorJson.error || 'API returned an error';
                    
                    // Enhance error messages
                    if (errorMessage.includes('Model too busy') || errorMessage.includes('unable to get response')) {
                        errorMessage = `${model.name} is currently busy. Please try again in a few minutes or select a different model.`;
                    }
                    
                    // Handle CUDA out of memory errors
                    if (errorJson.warnings && errorJson.warnings.some(w => w.includes('CUDA out of memory'))) {
                        errorMessage = `The model server is currently out of GPU memory. Please try:\n1. Using a smaller image size\n2. Waiting a few minutes\n3. Trying a different model`;
                    }
                    
                    throw new Error(errorMessage);
                } catch (e) {
                    throw new Error(`API returned status ${response.status}: ${errorText}`);
                }
            }

            if (!response.data || response.data.length === 0) {
                throw new Error('No data received from API');
            }

            // Try to detect if response is an error message
            if (response.data.length < 1000) { // If response is suspiciously small
                try {
                    const errorText = Buffer.from(response.data).toString('utf-8');
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error) {
                        throw new Error(errorJson.error);
                    }
                } catch (e) {
                    // If parsing fails, assume it's a valid (but small) image
                    console.log('Small response received, but appears to be valid');
                }
            }

            console.log('Successfully generated image');
            const base64Image = Buffer.from(response.data).toString('base64');
            return `data:image/jpeg;base64,${base64Image}`;
        } catch (error) {
            console.error('Generation error:', error.message);
            
            if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.message.includes('aborted')) {
                console.log('Request was aborted');
                throw new Error('Image generation cancelled');
            }

            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error(`The request to ${config.models[modelKey]?.name || 'the model'} timed out. Please try again or select a different model.`);
            }

            if (error.response) {
                const errorMessage = error.response.data instanceof Buffer
                    ? error.response.data.toString('utf-8')
                    : JSON.stringify(error.response.data);
                console.error('API Error Details:', errorMessage);
                
                let userMessage = 'Failed to generate image';
                try {
                    const errorJson = JSON.parse(errorMessage);
                    userMessage = errorJson.error || userMessage;
                    
                    // Enhance error messages
                    if (userMessage.includes('Model too busy') || userMessage.includes('unable to get response')) {
                        userMessage = `${config.models[modelKey]?.name || 'The model'} is currently busy. Please try again in a few minutes or select a different model.`;
                    }
                    
                    // Handle CUDA out of memory errors
                    if (errorJson.warnings && errorJson.warnings.some(w => w.includes('CUDA out of memory'))) {
                        userMessage = `The model server is currently out of GPU memory. Please try:\n1. Using a smaller image size\n2. Waiting a few minutes\n3. Trying a different model`;
                    }
                } catch (e) {
                    userMessage = errorMessage || userMessage;
                }
                throw new Error(userMessage);
            }
            throw error;
        } finally {
            if (requestId) {
                console.log(`Cleaning up request: ${requestId}`);
                this.activeRequests.delete(requestId);
            }
        }
    }

    getAvailableModels() {
        return Object.entries(config.models).map(([key, model]) => ({
            key,
            name: model.name,
            description: model.description
        }));
    }
}

module.exports = new ImageService();
