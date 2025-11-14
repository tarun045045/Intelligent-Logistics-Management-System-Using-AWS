/**
 * IntelliLogistics - Logistics Management System
 * Main JavaScript file for common functionality
 * Version: 1.0.0
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initializeTooltips();
    
    // Add current year to footer
    updateFooterYear();
    
    // Handle navigation active states
    highlightActiveNav();
    
    // Initialize notification system
    initNotifications();
    
    // Add fade-in animation to cards
    animateElements();
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    // Check if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
}

/**
 * Update copyright year in the footer
 */
function updateFooterYear() {
    const footerYearElements = document.querySelectorAll('.copyright-year');
    const currentYear = new Date().getFullYear();
    
    footerYearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/**
 * Highlight the active navigation item
 */
function highlightActiveNav() {
    // Get current page path
    const currentPath = window.location.pathname;
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    // Find matching nav link and add active class
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === filename || 
            (filename === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize the notification system
 */
function initNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    
    // Create icon based on notification type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, duration);
}

/**
 * Format currency value
 * @param {number} value - Value to format as currency
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Format date to user-friendly string
 * @param {string|Date} dateString - Date to format
 * @param {string} format - Format type (short, medium, long)
 * @returns {string} Formatted date string
 */
function formatDate(dateString, format = 'medium') {
    const date = new Date(dateString);
    
    if (isNaN(date)) {
        return 'Invalid date';
    }
    
    switch (format) {
        case 'short':
            return date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit'
            });
        case 'long':
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        case 'time':
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        default: // medium
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
    }
}

/**
 * Add fade-in animation to elements
 */
function animateElements() {
    const elementsToAnimate = document.querySelectorAll('.card, .stat-card');
    
    elementsToAnimate.forEach((element, index) => {
        // Add delay based on index
        setTimeout(() => {
            element.classList.add('fade-in');
        }, 100 * index);
    });
}

/**
 * Handle form submissions via AJAX
 * @param {HTMLFormElement} form - The form element to submit
 * @param {Function} successCallback - Callback function on successful submission
 * @param {Function} errorCallback - Callback function on failed submission
 */
function submitFormAsync(form, successCallback, errorCallback) {
    // Create FormData object
    const formData = new FormData(form);
    
    // Prepare data as JSON object
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Simulate API call (in production, replace with actual API call)
    // This is a placeholder to show how it would work with a real backend
    setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
            if (typeof successCallback === 'function') {
                successCallback({
                    success: true,
                    message: 'Form submitted successfully',
                    data: data,
                    id: 'SH-' + Math.floor(10000 + Math.random() * 90000)
                });
            }
        } else {
            if (typeof errorCallback === 'function') {
                errorCallback({
                    success: false,
                    message: 'An error occurred while submitting the form. Please try again.',
                    errors: ['Server error']
                });
            }
        }
    }, 1500);
}

/**
 * Toggle dark/light mode
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode-enabled');
    
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode-enabled');
    localStorage.setItem('darkModeEnabled', isDarkMode);
}

// Check for saved dark mode preference on load
if (localStorage.getItem('darkModeEnabled') === 'true') {
    document.body.classList.add('dark-mode-enabled');
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID string
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}