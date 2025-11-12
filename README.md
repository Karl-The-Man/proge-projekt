# AI Music Generation with Suno API

A web application that integrates with the Suno API to provide AI-powered music generation. Upload an MP3 file, describe the style you want, and let AI transform your audio into something new!

**University Project** - Tartu Ülikool Programming Course

## Project Overview

This project consists of two main components:

1. **Frontend**: A modern web interface built with vanilla JavaScript and Tailwind CSS
2. **Backend**: A FastAPI server that integrates with the Suno API

The application allows users to upload MP3 files, configure generation parameters (style, model version, audio weights), and receive AI-generated music tracks in response.

## Features

- 🎵 Upload MP3 files (up to 10MB, ~2 minutes)
- 🎨 Customize style and generation parameters
- 🤖 Multiple AI model versions (V3_5, V4, V4_5, V4_5PLUS, V5)
- 🎚️ Advanced controls: weirdness, style weight, audio weight
- 🎹 Instrumental or vocal track generation
- ⏱️ Real-time status polling
- 🎧 Built-in audio playback
- 💾 Download generated tracks

## Quick Start

### Prerequisites

- Python 3.8+
- Suno API key from [sunoapi.org](https://sunoapi.org/api-key)
- ngrok (for local development)
- Modern web browser

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your Suno API key
# SUNO_API_KEY=your_actual_api_key_here
```

### 2. Start Backend with ngrok

**Terminal 1** - Start the backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2** - Start ngrok:
```bash
ngrok http 8000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update your `backend/.env`:
```env
PUBLIC_BASE_URL=https://abc123.ngrok.io
```

Restart the backend to apply the new URL.

### 3. Setup Frontend

Update `frontend/js/api.js` with your ngrok URL:
```javascript
let API_BASE_URL = 'https://abc123.ngrok.io';
```

### 4. Run Frontend

Open `frontend/index.html` in your browser, or serve it with a simple HTTP server:

```bash
cd frontend
python3 -m http.server 8080
# or
npx serve .
```

Then open http://localhost:8080 in your browser.

### 5. Use the Application

1. Upload an MP3 file (drag-and-drop or click to browse)
2. Enter a style description (e.g., "Classical piano music")
3. Adjust advanced settings if desired
4. Click "Generate Music"
5. Wait for the generation to complete (status updates every 5 seconds)
6. Listen to and download your generated tracks!

## Project Structure

```
.
├── frontend/              # Web frontend
│   ├── index.html        # Main HTML file
│   ├── js/
│   │   ├── main.js       # Application logic
│   │   ├── api.js        # Backend communication
│   │   └── utils.js      # Utility functions
│   ├── css/
│   │   └── styles.css    # Custom styles
│   └── README.md         # Frontend documentation
├── backend/              # FastAPI backend
│   ├── main.py          # Main application
│   ├── requirements.txt # Python dependencies
│   ├── .env.example     # Environment template
│   └── README.md        # Backend documentation
├── docs/                # Suno API documentation
│   └── *.md            # API endpoint references
├── CLAUDE.md           # Development guide for Claude Code
└── README.md           # This file
```

## Technology Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

### Backend
- FastAPI (Python web framework)
- httpx (async HTTP client)
- Pydantic (data validation)
- uvicorn (ASGI server)

### External Services
- Suno API (AI music generation)
- ngrok (public URL tunneling for local development)

## API Models

Choose from different AI models for generation:

- **V3_5**: Better song structure, up to 4 minutes
- **V4**: Improved vocals, up to 4 minutes
- **V4_5**: Smart prompts, faster generation, up to 8 minutes
- **V4_5PLUS**: Richer tones, most advanced, up to 8 minutes
- **V5**: Latest model with enhanced capabilities (default)

## Configuration Parameters

- **Weirdness Constraint** (0-1): Controls creative deviation and novelty
- **Style Weight** (0-1): Weight of the provided style guidance
- **Audio Weight** (0-1): Weight of the input audio influence
- **Instrumental**: Toggle between instrumental and vocal generation

## Important Notes

### File Requirements
- MP3 format only
- Maximum file size: 10MB
- Maximum duration: ~2 minutes
- File must be accessible via public URL for Suno API

### ngrok Requirement
The Suno API needs to download your uploaded MP3 file from a public URL. For local development, you MUST use ngrok or a similar tunneling service. Without a public URL, the generation will fail.

### API Credits
The Suno API uses a credit-based system. Each generation consumes credits. Monitor your usage at [sunoapi.org](https://sunoapi.org).

## Troubleshooting

### Backend won't start
- Verify Python 3.8+ is installed
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that `.env` file exists and contains valid configuration

### Generation fails
- Verify Suno API key is correct
- Check that PUBLIC_BASE_URL in `.env` matches your ngrok URL
- Ensure ngrok tunnel is active
- Verify you have sufficient API credits

### Frontend can't connect to backend
- Check that backend is running
- Verify `API_BASE_URL` in `frontend/js/api.js` matches your ngrok URL
- Check browser console for CORS errors

### File upload fails
- Ensure file is MP3 format
- Check file size is under 10MB
- Verify file duration is under 2 minutes

## Development

### Testing API Endpoints

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Project Guidelines

See `projekti_juhend.md` for academic project requirements and guidelines (in Estonian).

See `CLAUDE.md` for detailed development documentation.

## Security

- Never commit `.env` files
- Keep your Suno API key secure
- Don't share your ngrok URLs publicly
- In production, configure specific CORS origins

## Credits

- Suno API for AI music generation capabilities
- Tartu Ülikool for the project framework

## License

Academic project - Tartu Ülikool Programming Course

## Authors

[Add your names here]

---

For more detailed information, see:
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [Development Guide](CLAUDE.md)
