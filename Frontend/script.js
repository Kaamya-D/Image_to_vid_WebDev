document.getElementById('image-upload').addEventListener('change', previewImages);

let uploadedImages = [];

// Preview uploaded images and allow selection
function previewImages() {
    const imageUpload = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-images');
    const imageGrid = document.getElementById('image-grid');
    imageGrid.innerHTML = ''; // Clear existing previews
    const files = imageUpload.files;

    uploadedImages = []; // Clear previously uploaded images

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;
            uploadedImages.push(imageUrl); // Store the uploaded image URL

            // Create a container for image and checkbox
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');

            // Create an image element
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = "150px";
            img.style.height = "150px";
            img.style.margin = "10px";

            // Create a checkbox for selecting the image
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = imageUrl;
            checkbox.classList.add('image-checkbox');

            // Append the image and checkbox to the container
            imageItem.appendChild(img);
            imageItem.appendChild(checkbox);
            imageGrid.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    }
}

// Handle drag and drop
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;

    if (files.length > 0) {
        const imageUpload = document.getElementById('image-upload');
        imageUpload.files = files;
        previewImages();
    }
}

// Play the preview video (simulate video creation)
function playVideo() {
    const selectedImages = getSelectedImages();
    if (selectedImages.length === 0) {
        alert('Please select images to include in the video.');
        return;
    }

    const videoPreview = document.getElementById('video-preview');
    const duration = document.getElementById('image-duration').value;
    const videoSrc = createVideoFromImages(selectedImages, duration);

    videoPreview.src = videoSrc; // This simulates video
    videoPreview.play();
}

// Pause the video
function pauseVideo() {
    const videoPreview = document.getElementById('video-preview');
    videoPreview.pause();
}

// Rewind the video to the start
function rewindVideo() {
    const videoPreview = document.getElementById('video-preview');
    videoPreview.currentTime = 0;
}

// Function to get selected images for video generation
function getSelectedImages() {
    const selectedImages = [];
    const checkboxes = document.querySelectorAll('.image-checkbox');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedImages.push(checkbox.value);
        }
    });
    return selectedImages;
}

// Function to simulate video creation (for now, returns a placeholder video)
function createVideoFromImages(selectedImages, duration) {
    // Simulate creating a video with selected images and duration
    console.log(`Creating video with ${selectedImages.length} images. Each image will display for ${duration} seconds.`);

    // For simulation purposes, return a sample video URL (you can replace this with a real video URL or generated content)
    return 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder video URL
}

// Adding event listeners for drag-and-drop
document.getElementById('drop-zone').addEventListener('dragover', handleDragOver);
document.getElementById('drop-zone').addEventListener('drop', handleDrop);
