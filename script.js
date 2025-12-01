// Webhook URL - Fixed double https
const WEBHOOK_URL = 'https://n8n.simplifai-1.org/webhook/983c0d13-2bef-493e-879d-85c246bfa512';

// DOM Elements
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImage');
const styleSelect = document.getElementById('styleSelect');
const customPrompt = document.getElementById('customPrompt');
const emailInput = document.getElementById('emailInput');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultImageContainer = document.getElementById('resultImageContainer');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const historyGrid = document.getElementById('historyGrid');

// State
let selectedImage = null;
let imageBase64 = null;
let history = JSON.parse(localStorage.getItem('mockmagicHistory')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadHistory();
    updateGenerateButton();
});

// Event Listeners
function initializeEventListeners() {
    // Image upload
    uploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageSelect);
    removeImageBtn.addEventListener('click', removeImage);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Form inputs
    styleSelect.addEventListener('change', updateGenerateButton);
    emailInput.addEventListener('input', updateGenerateButton);
    emailInput.addEventListener('blur', validateEmail);
    
    // Generate button
    generateBtn.addEventListener('click', handleGenerate);
    
    // Download button
    downloadBtn.addEventListener('click', handleDownload);
}

// Image Handling
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    } else {
        showError('Please drop a valid image file.');
    }
}

function processImage(file) {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB.');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
    }
    
    selectedImage = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        imageBase64 = e.target.result;
        previewImage.src = imageBase64;
        previewContainer.style.display = 'block';
        uploadArea.querySelector('.upload-content').style.display = 'none';
        updateGenerateButton();
    };
    
    reader.onerror = () => {
        showError('Error reading image file.');
    };
    
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImage = null;
    imageBase64 = null;
    imageInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.querySelector('.upload-content').style.display = 'flex';
    updateGenerateButton();
}

// Email Validation
function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        emailInput.style.borderColor = 'rgba(220, 38, 38, 0.5)';
        return false;
    } else {
        emailInput.style.borderColor = 'rgba(147, 51, 234, 0.3)';
        return true;
    }
}

// Update Generate Button State
function updateGenerateButton() {
    const hasImage = imageBase64 !== null;
    const hasStyle = styleSelect.value !== '';
    const hasEmail = emailInput.value.trim() !== '' && validateEmail();
    
    generateBtn.disabled = !(hasImage && hasStyle && hasEmail);
}

// Generate Mockup
async function handleGenerate() {
    // Validate inputs
    if (!imageBase64) {
        showError('Please upload an image first.');
        return;
    }
    
    if (!styleSelect.value) {
        showError('Please select a mockup style.');
        return;
    }
    
    const email = emailInput.value.trim();
    if (!email || !validateEmail()) {
        showError('Please enter a valid email address.');
        emailInput.focus();
        return;
    }
    
    // Extract base64 string (remove data:image/...;base64, prefix)
    const base64String = imageBase64.split(',')[1] || imageBase64;
    
    // Prepare payload
    const payload = {
        image: base64String,
        style: styleSelect.value,
        email: email,
        customPrompt: customPrompt.value.trim() || undefined
    };
    
    // Remove undefined fields
    if (!payload.customPrompt) {
        delete payload.customPrompt;
    }
    
    // Show loading state
    resultSection.style.display = 'block';
    loadingSpinner.style.display = 'flex';
    resultImageContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    generateBtn.disabled = true;
    
    try {
        console.log('Sending request to webhook:', WEBHOOK_URL);
        console.log('Payload:', { ...payload, image: '[base64 image data]' });
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseData = await response.json().catch(() => {
            // If response is not JSON, return text
            return response.text().then(text => ({ message: text }));
        });
        
        console.log('Response data:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.message || `Server error: ${response.status}`);
        }
        
        // Check if response contains result_url
        if (responseData.result_url) {
            // Display the result image
            resultImage.src = responseData.result_url;
            resultImageContainer.style.display = 'block';
            loadingSpinner.style.display = 'none';
            
            // Save to history
            addToHistory({
                imageUrl: responseData.result_url,
                style: styleSelect.value,
                timestamp: new Date().toISOString(),
                email: email
            });
            
            // Show success message about email
            showSuccessMessage();
        } else {
            // If no result_url, assume it will be emailed
            loadingSpinner.style.display = 'none';
            showSuccessMessage(true);
        }
        
    } catch (error) {
        console.error('Error generating mockup:', error);
        loadingSpinner.style.display = 'none';
        showError(`Failed to generate mockup: ${error.message}. Please check your connection and try again.`);
    } finally {
        generateBtn.disabled = false;
        updateGenerateButton();
    }
}

// Show Success Message
function showSuccessMessage(isEmailOnly = false) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <p><strong>Request submitted successfully!</strong></p>
            <p>Your mockup is being generated and will be sent to <strong>${emailInput.value.trim()}</strong>.</p>
            <p style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">Please check your email inbox (and spam folder) for your generated mockup.</p>
        </div>
    `;
    
    // Insert before result container
    const resultCard = resultSection.querySelector('.section-card');
    const resultContainer = resultCard.querySelector('.result-container');
    resultCard.insertBefore(successMsg, resultContainer);
    
    // Scroll to result section
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Remove success message after 10 seconds
    setTimeout(() => {
        successMsg.remove();
    }, 10000);
}

// Show Error
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Download Image
function handleDownload() {
    if (resultImage.src) {
        const link = document.createElement('a');
        link.href = resultImage.src;
        link.download = `mockmagic-${styleSelect.value}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// History Management
function addToHistory(item) {
    history.unshift(item);
    
    // Keep only last 20 items
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('mockmagicHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    if (history.length === 0) {
        historyGrid.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-images"></i>
                <p>No mockups generated yet. Create your first one above!</p>
            </div>
        `;
        return;
    }
    
    historyGrid.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="viewHistoryItem('${item.imageUrl}')">
            <img src="${item.imageUrl}" alt="Mockup ${index + 1}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23111\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23933\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EImage not available%3C/text%3E%3C/svg%3E'">
            <div class="history-item-overlay">
                <div class="history-item-info">
                    <div class="history-item-style">${item.style}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                        ${new Date(item.timestamp).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function viewHistoryItem(imageUrl) {
    resultImage.src = imageUrl;
    resultImageContainer.style.display = 'block';
    resultSection.style.display = 'block';
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Make viewHistoryItem available globally
window.viewHistoryItem = viewHistoryItem;
