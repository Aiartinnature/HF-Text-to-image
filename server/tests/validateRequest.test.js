const { validateImageRequest, validateCancelRequest } = require('../middleware/validateRequest');
const { ValidationError } = require('../middleware/errorHandler');

describe('Request Validation Tests', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    describe('validateImageRequest', () => {
        it('should pass valid request', () => {
            mockReq.body = {
                prompt: 'test prompt',
                width: 512,
                height: 512,
                model: 'flux-schnell'
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should validate prompt length', () => {
            mockReq.body = {
                prompt: 'a'.repeat(1001),
                width: 512,
                height: 512
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details).toContain('Prompt must be between 1 and 1000 characters');
        });

        it('should validate width range', () => {
            mockReq.body = {
                prompt: 'test prompt',
                width: 2000,
                height: 512
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details).toContain('Width must be between 128 and 1024 pixels');
        });

        it('should validate height range', () => {
            mockReq.body = {
                prompt: 'test prompt',
                width: 512,
                height: 64
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details).toContain('Height must be between 128 and 1024 pixels');
        });

        it('should validate dimensions are multiples of 8', () => {
            mockReq.body = {
                prompt: 'test prompt',
                width: 515,
                height: 513
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details.some(d => d.includes('multiple of 8'))).toBe(true);
        });

        it('should collect multiple validation errors', () => {
            mockReq.body = {
                prompt: '',
                width: 50,
                height: 2000
            };

            validateImageRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details.length).toBeGreaterThan(1);
        });
    });

    describe('validateCancelRequest', () => {
        it('should pass valid UUID', () => {
            mockReq.body = {
                requestId: '123e4567-e89b-12d3-a456-426614174000'
            };

            validateCancelRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should reject invalid UUID format', () => {
            mockReq.body = {
                requestId: 'invalid-uuid'
            };

            validateCancelRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details).toContain('Invalid request ID format');
        });

        it('should reject missing requestId', () => {
            mockReq.body = {};

            validateCancelRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.any(ValidationError)
            );
            const error = mockNext.mock.calls[0][0];
            expect(error.details).toContain('Request ID is required');
        });
    });
});
