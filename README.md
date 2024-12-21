# HF-Web: AI Image Generation Web Application

A modern web application for AI image generation using various Hugging Face models. Built with React and Node.js.

## Features

- Multiple AI Model Support
  - FLUX Models (Fast & Development versions)
  - NewReality XL
  - SDXL & SDXL LoRA
  - Stable Diffusion (v1.5, v2.1)
  - Openjourney
- Real-time Image Generation
- Model Selection Interface
- Image Size Customization
- Generation Cancel Support
- Rate Limit Handling
- Error Recovery
- Responsive UI

## Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- A Hugging Face API key

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd HF-Web
```

2. Install dependencies for both server and client:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
HUGGINGFACE_API_KEY=your_api_key_here
```

## Running the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Documentation

### API Documentation
For detailed API documentation, please see [API Documentation](server/docs/api.md).

The API documentation includes:
- Available endpoints
- Request/response formats
- Error handling
- Authentication
- Rate limiting
- Common error scenarios

### Server Endpoints

#### 1. Generate Image
- **Endpoint**: `/api/generate`
- **Method**: POST
- **Description**: Generates an image based on the provided prompt and parameters
- **Request Body**:
  ```json
  {
    "prompt": "string",
    "width": "number",
    "height": "number",
    "model": "string"
  }
  ```
- **Response**: Base64 encoded image data
- **Error Responses**:
  - 400: Invalid parameters
  - 429: Rate limit exceeded
  - 500: Server error

#### 2. Cancel Generation
- **Endpoint**: `/api/cancel`
- **Method**: POST
- **Description**: Cancels an ongoing image generation
- **Request Body**:
  ```json
  {
    "requestId": "string"
  }
  ```
- **Response**: Success message

#### 3. Get Available Models
- **Endpoint**: `/api/models`
- **Method**: GET
- **Description**: Returns list of available AI models
- **Response**:
  ```json
  [
    {
      "key": "string",
      "name": "string",
      "description": "string"
    }
  ]
  ```

### Error Handling

The API includes comprehensive error handling for:
- Rate limiting
- GPU memory issues
- Model availability
- Network timeouts
- Invalid requests

Error responses follow this format:
```json
{
  "error": "string",
  "details": "string" (optional)
}
```

## Configuration

### Available Models

The application supports multiple AI models, configured in `server/config/config.js`:

1. FLUX Schnell
   - Fast, efficient generations
   - Default model

2. FLUX Dev
   - Latest features and improvements
   - Development version

3. NewReality XL
   - High-quality photorealistic generations
   - Advanced capabilities

4. SDXL LoRA
   - Fine-tuned SDXL model
   - Enhanced text-to-image generation

5. Stable Diffusion XL
   - Latest SD version
   - High quality and photorealism

6. Stable Diffusion v2.1
   - Improved quality and consistency
   - Stable performance

7. Stable Diffusion v1.5
   - Original SD model
   - General purpose generation

8. Openjourney
   - Artistic style optimization
   - Creative generations

### Client Configuration

The client can be configured through environment variables in `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Recent Updates

### Latest Changes (December 2024)
- Added NewReality XL model
- Added SDXL LoRA support
- Improved error handling for GPU memory issues
- Enhanced rate limit feedback
- Added model cancellation feature
- Updated UI with better error messages
- Improved documentation
