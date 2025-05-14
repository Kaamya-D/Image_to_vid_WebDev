// Global variables
let imageSettings = []; // Store image settings
let selectedImageIndex = -1; // Currently selected image index
let slideshowInterval; // Interval for slideshow
let isPlaying = false; // Slideshow play state
let backgroundMusic = null; // Audio object for background music
let loopPlayback = true; // Control whether playback should loop
let playbackComplete = false; // Track if playback has completed one full cycle

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for file inputs
    document.getElementById('image-upload').addEventListener('change', function() {
        previewImages();
    });
    
    document.getElementById('background-music').addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
        document.getElementById('music-file-name').textContent = fileName;
    });
    
    // Add loop toggle to the preview controls
    addLoopToggle();
    
    // Initialize create video button
    document.getElementById('create-video-btn').addEventListener('click', createVideo);
});

// Add loop toggle to the controls
function addLoopToggle() {
    const controlButtons = document.querySelector('.control-buttons');
    const loopToggle = document.createElement('div');
    loopToggle.className = 'loop-toggle';
    loopToggle.innerHTML = `
        <button class="control-btn" id="loop-btn" title="Toggle Loop">
            <i class="fas fa-sync-alt"></i>
        </button>
    `;
    
    // Insert before fullscreen button
    controlButtons.insertBefore(loopToggle, document.querySelector('.fullscreen-btn'));
    
    // Add event listener
    document.getElementById('loop-btn').addEventListener('click', function() {
        loopPlayback = !loopPlayback;
        this.classList.toggle('active', loopPlayback);
        showToast(loopPlayback ? 'Looping enabled' : 'Looping disabled');
    });
    
    // Initialize as active
    document.getElementById('loop-btn').classList.add('active');
}

// Preview uploaded images
function previewImages() {
    const fileInput = document.getElementById('image-upload');
    const files = Array.from(fileInput.files);
    const imageGrid = document.getElementById('image-grid');
    
    // Clear existing images if needed
    imageGrid.innerHTML = '';
    imageSettings = [];
    
    if (files.length === 0) return;
    
    // Hide no preview message
    document.getElementById('no-preview-message').style.display = 'none';
    
    // Process each file
    files.forEach((file, index) => {
        // Create a URL for the image
        const imageUrl = URL.createObjectURL(file);
        
        // Add to settings array
        imageSettings.push({
            url: imageUrl,
            duration: parseInt(document.getElementById('global-image-duration').value) || 3,
            transition: document.getElementById('global-transition-effect').value || 'fade'
        });
        
        // Add to grid based on view mode
        addImageToGrid(imageUrl, index);
    });
    
    // Select first image by default
    if (files.length > 0) {
        selectImage(0);
    }
    
    // Update total duration display
    updateDurationDisplay();
}

// Calculate and update the total duration display
function updateDurationDisplay() {
    const totalDuration = calculateTotalDuration();
    const totalSeconds = Math.round(totalDuration);
    document.querySelector('.time-display').textContent = `00:00 / ${formatTime(totalSeconds)}`;
}

// Calculate total duration of the slideshow
function calculateTotalDuration() {
    return imageSettings.reduce((sum, img) => sum + img.duration, 0);
}

// Add image to grid
function addImageToGrid(src, index) {
    if (document.getElementById('show-individual-settings').checked) {
        // Create card from template
        const template = document.getElementById('image-card-template');
        const card = document.importNode(template.content, true).querySelector('.image-card');
        
        // Set image and index
        card.dataset.index = index;
        card.querySelector('img').src = src;
        card.querySelector('.image-card-number').textContent = index + 1;
        
        // Set initial values
        const durationSlider = card.querySelector('.image-duration');
        const durationValue = card.querySelector('.duration-value');
        const transitionSelect = card.querySelector('.image-transition');
        
        durationSlider.value = imageSettings[index].duration;
        durationValue.textContent = `${durationSlider.value}s`;
        transitionSelect.value = imageSettings[index].transition;
        
        // Add event listeners
        durationSlider.addEventListener('input', function() {
            durationValue.textContent = `${this.value}s`;
            imageSettings[index].duration = parseInt(this.value);
            updateDurationDisplay();
        });
        
        transitionSelect.addEventListener('change', function() {
            imageSettings[index].transition = this.value;
        });
        
        card.querySelector('.select-btn').addEventListener('click', function() {
            selectImage(index);
        });
        
        document.getElementById('image-grid').appendChild(card);
    } else {
        // Simple image grid
        const img = document.createElement('img');
        img.src = src;
        img.dataset.index = index;
        img.addEventListener('click', function() {
            selectImage(parseInt(this.dataset.index));
        });
        document.getElementById('image-grid').appendChild(img);
    }
}

