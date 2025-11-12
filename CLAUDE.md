# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a university programming project (Tartu Ülikool) that integrates with the Suno API to provide AI-powered music generation. The project consists of a frontend web application that allows users to upload MP3 files and transform them using AI music generation with customizable style parameters.

**Project Type:** Academic project (pair programming assignment)
**Technology Stack:** Vanilla JavaScript frontend + FastAPI backend (planned)
**Primary API:** Suno API for AI music generation

## Architecture

### Frontend (Completed)
Located in `frontend/` directory. A vanilla JavaScript web application with no framework dependencies.

**Module Structure:**
- `js/main.js` - Core application logic, event handling, UI state management, and result display
- `js/api.js` - Backend communication layer (upload, polling, status retrieval)
- `js/utils.js` - Utility functions (file validation, formatting, error/loading UI helpers)
- `index.html` - Main HTML structure with Tailwind CSS via CDN
- `css/styles.css` - Custom CSS styles

**Key Features:**
- Drag-and-drop MP3 file upload (max 10MB, must be < 2 minutes)
- Style prompt input for AI generation
- Advanced settings panel with sliders for:
  - Weirdness Constraint (0-1, default 0.65)
  - Style Weight (0-1, default 0.65)
  - Audio Weight (0-1, default 0.65)
  - Model selection (V3_5, V4, V4_5, V4_5PLUS, V5 - default V5)
  - Instrumental toggle (default ON)
- Status polling every 5 seconds until completion
- Audio playback and download for generated tracks

**State Management:**
The application uses module-level variables in `main.js`:
- `selectedFile` - Current uploaded file
- `currentTaskId` - Active generation task ID
- `pollingInterval` - Interval ID for status polling

### Backend (FastAPI)
Located in `backend/` directory. A FastAPI application that acts as a proxy between the frontend and Suno API.

**Main Components:**
- `main.py` - FastAPI application with all endpoints and Suno API integration
- `requirements.txt` - Python dependencies (FastAPI, httpx, uvicorn, etc.)
- `.env` - Environment configuration (not in git, created from `.env.example`)
- `uploads/` - Directory for temporarily storing uploaded MP3 files

**Endpoints:**
1. `POST /api/upload-cover` - Accepts FormData with file + parameters, saves file locally, generates public URL, calls Suno API, returns `{ taskId: string }`
2. `GET /api/generation-status/{taskId}` - Polls Suno API and returns status object with `status` field (PENDING/SUCCESS/FAILED/etc.)
3. `GET /api/generation-details/{taskId}` - Retrieves detailed results from Suno API with `data.response.sunoData` array containing audio URLs
4. `GET /health` - Health check endpoint
5. `GET /uploads/{filename}` - Static file serving for uploaded MP3s (required for Suno API to access files)

**Integration Pattern:**
The backend acts as a proxy/wrapper around the Suno API (https://api.sunoapi.org) to:
- Accept file uploads from frontend and store them locally
- Generate public URLs for uploaded files (Suno API needs to download them)
- Forward requests to Suno API with proper authentication
- Track task status by polling Suno API endpoints
- Transform responses to match frontend expectations

## Development Commands

### Frontend Development
```bash
# Serve the frontend (any simple HTTP server works)
cd frontend
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080` in a browser.

### Backend Development

**Setup:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your SUNO_API_KEY
```

**Run locally:**
```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

**Run with ngrok (required for Suno API integration):**
```bash
# Terminal 1: Start backend
python main.py

# Terminal 2: Start ngrok
ngrok http 8000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update .env: PUBLIC_BASE_URL=https://abc123.ngrok.io
# Restart the backend
```

**Important:** The backend MUST be accessible via a public URL for Suno API to download uploaded files. Use ngrok for local development or deploy to a server with a public domain.

### API Configuration
Update `frontend/js/api.js` to point to the backend:
```javascript
let API_BASE_URL = 'http://localhost:8000';
// or for ngrok: 'https://your-id.ngrok.io'
```

Alternatively, set via browser console:
```javascript
setApiBaseUrl('https://your-ngrok-url.com');
```

## Suno API Integration

The project uses Suno API's "Upload and Cover Audio" endpoint. Key details:

**API Base URL:** `https://api.sunoapi.org`
**Authentication:** Bearer token in Authorization header
**Endpoint:** `POST /api/v1/generate/upload-cover`

**Parameter Mapping (Frontend → Suno API):**
- `uploadUrl` - Backend-generated upload URL for the MP3 file
- `prompt` - Style description from user (used as lyrics or generation idea)
- `styleWeight` - Style influence weight (0.00-1.00)
- `weirdnessConstraint` - Creative deviation control (0.00-1.00)
- `audioWeight` - Input audio influence (0.00-1.00)
- `model` - AI model version (V3_5, V4, V4_5, V4_5PLUS, V5)
- `instrumental` - Boolean for vocal/instrumental generation
- `customMode` - Should be `true` for this use case
- `callBackUrl` - Optional webhook URL for completion notifications

**Models:**
- V3_5: Better song structure, up to 4 minutes
- V4: Improved vocals, up to 4 minutes
- V4_5: Smart prompts, faster, up to 8 minutes
- V4_5PLUS: Richer tones, most advanced, up to 8 minutes
- V5: Latest model (currently default)

**Response Structure:**
The Suno API returns a taskId for async processing. The frontend expects:
```json
{
  "data": {
    "response": {
      "sunoData": [
        {
          "audioUrl": "https://...",
          "title": "Track Title",
          "duration": 180,
          "tags": "style tags",
          "modelName": "V5"
        }
      ]
    }
  }
}
```

## Code Style Guidelines

**From projekti_juhend.md:**
- File headers must include: project topic, authors, sources, and other important info
- Use docstrings (PEP 257) for function documentation
- Variable naming: lowercase with underscores (snake_case) or camelCase (JavaScript)
- Comment for clarity, not every line
- File order: imports, functions, main program
- Wrap main logic in a `main()` function where applicable

**Current Frontend Style:**
- Already follows JSDoc comments for functions
- Uses camelCase for JavaScript (standard convention)
- Modular separation: API, UI logic, and utilities are cleanly separated
- Event-driven architecture with clear event handler naming

## Important Notes

1. **File Size Limit:** MP3 files must not exceed 2 minutes in length per Suno API requirements. Frontend enforces 10MB max file size as a safety check.

2. **API Authentication:** The backend must handle Suno API key storage securely. Never expose the API key in frontend code.

3. **Status Polling:** Frontend polls every 5 seconds. Backend should implement rate limiting if necessary.

4. **Error Handling:** Frontend displays errors for 10 seconds with auto-hide. Common error statuses from Suno API:
   - CREATE_TASK_FAILED
   - GENERATE_AUDIO_FAILED
   - Check `errorMessage` or `msg` fields in responses

5. **Academic Context:** This is a pair programming project for a university course. The project must demonstrate original work and appropriate use of libraries not covered in the main course curriculum.

## Project Documentation

- `projekti_juhend.md` - Project assignment guidelines (in Estonian)
- `frontend/README.md` - Frontend-specific documentation
- `docs/` - Suno API documentation and endpoint references
