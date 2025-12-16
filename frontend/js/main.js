/**
 * Peamine rakendusloogika muusika genereerimise frontendis
 * 
 * See moodul haldab UI interaktsioone, waveforme, faili üleslaadimisi, vormihaldust
 * ning koordineerib UI ja API moodulite vahel.
 * Autor: Elias Teikari, Oliver Iida
 * Kuupäev: 12.11.2025, 16.12.2025
 */

// Application state
let selectedFile = null;
let currentTaskId = null;
let pollingInterval = null;
let wavesurfer = null;

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
            const waveformContainer = document.getElementById('waveformContainer');
            
            if (dropZoneContent) dropZoneContent.classList.remove('hidden');
            if (fileInfo) fileInfo.classList.add('hidden');
            if (fileInput) fileInput.value = '';
            
            // Destroy waveform and hide container when user removes the file
            if (wavesurfer) {
                wavesurfer.destroy();
                wavesurfer = null;
            }
            if (waveformContainer) waveformContainer.classList.add('hidden');
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
    const audioWeightSlider = document.getElementById('audioWeight');

    if (weirdnessSlider) {
        weirdnessSlider.addEventListener('input', updateSliderValues);
    }

    if (styleWeightSlider) {
        styleWeightSlider.addEventListener('input', updateSliderValues);
    }

    if (audioWeightSlider) {
        audioWeightSlider.addEventListener('input', updateSliderValues);
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
    const audioWeightSlider = document.getElementById('audioWeight');
    const weirdnessValue = document.getElementById('weirdnessValue');
    const styleWeightValue = document.getElementById('styleWeightValue');
    const audioWeightValue = document.getElementById('audioWeightValue');

    if (weirdnessSlider && weirdnessValue) {
        weirdnessValue.textContent = parseFloat(weirdnessSlider.value).toFixed(2);
    }

    if (styleWeightSlider && styleWeightValue) {
        styleWeightValue.textContent = parseFloat(styleWeightSlider.value).toFixed(2);
    }

    if (audioWeightSlider && audioWeightValue) {
        audioWeightValue.textContent = parseFloat(audioWeightSlider.value).toFixed(2);
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

    // Initialize waveform
    initWaveform(file);
}

/**
 * Initialize WaveSurfer waveform visualization
 */
function initWaveform(file) {
    const waveformContainer = document.getElementById('waveformContainer');
    
    // Destroy existing instance if any
    if (wavesurfer) {
        wavesurfer.destroy();
        wavesurfer = null;
    }

    // Create WaveSurfer instance
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#93c5fd',
        progressColor: '#2563eb',
        cursorWidth: 0,
        barWidth: 3,
        barGap: 1,
        barRadius: 3,
        height: 80,
        responsive: true,
        normalize: true,
        backend: 'WebAudio'
    });

    // Create object URL from file and load it
    const objectUrl = URL.createObjectURL(file);
    wavesurfer.load(objectUrl);

    // Show waveform container
    if (waveformContainer) {
        waveformContainer.classList.remove('hidden');
    }

    // Set up event listeners
    setupWaveformControls();

    // Handle ready event
    wavesurfer.on('ready', () => {
        const totalDuration = document.getElementById('totalDuration');
        if (totalDuration) {
            totalDuration.textContent = formatWaveformTime(wavesurfer.getDuration());
        }
    });

    // Handle time update
    wavesurfer.on('audioprocess', () => {
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            currentTime.textContent = formatWaveformTime(wavesurfer.getCurrentTime());
        }
    });

    // Handle seek
    wavesurfer.on('seeking', () => {
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            currentTime.textContent = formatWaveformTime(wavesurfer.getCurrentTime());
        }
    });

    // Handle play/pause state changes
    wavesurfer.on('play', () => {
        updatePlayPauseButton(true);
    });

    wavesurfer.on('pause', () => {
        updatePlayPauseButton(false);
    });

    wavesurfer.on('finish', () => {
        updatePlayPauseButton(false);
    });
}

/**
 * Set up waveform playback controls
 */
function setupWaveformControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    if (playPauseBtn) {
        // Remove existing listeners by cloning
        const newBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newBtn, playPauseBtn);
        
        newBtn.addEventListener('click', () => {
            if (wavesurfer) {
                wavesurfer.playPause();
            }
        });
    }

    if (volumeSlider) {
        // Remove existing listeners by cloning
        const newSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newSlider, volumeSlider);
        
        newSlider.addEventListener('input', (e) => {
            if (wavesurfer) {
                wavesurfer.setVolume(parseFloat(e.target.value));
            }
        });
    }
}

/**
 * Update play/pause button icons
 */
function updatePlayPauseButton(isPlaying) {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');

    if (isPlaying) {
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
    } else {
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
    }
}

/**
 * Format time for waveform display (mm:ss)
 */
function formatWaveformTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    const audioWeight = document.getElementById('audioWeight');
    const modelSelect = document.getElementById('modelSelect');
    const instrumentalToggle = document.getElementById('instrumentalToggle');

    const settings = {
        weirdnessConstraint: weirdnessConstraint ? parseFloat(weirdnessConstraint.value) : 0.65,
        styleWeight: styleWeight ? parseFloat(styleWeight.value) : 0.65,
        audioWeight: audioWeight ? parseFloat(audioWeight.value) : 0.65,
        model: modelSelect ? modelSelect.value : 'V5',
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
 * Download audio file from URL
 * Fetches the file as a blob to bypass cross-origin download restrictions
 */
async function downloadAudio(url, filename) {
    try {
        // Show downloading state
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Downloading...';
        btn.disabled = true;

        // Fetch the audio file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // Convert to blob
        const blob = await response.blob();

        // Create download link
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);

        // Reset button
        btn.textContent = originalText;
        btn.disabled = false;

    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download file. Please try right-clicking the audio player and selecting "Save audio as..."');
        
        // Reset button if it exists
        if (event && event.target) {
            event.target.textContent = 'Download';
            event.target.disabled = false;
        }
    }
}

/**
 * Create a track card element with waveform visualization
 */
function createTrackCard(track, trackNumber) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-6';

    const audioUrl = track.audioUrl || track.audio_url;
    const title = track.title || `Track ${trackNumber}`;
    const duration = track.duration || 0;
    const tags = track.tags || '';
    const modelName = track.modelName || track.model_name || 'Unknown';
    const safeFilename = title.replace(/[^a-z0-9]/gi, '_') + '.mp3';
    const waveformId = `waveform-track-${trackNumber}`;
    const playBtnId = `playBtn-track-${trackNumber}`;
    const playIconId = `playIcon-track-${trackNumber}`;
    const pauseIconId = `pauseIcon-track-${trackNumber}`;
    const currentTimeId = `currentTime-track-${trackNumber}`;
    const totalDurationId = `totalDuration-track-${trackNumber}`;
    const volumeSliderId = `volumeSlider-track-${trackNumber}`;

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
                    <button onclick="downloadAudio('${audioUrl}', '${safeFilename}')"
                       class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer">
                        Download
                    </button>
                ` : ''}
            </div>
        </div>
        ${audioUrl ? `
            <!-- Waveform Container -->
            <div class="mt-4">
                <div id="${waveformId}" class="w-full"></div>
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-3">
                        <button id="${playBtnId}" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all">
                            <svg id="${playIconId}" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg id="${pauseIconId}" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                            </svg>
                        </button>
                        <span id="${currentTimeId}" class="text-gray-700 text-sm font-mono">0:00</span>
                        <span class="text-gray-400 text-sm">/</span>
                        <span id="${totalDurationId}" class="text-gray-700 text-sm font-mono">0:00</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                        <input type="range" id="${volumeSliderId}" min="0" max="1" step="0.1" value="1" 
                            class="w-20 h-1 rounded-lg appearance-none cursor-pointer">
                    </div>
                </div>
            </div>
        ` : '<p class="text-red-600">Audio URL not available</p>'}
    `;

    // Initialize waveform after card is added to DOM
    if (audioUrl) {
        setTimeout(() => {
            initTrackWaveform(audioUrl, waveformId, playBtnId, playIconId, pauseIconId, currentTimeId, totalDurationId, volumeSliderId);
        }, 100);
    }

    return card;
}

/**
 * Initialize WaveSurfer waveform for a generated track
 */
function initTrackWaveform(audioUrl, waveformId, playBtnId, playIconId, pauseIconId, currentTimeId, totalDurationId, volumeSliderId) {
    const waveformContainer = document.getElementById(waveformId);
    if (!waveformContainer) return;

    // Create WaveSurfer instance for this track
    const trackWavesurfer = WaveSurfer.create({
        container: `#${waveformId}`,
        waveColor: '#93c5fd',
        progressColor: '#2563eb',
        cursorWidth: 0,
        barWidth: 3,
        barGap: 1,
        barRadius: 3,
        height: 80,
        responsive: true,
        normalize: true,
        backend: 'WebAudio'
    });

    // Load audio from URL
    trackWavesurfer.load(audioUrl);

    // Set up play/pause button
    const playBtn = document.getElementById(playBtnId);
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            trackWavesurfer.playPause();
        });
    }

    // Set up volume slider
    const volumeSlider = document.getElementById(volumeSliderId);
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            trackWavesurfer.setVolume(parseFloat(e.target.value));
        });
    }

    // Handle ready event
    trackWavesurfer.on('ready', () => {
        const totalDuration = document.getElementById(totalDurationId);
        if (totalDuration) {
            totalDuration.textContent = formatWaveformTime(trackWavesurfer.getDuration());
        }
    });

    // Handle time update
    trackWavesurfer.on('audioprocess', () => {
        const currentTime = document.getElementById(currentTimeId);
        if (currentTime) {
            currentTime.textContent = formatWaveformTime(trackWavesurfer.getCurrentTime());
        }
    });

    // Handle seek
    trackWavesurfer.on('seeking', () => {
        const currentTime = document.getElementById(currentTimeId);
        if (currentTime) {
            currentTime.textContent = formatWaveformTime(trackWavesurfer.getCurrentTime());
        }
    });

    // Handle play/pause state changes
    trackWavesurfer.on('play', () => {
        const playIcon = document.getElementById(playIconId);
        const pauseIcon = document.getElementById(pauseIconId);
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
    });

    trackWavesurfer.on('pause', () => {
        const playIcon = document.getElementById(playIconId);
        const pauseIcon = document.getElementById(pauseIconId);
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
    });

    trackWavesurfer.on('finish', () => {
        const playIcon = document.getElementById(playIconId);
        const pauseIcon = document.getElementById(pauseIconId);
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
    });
}

// Initialize application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