// Toggle individual settings view
function toggleIndividualSettings() {
    const showIndividual = document.getElementById('show-individual-settings').checked;
    document.getElementById('image-grid').innerHTML = '';
    
    // Re-add all images with appropriate view
    imageSettings.forEach((setting, index) => {
        addImageToGrid(setting.url, index);
    });
    
    // Adjust grid container class
    const gridContainer = document.getElementById('image-grid-container');
    if (showIndividual) {
        gridContainer.classList.add('individual-settings-mode');
    } else {
        gridContainer.classList.remove('individual-settings-mode');
    }
    
    // Re-select the currently selected image if any
    if (selectedImageIndex >= 0) {
        selectImage(selectedImageIndex);
    }
}

// Update global duration
function updateGlobalDuration(val) {
    document.getElementById('global-duration-value').textContent = val + 's';
}

// Update global transition
function updateGlobalTransition(val) {
    // Just store the value, it will be applied when user clicks "Apply to All"
    console.log(`Global transition set to: ${val}`);
}

// Apply global settings to all images
function applySettingsToAll() {
    const duration = parseInt(document.getElementById('global-image-duration').value);
    const transition = document.getElementById('global-transition-effect').value;
    
    // Update all image settings
    imageSettings.forEach((settings, index) => {
        settings.duration = duration;
        settings.transition = transition;
    });
    
    // Update UI if individual settings are shown
    if (document.getElementById('show-individual-settings').checked) {
        document.querySelectorAll('.image-card').forEach((card, index) => {
            const durationSlider = card.querySelector('.image-duration');
            const durationValue = card.querySelector('.duration-value');
            const transitionSelect = card.querySelector('.image-transition');
            
            durationSlider.value = duration;
            durationValue.textContent = `${duration}s`;
            transitionSelect.value = transition;
        });
    }
    
    // Update total duration display
    updateDurationDisplay();
    
    // Show success message
    showToast('Settings applied to all images');
}

