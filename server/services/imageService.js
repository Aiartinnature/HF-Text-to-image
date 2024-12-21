const axios = require('axios');
const { ValidationError, ResourceError, RateLimitError } = require('../middleware/errorHandler');
const config = require('../config/config');

class ImageService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api-inference.huggingface.co/models';
        this.activeRequests = new Map();
    }

    async generateImage(params) {
        const { prompt, width, height, model } = params;

        try {
            const response = await axios.post(
                `${this.baseUrl}/${model}/text-to-image`,
                {
                    inputs: prompt,
                    parameters: { width, height }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );

            return {
                image: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            if (error.response) {
                if (error.response.status === 429) {
                    throw new RateLimitError('Too many requests', 'Rate limit exceeded');
                }
                if (error.response.status === 404) {
                    throw new ValidationError('Invalid model', 'Model not found');
                }
                throw new ResourceError('API Error', error.response.data.toString());
            }
            if (error.code === 'ECONNREFUSED') {
                throw new ResourceError('Service unavailable', 'Could not connect to API');
            }
            throw error;
        }
    }

    async getAvailableModels() {
        try {
            const response = await axios.get(
                `${this.baseUrl}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                throw new RateLimitError('Too many requests', 'Rate limit exceeded');
            }
            throw new ResourceError('Failed to fetch models', error.message);
        }
    }

    async cancelRequest(requestId) {
        const request = this.activeRequests.get(requestId);
        if (request) {
            if (request.cancelToken) {
                request.cancelToken.cancel('Request cancelled by user');
            }
            this.activeRequests.delete(requestId);
        }
    }
}

module.exports = { ImageService };
