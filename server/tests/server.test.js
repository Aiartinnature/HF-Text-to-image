const request = require('supertest');
const express = require('express');
const cors = require('cors');
const imageRoutes = require('../routes/imageRoutes');
const errorHandler = require('../middleware/errorHandler').errorHandler;

// Mock environment variables
process.env.HUGGINGFACE_API_KEY = 'test_api_key';
process.env.NODE_ENV = 'test';

// Mock imageService
jest.mock('../services/imageService', () => ({
    getAvailableModels: jest.fn(() => ({
        'flux-schnell': {
            id: 'black-forest-labs/FLUX.1-schnell',
            name: 'FLUX Schnell',
            description: 'Fast and efficient model for quick generations'
        }
    })),
    generateImage: jest.fn(async ({ prompt, width, height, model }) => ({
        image: 'base64_encoded_image_data',
        model: model || 'default-model',
        generationTime: 1000
    })),
    cancelRequest: jest.fn((requestId) => true)
}));

describe('Server API Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/api/image', imageRoutes);
        app.use(errorHandler);
    });

    describe('GET /api/image/models', () => {
        it('should return available models', async () => {
            const response = await request(app)
                .get('/api/image/models')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('models');
            expect(response.body.models).toHaveProperty('flux-schnell');
        });
    });

    describe('POST /api/image/generate', () => {
        it('should generate an image with valid input', async () => {
            const response = await request(app)
                .post('/api/image/generate')
                .send({
                    prompt: 'test prompt',
                    width: 512,
                    height: 512,
                    model: 'flux-schnell'
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('requestId');
            expect(response.body).toHaveProperty('image');
            expect(response.body).toHaveProperty('model');
            expect(response.body).toHaveProperty('generationTime');
        });

        it('should return 400 for missing prompt', async () => {
            const response = await request(app)
                .post('/api/image/generate')
                .send({
                    width: 512,
                    height: 512
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Validation failed');
        });

        it('should return 400 for invalid dimensions', async () => {
            const response = await request(app)
                .post('/api/image/generate')
                .send({
                    prompt: 'test prompt',
                    width: 100,  // Too small
                    height: 512
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.details).toContain('Width must be between 128 and 1024 pixels');
        });

        it('should return 400 for invalid model', async () => {
            const response = await request(app)
                .post('/api/image/generate')
                .send({
                    prompt: 'test prompt',
                    width: 512,
                    height: 512,
                    model: 'non-existent-model'
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.details[0]).toMatch(/Invalid model/);
        });
    });

    describe('POST /api/image/cancel', () => {
        const validUUID = '123e4567-e89b-12d3-a456-426614174000';

        it('should cancel an existing request', async () => {
            const response = await request(app)
                .post('/api/image/cancel')
                .send({
                    requestId: validUUID
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Request cancelled successfully');
            expect(response.body).toHaveProperty('requestId', validUUID);
        });

        it('should return 400 for invalid request ID format', async () => {
            const response = await request(app)
                .post('/api/image/cancel')
                .send({
                    requestId: 'invalid-uuid'
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.details).toContain('Invalid request ID format');
        });

        it('should return 400 for missing request ID', async () => {
            const response = await request(app)
                .post('/api/image/cancel')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.details).toContain('Request ID is required');
        });
    });
});