// Select an image
function selectImage(index) {
    selectedImageIndex = index;
    
    // Update UI to show selected image
    document.querySelectorAll('#image-grid .image-card, #image-grid img').forEach((item) => {
        if (parseInt(item.dataset.index) === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Show the current image in the preview
    document.getElementById('slideshow-frame').src = imageSettings[index].url;
    
    // Update sequence editor to show current position
    document.querySelector('.sequence-controls').setAttribute('data-selected', index);
}

// Reorder images
function reorderImages(direction) {
    if (selectedImageIndex === -1) {
        showToast('Please select an image first');
        return;
    }
    
    if (direction === 'up' && selectedImageIndex > 0) {
        // Swap with previous image
        [imageSettings[selectedImageIndex], imageSettings[selectedImageIndex - 1]] = 
        [imageSettings[selectedImageIndex - 1], imageSettings[selectedImageIndex]];
        
        selectedImageIndex--;
    } else if (direction === 'down' && selectedImageIndex < imageSettings.length - 1) {
        // Swap with next image
        [imageSettings[selectedImageIndex], imageSettings[selectedImageIndex + 1]] = 
        [imageSettings[selectedImageIndex + 1], imageSettings[selectedImageIndex]];
        
        selectedImageIndex++;
    }
    
    // Refresh the grid
    document.getElementById('image-grid').innerHTML = '';
    
    // Re-add all images
    imageSettings.forEach((setting, index) => {
        addImageToGrid(setting.url, index);
    });
    
    // Re-select the image at new position
    selectImage(selectedImageIndex);
}

// Remove selected image
function removeSelectedImage() {
    if (selectedImageIndex === -1) {
        showToast('Please select an image first');
        return;
    }
    
    // Remove image from array
    imageSettings.splice(selectedImageIndex, 1);
    
    // Refresh the grid
    document.getElementById('image-grid').innerHTML = '';
    
    // Re-add all images
    imageSettings.forEach((setting, index) => {
        addImageToGrid(setting.url, index);
    });
    
    // Reset selected index if we removed the last image
    if (selectedImageIndex >= imageSettings.length) {
        selectedImageIndex = imageSettings.length - 1;
    }
    
    // If there are still images, select one
    if (imageSettings.length > 0) {
        selectImage(selectedImageIndex);
    } else {
        selectedImageIndex = -1;
        // Show no preview message
        document.getElementById('no-preview-message').style.display = 'flex';
    }
    
    // Update total duration display
    updateDurationDisplay();
}

// Handle drag and drop for file upload
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Highlight drop zone
    const dropZone = document.getElementById('drop-zone');
    dropZone.style.borderColor = '#4ade80';
    dropZone.style.backgroundColor = 'rgba(74, 222, 128, 0.05)';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Reset drop zone style
    const dropZone = document.getElementById('drop-zone');
    dropZone.style.borderColor = '';
    dropZone.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        // Filter for image files
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            // Set files to input element
            const imageUpload = document.getElementById('image-upload');
            
            // Create a DataTransfer object
            const dataTransfer = new DataTransfer();
            imageFiles.forEach(file => dataTransfer.items.add(file));
            
            // Set the files to the input
            imageUpload.files = dataTransfer.files;
            
            // Process the images
            previewImages();
        } else {
            showToast('Please drop image files only');
        }
    }
}

