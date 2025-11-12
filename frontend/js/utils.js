/**
 * Utility functions for the music generation frontend
 * 
 * This module provides helper functions for file validation,
 * formatting, and UI updates.
 */

/**
 * Validates if a file is a valid MP3 file
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateMP3File(file) {
    // Check if file exists
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3'];
    const validExtensions = ['.mp3'];
    const fileName = file.name.toLowerCase();
    
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = validTypes.includes(file.type);

    if (!hasValidExtension && !hasValidType) {
        return { valid: false, error: 'Please upload a valid MP3 file' };
    }

    // Check file size (rough estimate: 2 minutes at 128kbps = ~2MB)
    // We'll allow up to 10MB as a safety margin
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 10MB. Please upload a smaller file.' };
    }

    return { valid: true, error: null };
}

/**
 * Formats file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formats duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration (MM:SS)
 */
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Shows an error message in the UI
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 10000);
    }
}

/**
 * Hides the error message
 */
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

/**
 * Shows the loading state
 * @param {string} message - Optional status message
 */
function showLoading(message = '') {
    const loadingDiv = document.getElementById('loadingState');
    const statusMessage = document.getElementById('statusMessage');
    
    if (loadingDiv) {
        loadingDiv.classList.remove('hidden');
    }
    
    if (statusMessage && message) {
        statusMessage.textContent = message;
    }
}

/**
 * Hides the loading state
 */
function hideLoading() {
    const loadingDiv = document.getElementById('loadingState');
    if (loadingDiv) {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Resets the form to initial state
 */
function resetForm() {
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const fileInfo = document.getElementById('fileInfo');
    
    if (fileInput) fileInput.value = '';
    if (dropZoneContent) dropZoneContent.classList.remove('hidden');
    if (fileInfo) fileInfo.classList.add('hidden');
    
    // Reset prompt
    const stylePrompt = document.getElementById('stylePrompt');
    if (stylePrompt) stylePrompt.value = '';
    
    // Reset settings to defaults
    const weirdnessConstraint = document.getElementById('weirdnessConstraint');
    const styleWeight = document.getElementById('styleWeight');
    const audioWeight = document.getElementById('audioWeight');
    const modelSelect = document.getElementById('modelSelect');
    const instrumentalToggle = document.getElementById('instrumentalToggle');
    
    if (weirdnessConstraint) weirdnessConstraint.value = '0.65';
    if (styleWeight) styleWeight.value = '0.65';
    if (audioWeight) audioWeight.value = '0.65';
    if (modelSelect) modelSelect.value = 'V3_5';
    if (instrumentalToggle) instrumentalToggle.checked = true;
    
    // Update displayed values
    updateSliderValues();
    
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('hidden');
    
    // Hide loading and errors
    hideLoading();
    hideError();
}

