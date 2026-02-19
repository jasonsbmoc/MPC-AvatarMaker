// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewCanvas = document.getElementById('previewCanvas');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const downloadBtn = document.getElementById('downloadBtn');
const closeBtn = document.getElementById('closeBtn');
const zoomControl = document.getElementById('zoomControl');
const zoomSlider = document.getElementById('zoomSlider');
const resetPosition = document.getElementById('resetPosition');
const ctx = previewCanvas.getContext('2d');

// State
let userImage = null;
let currentFrame = null;

// Image positioning state
let imageScale = 1;
let imageX = 0;
let imageY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let lastX = 0;
let lastY = 0;

// Pinch zoom state
let initialPinchDistance = 0;
let initialScale = 1;

// Upload area click (only when no image is loaded)
uploadArea.addEventListener('click', (e) => {
    // Don't open file picker if there's already an image
    if (userImage) return;
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        loadImage(e.target.files[0]);
    }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImage(e.dataTransfer.files[0]);
    }
});

// Load user image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            userImage = img;

            // Reset position and zoom for new image
            imageScale = 1;
            imageX = 0;
            imageY = 0;
            zoomSlider.value = 100;

            renderComposite();
            downloadBtn.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Render composite image
function renderComposite() {
    if (!userImage) return;

    const size = 500;
    previewCanvas.width = size;
    previewCanvas.height = size;

    // Calculate base scale to fit image
    const baseScale = Math.max(size / userImage.width, size / userImage.height);
    const totalScale = baseScale * imageScale;

    // Apply user's zoom scale
    const scaledWidth = userImage.width * totalScale;
    const scaledHeight = userImage.height * totalScale;

    // Apply user's position offset
    const x = (size - scaledWidth) / 2 + imageX;
    const y = (size - scaledHeight) / 2 + imageY;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(userImage, x, y, scaledWidth, scaledHeight);

    // Draw frame overlay
    if (currentFrame) {
        ctx.drawImage(currentFrame, 0, 0, size, size);
    }

    previewCanvas.classList.add('active');
    uploadPlaceholder.style.display = 'none';
    uploadArea.classList.add('has-image');
    zoomControl.classList.add('active');
}

// Load frame
function loadFrame() {
    const selectedFrame = document.querySelector('input[name="frame"]:checked').value;
    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    const framePath = `Frames/Frame-${selectedFrame}-${selectedColor}.png`;

    const frameImg = new Image();
    frameImg.onload = () => {
        currentFrame = frameImg;
        renderComposite();
    };
    frameImg.src = framePath;
}

// Frame and color change listeners
document.querySelectorAll('input[name="frame"], input[name="color"]').forEach(input => {
    input.addEventListener('change', loadFrame);
});

// Zoom slider
zoomSlider.addEventListener('input', (e) => {
    imageScale = e.target.value / 100;
    renderComposite();
});

// Reset position and zoom
resetPosition.addEventListener('click', () => {
    imageScale = 1;
    imageX = 0;
    imageY = 0;
    zoomSlider.value = 100;
    renderComposite();
});

// Mouse drag functionality
previewCanvas.addEventListener('mousedown', (e) => {
    if (!userImage) return;
    isDragging = true;
    uploadArea.classList.add('dragging');
    const rect = previewCanvas.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
    lastX = imageX;
    lastY = imageY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = previewCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragStartX;
    const deltaY = currentY - dragStartY;

    // Scale delta to canvas coordinates (preview is 300px, canvas is 500px)
    const scale = 500 / 300;
    imageX = lastX + (deltaX * scale);
    imageY = lastY + (deltaY * scale);
    renderComposite();
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        uploadArea.classList.remove('dragging');
    }
});

// Helper function to calculate distance between two touch points
function getTouchDistance(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Touch drag and pinch zoom functionality
previewCanvas.addEventListener('touchstart', (e) => {
    if (!userImage) return;
    e.preventDefault();

    if (e.touches.length === 2) {
        // Pinch zoom started
        initialPinchDistance = getTouchDistance(e.touches);
        initialScale = imageScale;
        isDragging = false;
    } else if (e.touches.length === 1) {
        // Single touch drag
        isDragging = true;
        const rect = previewCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        dragStartX = touch.clientX - rect.left;
        dragStartY = touch.clientY - rect.top;
        lastX = imageX;
        lastY = imageY;
    }
});

previewCanvas.addEventListener('touchmove', (e) => {
    if (!userImage) return;
    e.preventDefault();

    if (e.touches.length === 2) {
        // Pinch zoom
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / initialPinchDistance;
        imageScale = Math.min(Math.max(initialScale * scale, 1), 3);
        zoomSlider.value = imageScale * 100;
        renderComposite();
    } else if (e.touches.length === 1 && isDragging) {
        // Single touch drag
        const rect = previewCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        const deltaX = currentX - dragStartX;
        const deltaY = currentY - dragStartY;

        const scale = 500 / 300;
        imageX = lastX + (deltaX * scale);
        imageY = lastY + (deltaY * scale);
        renderComposite();
    }
});

previewCanvas.addEventListener('touchend', () => {
    isDragging = false;
    initialPinchDistance = 0;
});

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           ('ontouchstart' in window && navigator.maxTouchPoints > 0);
}

// Download button
downloadBtn.addEventListener('click', async () => {
    // On mobile devices, try to use Web Share API for native share sheet
    if (isMobileDevice() && navigator.share && navigator.canShare) {
        try {
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                previewCanvas.toBlob(resolve, 'image/png');
            });

            // Create a File object
            const file = new File([blob], 'medium-pub-crawl-2026-avatar.png', {
                type: 'image/png'
            });

            // Check if we can share this file
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Medium Pub Crawl 2026 Avatar'
                });
                return; // Successfully shared
            }
        } catch (error) {
            // If share was cancelled or failed, fall through to standard download
            console.log('Share cancelled or failed:', error);
        }
    }

    // Fallback: Standard download for desktop or if share API failed
    const link = document.createElement('a');
    link.download = 'medium-pub-crawl-2026-avatar.png';
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
});

// Close button
closeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from bubbling to upload area

    userImage = null;
    currentFrame = null;
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCanvas.classList.remove('active');
    uploadPlaceholder.style.display = 'block';
    uploadArea.classList.remove('has-image');
    zoomControl.classList.remove('active');
    fileInput.value = '';
    downloadBtn.disabled = true;

    // Reset zoom and position
    imageScale = 1;
    imageX = 0;
    imageY = 0;
    zoomSlider.value = 100;
});

// Load initial frame
loadFrame();
