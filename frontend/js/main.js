/**
 * Main application logic for music generation frontend
 * 
 * This module handles UI interactions, file uploads, form management,
 * and coordinates between the UI and API modules.
 */

// Application state
let selectedFile = null;
let currentTaskId = null;
let pollingInterval = null;

/**
 * Initialize the application
 */
function init() {
    setupEventListeners();
    updateSliderValues();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // File upload - drag and drop
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const removeFileBtn = document.getElementById('removeFile');

    if (dropZone) {
        // Click to browse
        dropZone.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });

        // Drag and drop events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files[0]);
        });
    }

    // Remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFile = null;
            const dropZoneContent = document.getElementById('dropZoneContent');
            const fileInfo = document.getElementById('fileInfo');
            
            if (dropZoneContent) dropZoneContent.classList.remove('hidden');
            if (fileInfo) fileInfo.classList.add('hidden');
            if (fileInput) fileInput.value = '';
        });
    }

    // Settings toggle
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsIcon = document.getElementById('settingsIcon');

    if (settingsToggle && settingsPanel && settingsIcon) {
        settingsToggle.addEventListener('click', () => {
            const isHidden = settingsPanel.classList.contains('hidden');
            if (isHidden) {
                settingsPanel.classList.remove('hidden');
                settingsIcon.classList.add('rotate-180');
            } else {
                settingsPanel.classList.add('hidden');
                settingsIcon.classList.remove('rotate-180');
            }
        });
    }

    // Slider value updates
    const weirdnessSlider = document.getElementById('weirdnessConstraint');
    const styleWeightSlider = document.getElementById('styleWeight');

    if (weirdnessSlider) {
        weirdnessSlider.addEventListener('input', updateSliderValues);
    }

    if (styleWeightSlider) {
        styleWeightSlider.addEventListener('input', updateSliderValues);
    }

    // Generate button
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.addEventListener('click', handleGenerate);
    }
}

/**
 * Update slider value displays
 */
function updateSliderValues() {
    const weirdnessSlider = document.getElementById('weirdnessConstraint');
    const styleWeightSlider = document.getElementById('styleWeight');
    const weirdnessValue = document.getElementById('weirdnessValue');
    const styleWeightValue = document.getElementById('styleWeightValue');

    if (weirdnessSlider && weirdnessValue) {
        weirdnessValue.textContent = parseFloat(weirdnessSlider.value).toFixed(2);
    }

    if (styleWeightSlider && styleWeightValue) {
        styleWeightValue.textContent = parseFloat(styleWeightSlider.value).toFixed(2);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    }
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    }
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    // Validate file
    const validation = validateMP3File(file);
    if (!validation.valid) {
        showError(validation.error);
        return;
    }

    selectedFile = file;
    hideError();

    // Update UI
    const dropZoneContent = document.getElementById('dropZoneContent');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    if (dropZoneContent) dropZoneContent.classList.add('hidden');
    if (fileInfo) fileInfo.classList.remove('hidden');
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatFileSize(file.size);
}

/**
 * Handle generate button click
 */
async function handleGenerate() {
    // Validate inputs
    if (!selectedFile) {
        showError('Please select an MP3 file to upload');
        return;
    }

    const stylePrompt = document.getElementById('stylePrompt');
    const prompt = stylePrompt ? stylePrompt.value.trim() : '';
    
    if (!prompt) {
        showError('Please enter a style description');
        return;
    }

    // Get settings
    const weirdnessConstraint = document.getElementById('weirdnessConstraint');
    const styleWeight = document.getElementById('styleWeight');
    const modelSelect = document.getElementById('modelSelect');
    const instrumentalToggle = document.getElementById('instrumentalToggle');

    const settings = {
        weirdnessConstraint: weirdnessConstraint ? parseFloat(weirdnessConstraint.value) : 0.65,
        styleWeight: styleWeight ? parseFloat(styleWeight.value) : 0.65,
        model: modelSelect ? modelSelect.value : 'V3_5',
        instrumental: instrumentalToggle ? instrumentalToggle.checked : true
    };

    // Disable generate button
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
    }

    // Hide previous results and errors
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('hidden');
    hideError();

    // Show loading state
    showLoading('Starting generation...');

    try {
        // Upload and start generation
        const response = await uploadAndGenerate(selectedFile, prompt, settings);
        currentTaskId = response.taskId;

        if (!currentTaskId) {
            throw new Error('No task ID received from server');
        }

        // Start polling for status
        startPolling(currentTaskId);

    } catch (error) {
        console.error('Generation error:', error);
        showError(error.message || 'Failed to start generation. Please try again.');
        hideLoading();
        
        // Re-enable generate button
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Music';
        }
    }
}

