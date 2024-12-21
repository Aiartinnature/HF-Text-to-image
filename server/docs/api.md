# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Currently, no authentication is required for API endpoints. The server uses the Hugging Face API key set in environment variables.

## Endpoints

### List Available Models
Get a list of all available AI models for image generation.

**Endpoint:** `GET /image/models`

**Response:**
```json
{
    "models": {
        "flux-schnell": {
            "id": "black-forest-labs/FLUX.1-schnell",
            "name": "FLUX Schnell",
            "description": "Fast and efficient model for quick generations"
        },
        // ... other models
    }
}
```

### Generate Image
Generate an image from a text prompt.

**Endpoint:** `POST /image/generate`

**Request Body:**
```json
{
    "prompt": "string (required)",
    "width": "number (optional, 128-1024)",
    "height": "number (optional, 128-1024)",
    "model": "string (optional)"
}
```

**Response:**
```json
{
    "requestId": "string",
    "image": "base64 string",
    "model": "string",
    "generationTime": "number"
}
```

**Error Responses:**
- `400`: Invalid input parameters
- `429`: Rate limit exceeded
- `503`: GPU resources busy
- `500`: Internal server error

### Cancel Generation
Cancel an ongoing image generation request.

**Endpoint:** `POST /image/cancel`

**Request Body:**
```json
{
    "requestId": "string (required)"
}
```

**Response:**
```json
{
    "message": "Request cancelled successfully"
}
```

**Error Responses:**
- `400`: Missing request ID
- `404`: Request not found or already completed
- `500`: Internal server error

## Error Handling

### Error Response Format
```json
{
    "error": "Error message",
    "details": "Detailed error information (development mode only)"
}
```

### Common Error Types
1. **Validation Errors** (400)
   - Invalid dimensions
   - Missing required fields
   - Invalid model selection

2. **Resource Errors** (503)
   - GPU memory exhausted
   - Model loading failed

3. **Rate Limiting** (429)
   - Too many requests
   - Model-specific rate limits

4. **Server Errors** (500)
   - Internal processing errors
   - API communication errors
