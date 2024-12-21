const { ImageService } = require('../../services/imageService');
const { ValidationError, ResourceError, RateLimitError } = require('../../middleware/errorHandler');
const axios = require('axios');

jest.mock('axios');

describe('Hugging Face API Integration Tests', () => {
    let imageService;

    beforeEach(() => {
        imageService = new ImageService('test-api-key');
        jest.clearAllMocks();
    });

    describe('Image Generation', () => {
        it('should generate an image successfully', async () => {
            const mockResponse = {
                data: Buffer.from('fake-image-data'),
                headers: { 'content-type': 'image/jpeg' }
            };
            axios.post.mockResolvedValueOnce(mockResponse);

            const result = await imageService.generateImage({
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'stable-diffusion-v1.5'
            });

            expect(result).toEqual({
                image: mockResponse.data,
                contentType: 'image/jpeg'
            });
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/text-to-image'),
                expect.any(Object),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
        });

        it('should handle invalid model gracefully', async () => {
            const errorMessage = 'Invalid model';
            const error = new Error(errorMessage);
            error.response = { status: 404, data: 'Model not found' };
            axios.post.mockRejectedValueOnce(error);

            await expect(imageService.generateImage({
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'non-existent-model'
            })).rejects.toThrow(ValidationError);
        });

        it('should handle API errors gracefully', async () => {
            const errorMessage = 'API Error';
            axios.post.mockRejectedValueOnce(new Error(errorMessage));

            await expect(imageService.generateImage({
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'stable-diffusion-v1.5'
            })).rejects.toThrow(Error);
        });
    });

    describe('Model Listing', () => {
        it('should return available models', async () => {
            const mockModels = ['model1', 'model2'];
            axios.get.mockResolvedValueOnce({ data: mockModels });

            const models = await imageService.getAvailableModels();
            expect(models).toEqual(mockModels);
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/models'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
        });
    });

    describe('Request Cancellation', () => {
        it('should handle request cancellation', async () => {
            const requestId = '123e4567-e89b-12d3-a456-426614174000';
            await imageService.cancelRequest(requestId);
            expect(true).toBe(true); // Just verify it doesn't throw
        });
    });

    describe('Error Handling', () => {
        it('should handle rate limiting', async () => {
            const rateLimitError = {
                response: {
                    status: 429,
                    data: { error: 'Too Many Requests' }
                }
            };
            axios.post.mockRejectedValueOnce(rateLimitError);

            await expect(imageService.generateImage({
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'stable-diffusion-v1.5'
            })).rejects.toThrow(RateLimitError);
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network Error');
            networkError.code = 'ECONNREFUSED';
            axios.post.mockRejectedValueOnce(networkError);

            await expect(imageService.generateImage({
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'stable-diffusion-v1.5'
            })).rejects.toThrow(ResourceError);
        });
    });
});
