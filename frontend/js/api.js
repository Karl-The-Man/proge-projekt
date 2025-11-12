/**
 * API suhtlusmoodul backendiga integreerimiseks
 * 
 * See moodul haldab kogu suhtlust FastAPI backendiga.
 * Seadista `API_BASE_URL` väärtus oma ngrok URL-ile.
 * Autor: Oliver Iida
 * Kuupäev: 12.11.2025
 */

// You can also set this via localStorage or update it programmatically
let API_BASE_URL = localStorage.getItem('apiBaseUrl') || 'https://vibracular-harvey-nonfertile.ngrok-free.dev';

/**
 * Uploads a file and starts music generation
 * @param {File} file - The MP3 file to upload
 * @param {string} prompt - Style description prompt
 * @param {Object} settings - Generation settings
 * @returns {Promise<Object>} - Response with taskId
 */
async function uploadAndGenerate(file, prompt, settings) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('weirdnessConstraint', settings.weirdnessConstraint);
    formData.append('styleWeight', settings.styleWeight);
    formData.append('audioWeight', settings.audioWeight);
    formData.append('model', settings.model);
    formData.append('instrumental', settings.instrumental);

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload-cover`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
            throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

/**
 * Polls the backend for generation status
 * @param {string} taskId - The task ID returned from upload
 * @returns {Promise<Object>} - Status response
 */
async function pollGenerationStatus(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generation-status/${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
            throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Polling error:', error);
        throw error;
    }
}

/**
 * Gets detailed generation information
 * @param {string} taskId - The task ID
 * @returns {Promise<Object>} - Detailed generation data
 */
async function getGenerationDetails(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generation-details/${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
            throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get details error:', error);
        throw error;
    }
}

/**
 * Sets the API base URL (useful for ngrok configuration)
 * @param {string} url - The base URL for the API
 */
function setApiBaseUrl(url) {
    API_BASE_URL = url;
    localStorage.setItem('apiBaseUrl', url);
    console.log('API Base URL updated to:', url);
}

