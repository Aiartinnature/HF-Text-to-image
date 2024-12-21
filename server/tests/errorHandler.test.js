const { 
    errorHandler, 
    ValidationError, 
    ResourceError, 
    RateLimitError 
} = require('../middleware/errorHandler');

describe('Error Handler Tests', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            method: 'GET',
            path: '/',
            get: jest.fn()
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        process.env.NODE_ENV = 'production';
    });

    it('should handle ValidationError', () => {
        const error = new ValidationError('Validation failed', ['Field is required']);

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Validation failed',
            details: ['Field is required']
        });
    });

    it('should handle ResourceError', () => {
        const error = new ResourceError('Resource busy', 'GPU memory full');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Resource busy',
            details: 'GPU memory full'
        });
    });

    it('should handle RateLimitError', () => {
        const error = new RateLimitError('Too many requests', 'Rate limit exceeded');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Too many requests',
            details: 'Rate limit exceeded'
        });
    });

    it('should handle unknown errors in production', () => {
        const error = new Error('Internal error');
        process.env.NODE_ENV = 'production';

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Internal server error',
            requestId: expect.any(String)
        });
    });

    it('should handle unknown errors in development', () => {
        const error = new Error('Debug error');
        process.env.NODE_ENV = 'development';

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Debug error',
            requestId: expect.any(String),
            stack: expect.any(String)
        });
    });

    it('should handle errors with custom status codes', () => {
        const error = new Error('Custom error');
        error.statusCode = 418;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(418);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Custom error',
            requestId: expect.any(String)
        });
    });

    it('should include request details in error log', () => {
        const consoleSpy = jest.spyOn(console, 'error');
        const error = new Error('Test error');
        mockReq.method = 'POST';
        mockReq.path = '/api/test';
        mockReq.body = { test: 'data' };
        mockReq.ip = '127.0.0.1';
        mockReq.get.mockReturnValue('test-agent');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith('Error details:', expect.objectContaining({
            message: 'Test error',
            request: expect.objectContaining({
                method: 'POST',
                path: '/api/test',
                body: { test: 'data' },
                ip: '127.0.0.1',
                userAgent: 'test-agent'
            })
        }));

        consoleSpy.mockRestore();
    });
});
