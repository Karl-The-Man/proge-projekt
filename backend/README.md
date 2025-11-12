KIRJUTASIN GUIDE-I OLIVERILE!!!

# Suno API Backend

FastAPI backend that integrates with the Suno API to provide AI-powered music generation capabilities. This backend acts as a proxy between the frontend web application and the Suno API, handling file uploads, task management, and status polling.

## Features

- **File Upload Handling**: Accepts MP3 file uploads from the frontend
- **Public File Serving**: Provides public URLs for uploaded files (required by Suno API)
- **Suno API Integration**: Communicates with Suno API's upload-cover endpoint
- **Task Status Polling**: Provides endpoints for checking generation status
- **Generation Details**: Retrieves detailed information about completed generations
- **CORS Support**: Configured to work with the frontend application
- **Error Handling**: Comprehensive error handling and validation

## Prerequisites

- Python 3.8 or higher
- Suno API key (obtain from [sunoapi.org](https://sunoapi.org/api-key))
- ngrok (for local development with public URL)

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment**:
   ```bash
   # On macOS/Linux:
   source venv/bin/activate

   # On Windows:
   venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

6. **Configure environment variables** in `.env`:
   ```env
   SUNO_API_KEY=your_actual_api_key_here
   SUNO_API_BASE_URL=https://api.sunoapi.org
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=8000
   PUBLIC_BASE_URL=http://localhost:8000  # Update with ngrok URL when using
   MAX_FILE_SIZE_MB=10
   UPLOAD_DIR=./uploads
   ```

## Running the Backend

### Option 1: Local Development (Without ngrok)

⚠️ **Note**: This won't work with Suno API as it requires a public URL to download uploaded files. Use Option 2 for full functionality.

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Local Development with ngrok (Recommended)

1. **Start the backend**:
   ```bash
   python main.py
   ```

2. **In a separate terminal, start ngrok**:
   ```bash
   ngrok http 8000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update `.env` file**:
   ```env
   PUBLIC_BASE_URL=https://abc123.ngrok.io
   ```

5. **Restart the backend** to load the new configuration

6. **Update frontend API URL** in `frontend/js/api.js`:
   ```javascript
   let API_BASE_URL = 'https://abc123.ngrok.io';
   ```

### Option 3: Production Deployment

When deploying to a production server with a public domain:

1. **Update `.env`**:
   ```env
   PUBLIC_BASE_URL=https://yourdomain.com
   ```

2. **Run with production server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## API Endpoints

### Health Check
```http
GET /health
```
Returns the health status of the API.

### Upload and Generate
```http
POST /api/upload-cover
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (file, required): MP3 audio file to upload
- `prompt` (string, required): Style description or lyrics
- `weirdnessConstraint` (float, 0.00-1.00): Creative deviation control (default: 0.65)
- `styleWeight` (float, 0.00-1.00): Style guidance weight (default: 0.65)
- `audioWeight` (float, 0.00-1.00): Input audio influence (default: 0.65)
- `model` (string): AI model version - V3_5, V4, V4_5, V4_5PLUS, V5 (default: V5)
- `instrumental` (boolean): Generate instrumental track (default: true)

**Response:**
```json
{
  "taskId": "5c79be8e..."
}
```

### Get Generation Status
```http
GET /api/generation-status/{taskId}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": { ... },
  "errorMessage": null
}
```

**Status Values:**
- `PENDING`: Task is queued
- `TEXT_SUCCESS`: Text generation completed
- `FIRST_SUCCESS`: First track completed
- `SUCCESS`: All tracks completed
- `CREATE_TASK_FAILED`: Task creation failed
- `GENERATE_AUDIO_FAILED`: Audio generation failed
- `CALLBACK_EXCEPTION`: Callback error
- `SENSITIVE_WORD_ERROR`: Content policy violation

### Get Generation Details
```http
GET /api/generation-details/{taskId}
```

**Response:**
```json
{
  "data": {
    "taskId": "5c79be8e...",
    "status": "SUCCESS",
    "response": {
      "sunoData": [
        {
          "id": "8551662c...",
          "audioUrl": "https://...",
          "title": "Track Title",
          "duration": 180.5,
          "tags": "style tags",
          "modelName": "chirp-v3-5"
        }
      ]
    }
  }
}
```

## File Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment configuration (create from .env.example)
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── uploads/            # Uploaded files directory (auto-created)
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUNO_API_KEY` | Your Suno API key (required) | - |
| `SUNO_API_BASE_URL` | Suno API base URL | `https://api.sunoapi.org` |
| `BACKEND_HOST` | Backend host address | `0.0.0.0` |
| `BACKEND_PORT` | Backend port number | `8000` |
| `PUBLIC_BASE_URL` | Public URL for file serving | `http://localhost:8000` |
| `MAX_FILE_SIZE_MB` | Maximum upload file size | `10` |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` |

### Suno API Models

- **V3_5**: Better song structure, up to 4 minutes
- **V4**: Improved vocals, up to 4 minutes
- **V4_5**: Smart prompts, faster generation, up to 8 minutes
- **V4_5PLUS**: Richer tones, most advanced, up to 8 minutes
- **V5**: Latest model with enhanced capabilities (default)

## Troubleshooting

### "No task ID received from Suno API"
- Verify your `SUNO_API_KEY` is correct
- Check that your API key has sufficient credits
- Ensure you're using the correct `SUNO_API_BASE_URL`

### "Suno API cannot download the file"
- Ensure `PUBLIC_BASE_URL` is set to your ngrok URL
- Verify the ngrok tunnel is active
- Check that the uploaded file is accessible at the public URL

### "File size exceeds maximum"
- Uploaded MP3 files must be under 10MB (approximately 2 minutes)
- Reduce the file size or compress the audio

### CORS Errors
- The backend is configured to allow all origins (`allow_origins=["*"]`)
- For production, update this to specific origins in `main.py`

## Development

### Testing Endpoints

You can test endpoints using curl:

```bash
# Health check
curl http://localhost:8000/health

# Upload and generate (example)
curl -X POST http://localhost:8000/api/upload-cover \
  -F "file=@test.mp3" \
  -F "prompt=Classical piano music" \
  -F "model=V5" \
  -F "instrumental=true"

# Check status
curl http://localhost:8000/api/generation-status/{taskId}

# Get details
curl http://localhost:8000/api/generation-details/{taskId}
```

### API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Security Notes

- Never commit the `.env` file to version control
- Keep your `SUNO_API_KEY` secure
- In production, configure specific CORS origins instead of `*`
- Consider implementing rate limiting for production use
- Implement authentication for production deployments
- Regularly clean up old uploaded files to save storage

## Credits

This backend integrates with [Suno API](https://sunoapi.org/) for AI music generation.

## License

Academic project for Tartu Ülikool programming course.