/**
 * Start polling for generation status
 */
function startPolling(taskId) {
    // Clear any existing polling
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Poll every 5 seconds
    pollingInterval = setInterval(async () => {
        try {
            const statusResponse = await pollGenerationStatus(taskId);
            const status = statusResponse.status || statusResponse.data?.status;

            // Update status message
            const statusMessage = document.getElementById('statusMessage');
            if (statusMessage) {
                statusMessage.textContent = `Status: ${status || 'Processing...'}`;
            }

            // Check if generation is complete
            if (status === 'SUCCESS' || status === 'COMPLETE') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                
                // Get final details and display results
                await displayResults(taskId);
            } else if (status === 'FAILED' || status === 'ERROR' || status === 'CREATE_TASK_FAILED' || status === 'GENERATE_AUDIO_FAILED') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                
                const errorMsg = statusResponse.errorMessage || statusResponse.msg || 'Generation failed';
                showError(errorMsg);
                hideLoading();
                
                // Re-enable generate button
                const generateButton = document.getElementById('generateButton');
                if (generateButton) {
                    generateButton.disabled = false;
                    generateButton.textContent = 'Generate Music';
                }
            }
        } catch (error) {
            console.error('Polling error:', error);
            // Continue polling on error (might be temporary network issue)
        }
    }, 5000);
}

/**
 * Display generation results
 */
async function displayResults(taskId) {
    try {
        // Get generation details
        const details = await getGenerationDetails(taskId);
        
        // Extract tracks from response
        // The response structure may vary, so we handle different formats
        let tracks = [];
        
        if (details.data?.response?.sunoData) {
            tracks = details.data.response.sunoData;
        } else if (details.data?.sunoData) {
            tracks = details.data.sunoData;
        } else if (Array.isArray(details.data)) {
            tracks = details.data;
        }

        if (tracks.length === 0) {
            throw new Error('No tracks found in response');
        }

        // Hide loading
        hideLoading();

        // Display tracks
        const resultsSection = document.getElementById('resultsSection');
        const tracksContainer = document.getElementById('tracksContainer');

        if (resultsSection) resultsSection.classList.remove('hidden');
        if (tracksContainer) {
            tracksContainer.innerHTML = '';
            
            tracks.forEach((track, index) => {
                const trackCard = createTrackCard(track, index + 1);
                tracksContainer.appendChild(trackCard);
            });
        }

        // Re-enable generate button
        const generateButton = document.getElementById('generateButton');
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Music';
        }

    } catch (error) {
        console.error('Display results error:', error);
        showError(error.message || 'Failed to retrieve results');
        hideLoading();
        
        // Re-enable generate button
        const generateButton = document.getElementById('generateButton');
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Music';
        }
    }
}

/**
 * Create a track card element
 */
function createTrackCard(track, trackNumber) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-6';

    const audioUrl = track.audioUrl || track.audio_url;
    const title = track.title || `Track ${trackNumber}`;
    const duration = track.duration || 0;
    const tags = track.tags || '';
    const modelName = track.modelName || track.model_name || 'Unknown';

    card.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div class="mb-4 md:mb-0">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">${title}</h3>
                <div class="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>Duration: ${formatDuration(duration)}</span>
                    <span>•</span>
                    <span>Model: ${modelName}</span>
                    ${tags ? `<span>•</span><span>Tags: ${tags}</span>` : ''}
                </div>
            </div>
            <div class="flex gap-2">
                ${audioUrl ? `
                    <a href="${audioUrl}" download="${title.replace(/[^a-z0-9]/gi, '_')}.mp3" 
                       class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Download
                    </a>
                ` : ''}
            </div>
        </div>
        ${audioUrl ? `
            <audio controls class="w-full mt-4">
                <source src="${audioUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        ` : '<p class="text-red-600">Audio URL not available</p>'}
    `;

    return card;
}

// Initialize application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

