# AI Image Generator

A modern web application that generates images using the Hugging Face API based on text prompts. Built with React.js frontend and Node.js backend.

## Features

- Text-to-image generation using Hugging Face's Stable Diffusion model
- Customizable image dimensions
- Modern, responsive UI
- Image download functionality
- Real-time loading states and error handling

## Project Structure

```
HF-Web/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── ImageGenerator/
│   │   │       ├── ImageGenerator.js    # Main component
│   │   │       ├── PromptInput.js       # Text input component
│   │   │       ├── DimensionControls.js # Size controls
│   │   │       └── ImageDisplay.js      # Image display & download
│   │   ├── services/     # API services
│   │   │   └── imageService.js
│   │   ├── App.js        # Root component
│   │   └── index.js      # Entry point
│   └── package.json
└── server/                # Node.js backend
    ├── config/
    │   └── config.js      # Server configuration
    ├── routes/
    │   └── imageRoutes.js # API routes
    ├── services/
    │   └── imageService.js # Image generation service
    ├── server.js          # Server entry point
    └── package.json

```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Hugging Face API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd HF-Web
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the server directory:
   ```
   HUGGINGFACE_API_KEY=your_api_key_here
   PORT=5000
   ```

4. Start the application:
   ```bash
   # Start the server (from server directory)
   node server.js

   # Start the client (from client directory)
   npm start
   ```

## API Endpoints

### `POST /api/image/generate`
Generates an image based on the provided prompt and dimensions.

Request body:
```json
{
  "prompt": "string",
  "width": number,
  "height": number
}
```

Response:
```json
{
  "image": "base64_encoded_image"
}
```

## Component Documentation

### ImageGenerator
Main component that orchestrates the image generation process.
- Manages application state
- Handles form submission
- Coordinates between child components

### PromptInput
Handles user input for the image generation prompt.
- Input validation
- Error display
- Character limit enforcement

### DimensionControls
Controls for image dimensions.
- Width selection
- Height selection
- Preset dimension options

### ImageDisplay
Displays the generated image and provides download functionality.
- Image rendering
- Download button
- Loading state display

## Environment Variables

### Server
- `HUGGINGFACE_API_KEY`: Your Hugging Face API key
- `PORT`: Server port (default: 5000)

## Error Handling

The application includes comprehensive error handling:
- Invalid API key detection
- Network error handling
- Input validation
- Server-side error responses
- User-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