// Video playback controls
function togglePlayPause() {
    if (imageSettings.length === 0) {
        showToast('Please upload images first');
        return;
    }
    
    const playBtn = document.getElementById('play-btn');
    
    if (isPlaying) {
        pauseVideo();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    } else {
        playVideo();
        playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    }
    
    isPlaying = !isPlaying;
}
function playVideo() {
    if (imageSettings.length === 0) return;
    
    // Clear any existing interval
    clearTimeout(slideshowInterval);
    
    // Reset playback complete flag
    playbackComplete = false;
    
    // Start from current image
    let index = selectedImageIndex >= 0 ? selectedImageIndex : 0;
    
    // Handle background music
    const musicInput = document.getElementById('background-music');
    if (musicInput.files.length > 0) {
        const musicFile = musicInput.files[0];
        const musicURL = URL.createObjectURL(musicFile);
        
        if (!backgroundMusic) {
            backgroundMusic = new Audio(musicURL);
        } else {
            // Reset audio source if it's a different file
            if (backgroundMusic.src !== musicURL) {
                backgroundMusic.src = musicURL;
            }
        }
        
        // Reset audio to beginning
        backgroundMusic.currentTime = 0;
        backgroundMusic.loop = false; // We'll handle looping manually
        
        backgroundMusic.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    
    // Set up progress bar
    const progressBar = document.querySelector('.progress-bar');
    
    // Calculate total duration for progress bar
    const totalDuration = calculateTotalDuration();
    
    // Function to show current image and set up next one
    function showNextImage() {
        let elapsedTime = 0;
        
        for (let i = 0; i < index; i++) {
            elapsedTime += imageSettings[i].duration;
        }
        
        // Update progress bar
        const progress = (elapsedTime / totalDuration) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update time display
        const totalSeconds = Math.round(totalDuration);
        const currentSeconds = Math.round(elapsedTime);
        document.querySelector('.time-display').textContent = 
            `${formatTime(currentSeconds)} / ${formatTime(totalSeconds)}`;
        
        // Show current image
        document.getElementById('slideshow-frame').src = imageSettings[index].url;
        
        // Select this image in the grid
        selectImage(index);
        
        // Schedule next image
        slideshowInterval = setTimeout(() => {
            index++;
            
            // Check if we've reached the end
            if (index >= imageSettings.length) {
                playbackComplete = true;
                
                if (loopPlayback) {
                    // Loop back to beginning
                    index = 0;
                    
                    // Restart the audio from the beginning when looping
                    if (backgroundMusic) {
                        backgroundMusic.currentTime = 0;
                        backgroundMusic.play().catch(error => {
                            console.error('Error restarting audio:', error);
                        });
                    }
                } else {
                    // Stop playback
                    pauseVideo();
                    document.getElementById('play-btn').querySelector('i').classList.replace('fa-pause', 'fa-play');
                    isPlaying = false;
                    
                    // Stop music if playing
                    if (backgroundMusic && !backgroundMusic.paused) {
                        backgroundMusic.pause();
                    }
                    
                    return;
                }
            }
            
            showNextImage();
        }, imageSettings[index].duration * 1000);
    }
    
    showNextImage();
}
function pauseVideo() {
    clearTimeout(slideshowInterval);
    
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

function rewindVideo() {
    clearTimeout(slideshowInterval);
    isPlaying = false;
    
    document.getElementById('play-btn').querySelector('i').classList.replace('fa-pause', 'fa-play');
    
    if (imageSettings.length > 0) {
        selectImage(0);
    }
    
    // Make sure to fully reset the audio
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    // Reset progress bar
    document.querySelector('.progress-bar').style.width = '0%';
    
    // Update time display
    const totalDuration = calculateTotalDuration();
    const totalSeconds = Math.round(totalDuration);
    document.querySelector('.time-display').textContent = `00:00 / ${formatTime(totalSeconds)}`;
}

function nextFrame() {
    if (imageSettings.length === 0) return;
    
    clearTimeout(slideshowInterval);
    isPlaying = false;
    document.getElementById('play-btn').querySelector('i').classList.replace('fa-pause', 'fa-play');
    
    const nextIndex = (selectedImageIndex + 1) % imageSettings.length;
    selectImage(nextIndex);
}

// Toggle mute for background music
function toggleMute() {
    const volumeBtn = document.querySelector('.volume-container .control-btn i');
    
    if (backgroundMusic) {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            volumeBtn.classList.replace('fa-volume-mute', 'fa-volume-up');
        } else {
            backgroundMusic.muted = true;
            volumeBtn.classList.replace('fa-volume-up', 'fa-volume-mute');
        }
    }
}

// Toggle fullscreen for video preview
function toggleFullscreen() {
    const videoContainer = document.getElementById('video-preview');
    
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
            showToast('Could not enter fullscreen mode');
        });
    } else {
        document.exitFullscreen();
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Show toast message
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Create video button click handler
function createVideo() {
    if (imageSettings.length === 0) {
        showToast('Please upload images first');
        return;
    }
    
    // Get output settings
    const resolution = document.getElementById('video-resolution').value;
    const quality = document.getElementById('video-quality').value;
    
    // Display settings being used
    console.log(`Creating video with resolution: ${resolution}, quality: ${quality}`);
    
    // Display a "processing" message
    showToast(`Creating ${resolution} video at ${quality} quality...`);
    
    // In a real application, this would trigger the backend processing
    // For now, we'll just simulate completion after a delay
    setTimeout(() => {
        showToast(`${resolution} video created successfully! Ready for download.`);
        
        // Create a download button
        createDownloadButton(resolution, quality);
    }, 3000);
}

// Create download button after processing
function createDownloadButton(resolution, quality) {
    const container = document.querySelector('.create-video-container');
    
    // Remove existing download button if any
    const existingBtn = document.getElementById('download-video-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // Create new download button
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'download-video-btn';
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download ${resolution} Video`;
    
    // Add click handler (in a real app, this would have a real download link)
    downloadBtn.addEventListener('click', function() {
        showToast(`Downloading ${resolution} video at ${quality} quality`);
        console.log(`Download started: ${resolution} video at ${quality} quality`);
        
        // Simulate download - in a real app this would be a real download link
        setTimeout(() => {
            showToast('Download complete!');
        }, 2000);
    });
    
    // Add to container
    container.appendChild(downloadBtn);
}