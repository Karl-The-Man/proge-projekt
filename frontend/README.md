# Music Generation Frontend

A modern web frontend for the Suno API music generation service. This application allows users to upload MP3 files, configure generation settings, and listen to/download AI-generated music tracks.

## Features

- **File Upload**: Drag-and-drop or click to browse MP3 files
- **Style Configuration**: Enter style descriptions for music generation
- **Advanced Settings**: 
  - Weirdness Constraint (0-1)
  - Style Weight (0-1)
  - Model Selection (V3_5, V4, V4_5, V4_5PLUS, V5)
  - Instrumental Toggle (default: ON)
- **Real-time Status**: Polling for generation status updates
- **Audio Playback**: Built-in audio players for generated tracks
- **Download**: Download generated tracks directly

## Setup

1. **Open the application**: Simply open `index.html` in a web browser, or serve it using a local web server.

2. **Configure Backend URL**: 
   - Open `js/api.js`
   - Update the `API_BASE_URL` constant with your FastAPI backend URL
   - If using ngrok, use your ngrok URL (e.g., `https://abc123.ngrok.io`)

## Usage

1. **Upload File**: Drag and drop an MP3 file or click to browse
2. **Enter Style**: Describe the style you want for your music
3. **Adjust Settings** (optional): Click "Advanced Settings" to customize generation parameters
4. **Generate**: Click the "Generate Music" button
5. **Wait**: The application will poll for status updates
6. **Listen & Download**: Once complete, two tracks will be displayed with audio players and download buttons

## Backend API Requirements

The frontend expects the following FastAPI endpoints:

### POST `/api/upload-cover`
Uploads a file and starts generation.

**Request (FormData):**
- `file`: MP3 file
- `prompt`: Style description string
- `weirdnessConstraint`: Number (0-1)
- `styleWeight`: Number (0-1)
- `model`: String (V3_5, V4, V4_5, V4_5PLUS, V5)
- `instrumental`: Boolean

**Response:**
```json
{
  "taskId": "string"
}
```

### GET `/api/generation-status/{taskId}`
Polls for generation status.

**Response:**
```json
{
  "status": "PENDING|SUCCESS|FAILED|...",
  "data": { ... }
}
```

### GET `/api/generation-details/{taskId}`
Gets detailed generation information including audio URLs.

**Response:**
```json
{
  "data": {
    "response": {
      "sunoData": [
        {
          "audioUrl": "string",
          "title": "string",
          "duration": number,
          "tags": "string",
          "modelName": "string"
        }
      ]
    }
  }
}
```

## File Structure

```
frontend/
├── index.html          # Main HTML structure
├── js/
│   ├── main.js         # Core application logic
│   ├── api.js          # Backend API communication
│   └── utils.js        # Utility functions
├── css/
│   └── styles.css      # Custom styles
└── README.md           # This file
```

## Technologies

- **HTML5**: Structure
- **Tailwind CSS**: Styling (via CDN)
- **Vanilla JavaScript**: No frameworks required
- **Fetch API**: HTTP requests

## Browser Support

Modern browsers that support:
- ES6+ JavaScript
- Fetch API
- HTML5 Audio
- Drag and Drop API

## Notes

- The frontend polls the backend every 5 seconds for status updates
- File validation checks for MP3 format and size limits
- All settings have sensible defaults
- Error messages are displayed for 10 seconds before auto-hiding

