/**
 * IntelliLogistics - Logistics Management System
 * Feedback form JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the feedback form
    initializeFeedbackForm();
    
    // Setup form validation
    setupFormValidation();
});

/**
 * Initialize the feedback form
 */
function initializeFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Submitting...';
        
        // Hide any previous alerts
        document.getElementById('feedbackSuccess').classList.add('d-none');
        document.getElementById('feedbackError').classList.add('d-none');
        
        // Collect form data
        const formData = new FormData(this);
        const feedbackData = {};
        for (const [key, value] of formData.entries()) {
            feedbackData[key] = value;
        }
        
        // For checkboxes, ensure proper boolean values
        feedbackData.termsCheck = document.getElementById('termsCheck').checked ? 'on' : 'off';
        
        // API Gateway endpoint URL - REPLACE THIS WITH YOUR ACTUAL ENDPOINT
        // CORRECT URL FORMAT
const apiUrl = 'https://nueu20t7z0.execute-api.ap-south-1.amazonaws.com/prod/feedback';
        
        console.log('Sending feedback data:', feedbackData);
        
        // Submit data to API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Display success message
            if (data.feedbackId) {
                // Set the feedback ID in the success modal
                document.getElementById('displayFeedbackId').textContent = data.feedbackId;
                
                // Show the success modal
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // Reset form
                form.reset();
            } else {
                // Show inline success message
                document.getElementById('feedbackSuccess').classList.remove('d-none');
                
                // Scroll to the top of the form to show the success message
                form.scrollIntoView({ behavior: 'smooth' });
                
                // Reset form after a delay
                setTimeout(() => {
                    form.reset();
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Show error message
            const errorMsgElement = document.getElementById('errorMessage');
            if (errorMsgElement) {
                errorMsgElement.textContent = 'There was an error submitting your feedback. Please try again.';
            }
            document.getElementById('feedbackError').classList.remove('d-none');
            
            // Scroll to the top of the form to show the error
            form.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            // Clear validation state when user starts typing
            if (this.classList.contains('is-invalid')) {
                this.classList.remove('is-invalid');
                const feedbackElement = this.nextElementSibling;
                if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                    feedbackElement.remove();
                }
            }
        });
    });
}

/**
 * Validate a single input element
 * @param {HTMLElement} input - Input element to validate
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        setInvalidInput(input, 'This field is required');
        return false;
    }
    
    if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            setInvalidInput(input, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Set valid state
    input.classList.add('is-valid');
    
    return true;
}

/**
 * Set an input as invalid with feedback message
 * @param {HTMLElement} input - Input element to mark as invalid
 * @param {string} message - Error message to display
 */
function setInvalidInput(input, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    
    // Remove any existing feedback
    const nextElement = input.nextElementSibling;
    if (nextElement && nextElement.classList.contains('invalid-feedback')) {
        nextElement.remove();
    }
    
    // Add feedback message
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    input.parentNode.insertBefore(feedback, input.nextSibling);
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'warning', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}