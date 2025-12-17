"""
FastAPI Backend Suno muusika genereerimiseks

See taustateenus integreerub Suno API-ga, et pakkuda tehisintellektil põhinevat muusika loomist.
See toimib vahendajana (proksina) esiosa (frontendi) ja Suno API vahel, tegeledes failide üleslaadimise,
ülesannete jälgimise ja oleku päringutega. Lisasime projekti ka error handlerid ja health check endpoint.

Autorid: Oliver Iida, Karl Elmar Vikat, Elias Teikari
Kuupäev: 12.11.2025, 16.12.2025
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Configuration
class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    suno_api_key: str
    suno_api_base_url: str = "https://api.sunoapi.org"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    public_base_url: str = "http://localhost:8000"
    max_file_size_mb: int = 10
    upload_dir: str = "./uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Initialize settings
try:
    settings = Settings()
except Exception as e:
    print(f"Error loading settings: {e}")
    print("Please create a .env file based on .env.example")
    raise


# Ensure upload directory exists
UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(exist_ok=True)


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print(f"Starting Suno API Backend")
    print(f"Upload directory: {UPLOAD_DIR.absolute()}")
    print(f"Public base URL: {settings.public_base_url}")
    yield
    # Shutdown
    print("Shutting down Suno API Backend")


# Initialize FastAPI app
app = FastAPI(
    title="Suno Music Generation API",
    description="Backend proxy for Suno AI music generation",
    version="1.0.0",
    lifespan=lifespan
)


# CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# Response models
class TaskResponse(BaseModel):
    """Response model for task creation"""
    taskId: str


class StatusResponse(BaseModel):
    """Response model for status polling"""
    status: str
    data: Optional[dict] = None
    errorMessage: Optional[str] = None


class GenerationDetailsResponse(BaseModel):
    """Response model for generation details"""
    data: dict


# In-memory storage for callback results
callback_results: dict[str, dict] = {}


# Helper functions
def get_suno_headers() -> dict:
    """Get headers for Suno API requests"""
    return {
        "Authorization": f"Bearer {settings.suno_api_key}",
        "Content-Type": "application/json"
    }

def validate_file_size(file_size: int) -> None:
    """Validate uploaded file size"""
    max_size = settings.max_file_size_mb * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum of {settings.max_file_size_mb}MB"
        )


# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Suno Music Generation API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "upload": "POST /api/upload-cover",
            "status": "GET /api/generation-status/{taskId}",
            "details": "GET /api/generation-details/{taskId}"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/upload-cover", response_model=TaskResponse)
async def upload_and_cover(
    file: UploadFile = File(..., description="MP3 audio file to upload"),
    prompt: str = Form(..., description="Style description or lyrics"),
    weirdnessConstraint: float = Form(0.65, description="Creative deviation (0.00-1.00)"),
    styleWeight: float = Form(0.65, description="Style guidance weight (0.00-1.00)"),
    audioWeight: float = Form(0.65, description="Input audio influence (0.00-1.00)"),
    model: str = Form("V5", description="AI model version (V3_5, V4, V4_5, V4_5PLUS, V5)"),
    instrumental: bool = Form(True, description="Generate instrumental track")
):
    """
    Upload an MP3 file and start AI music generation using Suno API

    This endpoint:
    1. Saves the uploaded MP3 file locally
    2. Generates a public URL for the file
    3. Calls Suno API's upload-cover endpoint
    4. Returns the task ID for status polling
    """
    try:
        # Validate file type
        if not file.content_type or "audio" not in file.content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload an MP3 audio file"
            )

        # Validate file size
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        temp_path = UPLOAD_DIR / f"temp_{uuid.uuid4()}.mp3"

        with temp_path.open("wb") as buffer:
            while chunk := await file.read(chunk_size):
                file_size += len(chunk)
                validate_file_size(file_size)
                buffer.write(chunk)

        # Generate unique filename and move file
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        final_path = UPLOAD_DIR / unique_filename
        temp_path.rename(final_path)

        # Generate public URL
        upload_url = f"{settings.public_base_url}/uploads/{unique_filename}"

        print(f"File uploaded: {unique_filename}")
        print(f"Public URL: {upload_url}")

        # Build callback URL using public base URL
        callback_url = f"{settings.public_base_url}/api/suno-callback"

        # Prepare request to Suno API
        suno_payload = {
            "uploadUrl": upload_url,
            "prompt": prompt,
            "customMode": True,
            "instrumental": instrumental,
            "model": model,
            "weirdnessConstraint": weirdnessConstraint,
            "styleWeight": styleWeight,
            "audioWeight": audioWeight,
            "callBackUrl": callback_url
        }

        # Add optional style and title for custom mode
        if instrumental:
            # For instrumental, we can add a generic title
            suno_payload["style"] = prompt[:100] if len(prompt) > 100 else prompt
            suno_payload["title"] = f"AI Generated Track {uuid.uuid4().hex[:8]}"
        else:
            # For vocal tracks, use prompt as lyrics
            suno_payload["style"] = "AI Generated"
            suno_payload["title"] = f"AI Generated Song {uuid.uuid4().hex[:8]}"

        print(f"Sending request to Suno API with payload: {suno_payload}")

        # Call Suno API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.suno_api_base_url}/api/v1/generate/upload-cover",
                json=suno_payload,
                headers=get_suno_headers()
            )

            print(f"Suno API response status: {response.status_code}")
            print(f"Suno API response: {response.text}")

            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get("msg", "Unknown error from Suno API")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Suno API error: {error_msg}"
                )

            result = response.json()

            # Check the JSON response code (Suno API returns errors with HTTP 200)
            api_code = result.get("code")
            if api_code != 200:
                error_msg = result.get("msg", "Unknown error from Suno API")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Suno API error: {error_msg}"
                )

            # Extract task ID from response
            data = result.get("data")
            if not data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No data received from Suno API"
                )

            task_id = data.get("taskId")
            if not task_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No task ID received from Suno API"
                )

            return TaskResponse(taskId=task_id)

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error in upload_and_cover: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/suno-callback")
async def suno_callback(request_data: dict):
    try:
        print(f"Received Suno callback: {request_data}")

        code = request_data.get("code")
        msg = request_data.get("msg")
        data = request_data.get("data", {})

        task_id = data.get("task_id")
        callback_type = data.get("callbackType")

        if task_id:
            # Store the callback result for later retrieval
            callback_results[task_id] = {
                "code": code,
                "msg": msg,
                "callbackType": callback_type,
                "data": data.get("data"),
                "received_at": str(uuid.uuid4())  # Using UUID as timestamp marker
            }
            print(f"Stored callback result for task {task_id}: {callback_type}")

        return {"status": "received"}

    except Exception as e:
        print(f"Error in suno_callback: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.get("/api/generation-status/{task_id}")
async def get_generation_status(task_id: str):
    """
    Poll the status of a music generation task

    Args:
        task_id: The task ID returned from upload-cover endpoint

    Returns:
        Status information including current state and any errors
    """
    try:
        # First check if we have callback results for this task
        if task_id in callback_results:
            callback = callback_results[task_id]
            callback_type = callback.get("callbackType")

            if callback_type == "complete":
                return {
                    "status": "SUCCESS",
                    "data": {"callbackData": callback.get("data")},
                    "errorMessage": None
                }
            elif callback_type == "error":
                return {
                    "status": "FAILED",
                    "data": None,
                    "errorMessage": callback.get("msg", "Generation failed")
                }

        # Call Suno API to get task info
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{settings.suno_api_base_url}/api/v1/generate/record-info",
                params={"taskId": task_id},
                headers=get_suno_headers()
            )

            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get("msg", "Unknown error from Suno API")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Suno API error: {error_msg}"
                )

            result = response.json()

            # Extract status from response
            data = result.get("data", {})
            task_status = data.get("status", "UNKNOWN")
            error_message = data.get("errorMessage")

            return {
                "status": task_status,
                "data": data,
                "errorMessage": error_message
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_generation_status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/generation-details/{task_id}")
async def get_generation_details(task_id: str):
    """
    Get detailed information about a completed generation task

    Args:
        task_id: The task ID returned from upload-cover endpoint

    Returns:
        Detailed generation data including audio URLs and metadata
    """
    try:
        # Call Suno API to get task details
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{settings.suno_api_base_url}/api/v1/generate/record-info",
                params={"taskId": task_id},
                headers=get_suno_headers()
            )

            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get("msg", "Unknown error from Suno API")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Suno API error: {error_msg}"
                )

            result = response.json()

            # Return the full data structure expected by frontend
            return {
                "data": result.get("data", {})
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_generation_details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"msg": "Endpoint not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={"msg": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True
    )
