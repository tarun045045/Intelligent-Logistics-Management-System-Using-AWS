/**
 * IntelliLogistics - Logistics Management System
 * Shipment form JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the shipment form
    initializeShipmentForm();
    
    // Handle form submission
    setupFormSubmission();
    
    // Setup real-time form validation
    setupFormValidation();
    
    // Initialize dynamic form elements
    initializeDynamicFormElements();
});

/**
 * Initialize the shipment form with event listeners
 */
function initializeShipmentForm() {
    const form = document.getElementById('shipmentForm');
    if (!form) return;
    
    // Add event listeners to form elements that should update the summary
    const updateElements = form.querySelectorAll(
        '#originCity, #originState, #originZip, ' +
        '#destinationCity, #destinationState, #destinationZip, ' +
        '#deliveryDate, #packageType, #packageQuantity, ' +
        '#weight, #length, #width, #height'
    );
    
    updateElements.forEach(element => {
        element.addEventListener('change', updateShipmentSummary);
        element.addEventListener('input', updateShipmentSummary);
    });
    
    // Initialize datepickers with min dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const shipmentDateInput = document.getElementById('shipmentDate');
    const deliveryDateInput = document.getElementById('deliveryDate');
    
    if (shipmentDateInput) {
        shipmentDateInput.min = today.toISOString().split('T')[0];
        shipmentDateInput.value = today.toISOString().split('T')[0];
    }
    
    if (deliveryDateInput) {
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
        tomorrow.setDate(tomorrow.getDate() + 3); // Default to 3 days later
        deliveryDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Add dependencies between dates
    if (shipmentDateInput && deliveryDateInput) {
        shipmentDateInput.addEventListener('change', function() {
            const newMinDate = new Date(this.value);
            newMinDate.setDate(newMinDate.getDate() + 1);
            deliveryDateInput.min = newMinDate.toISOString().split('T')[0];
            
            // If current delivery date is before new min date, update it
            if (new Date(deliveryDateInput.value) < newMinDate) {
                deliveryDateInput.value = newMinDate.toISOString().split('T')[0];
            }
        });
    }
}

/**
 * Update the shipment summary panel based on form inputs
 */
function updateShipmentSummary() {
    // Get form values
    const originCity = document.getElementById('originCity')?.value;
    const originState = document.getElementById('originState')?.value;
    const originZip = document.getElementById('originZip')?.value;
    
    const destinationCity = document.getElementById('destinationCity')?.value;
    const destinationState = document.getElementById('destinationState')?.value;
    const destinationZip = document.getElementById('destinationZip')?.value;
    
    const deliveryDate = document.getElementById('deliveryDate')?.value;
    const packageType = document.getElementById('packageType')?.value;
    const packageQuantity = document.getElementById('packageQuantity')?.value || '1';
    
    const weight = document.getElementById('weight')?.value;
    const length = document.getElementById('length')?.value;
    const width = document.getElementById('width')?.value;
    const height = document.getElementById('height')?.value;
    
    // Check if we have enough data to show the summary
    const canShowSummary = originCity && destinationCity && weight;
    
    // Get summary elements
    const summaryContent = document.getElementById('summaryContent');
    const summaryDetails = document.getElementById('summaryDetails');
    
    // Show/hide appropriate sections
    if (canShowSummary) {
        // Hide initial content, show details
        if (summaryContent) summaryContent.classList.add('d-none');
        if (summaryDetails) summaryDetails.classList.remove('d-none');
        
        // Update summary text
        const summaryOrigin = document.getElementById('summaryOrigin');
        if (summaryOrigin) {
            summaryOrigin.textContent = `${originCity}, ${originState} ${originZip}`;
        }
        
        const summaryDestination = document.getElementById('summaryDestination');
        if (summaryDestination) {
            summaryDestination.textContent = `${destinationCity}, ${destinationState} ${destinationZip}`;
        }
        
        // Format and display the delivery date
        if (deliveryDate) {
            const formattedDate = new Date(deliveryDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const summaryDate = document.getElementById('summaryDate');
            if (summaryDate) {
                summaryDate.textContent = formattedDate;
            }
        }
        
        // Update package info
        const packageTypeText = packageType ? 
            `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} (${packageQuantity})` : 
            'Not specified';
            
        const summaryPackage = document.getElementById('summaryPackage');
        if (summaryPackage) {
            summaryPackage.textContent = packageTypeText;
        }
        
        // Update weight
        const summaryWeight = document.getElementById('summaryWeight');
        if (summaryWeight) {
            summaryWeight.textContent = weight ? `${weight} kg` : 'Not specified';
        }
        
        // Update dimensions if all are provided
        const summaryDimensions = document.getElementById('summaryDimensions');
        if (summaryDimensions) {
            if (length && width && height) {
                summaryDimensions.textContent = `${length} × ${width} × ${height} cm`;
            } else {
                summaryDimensions.textContent = 'Not specified';
            }
        }
        
        // Calculate and update estimated cost
        updateEstimatedCost(weight, originState, destinationState);
    }
}

/**
 * Calculate and update the estimated cost based on shipment details
 */
function updateEstimatedCost(weight, originState, destinationState) {
    // Basic cost calculation logic
    let baseCost = 50; // Base cost in dollars
    
    // Add cost based on weight
    const weightCost = weight ? parseFloat(weight) * 5 : 0;
    
    // Distance factor (simplified - would use actual distance in real app)
    let distanceFactor = 1.0;
    if (originState && destinationState && originState !== destinationState) {
        distanceFactor = 1.5; // Higher for interstate shipment
    }
    
    // Calculate final estimated cost
    const estimatedCost = (baseCost + weightCost) * distanceFactor;
    
    // Update the UI
    const costElement = document.getElementById('estimatedCost');
    if (costElement) {
        costElement.textContent = `$${estimatedCost.toFixed(2)}`;
    }
}

/**
 * Handle form submission
 */
function setupFormSubmission() {
    const form = document.getElementById('shipmentForm');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Show loading indicator
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Creating...';
        
        // Collect form data
        const formData = new FormData(this);
        const shipmentData = {};
        for (const [key, value] of formData.entries()) {
            shipmentData[key] = value;
        }
        
        // API Gateway endpoint URL - REPLACE THIS WITH YOUR ACTUAL ENDPOINT
        const apiUrl = 'https://nueu20t7z0.execute-api.ap-south-1.amazonaws.com/prod/shipments';
        
        // Submit data to API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shipmentData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Show success notification
            showNotification(`Shipment created successfully! Tracking ID: ${data.shipmentId}`, 'success');
            
            // Reset form after success
            form.reset();
            
            // Hide summary details
            const summaryContent = document.getElementById('summaryContent');
            if (summaryContent) {
                summaryContent.classList.remove('d-none');
            }
            
            const summaryDetails = document.getElementById('summaryDetails');
            if (summaryDetails) {
                summaryDetails.classList.add('d-none');
            }
            
            // Create a success modal
            showSuccessModal(data.shipmentId);
        })
        .catch(error => {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Show error notification
            showNotification('Error creating shipment. Please try again.', 'error');
            console.error('Error:', error);
        });
    });
}

/**
 * Show a success modal after shipment creation
 * @param {string} trackingId - The generated tracking ID
 */
function showSuccessModal(trackingId) {
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="mb-3">
                            <i class="fas fa-check-circle text-success fa-4x"></i>
                        </div>
                        <h3 class="modal-title mb-3">Shipment Created!</h3>
                        <p class="mb-4">Your shipment has been created successfully. The tracking ID is:</p>
                        <div class="bg-light p-3 rounded mb-3">
                            <h4 class="fw-bold mb-0 tracking-id">${trackingId}</h4>
                        </div>
                        <p class="text-muted small mb-0">You can use this ID to track the shipment status.</p>
                    </div>
                    <div class="modal-footer justify-content-center border-0 pt-0">
                        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">Continue</button>
                        <button type="button" class="btn btn-outline-secondary" id="createAnotherBtn">Create Another</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and show the modal
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Add event listener to "Create Another" button
    const createAnotherBtn = document.getElementById('createAnotherBtn');
    if (createAnotherBtn) {
        createAnotherBtn.addEventListener('click', function() {
            modal.hide();
            // No need to reset the form as it's already reset after submission
        });
    }
    
    // Remove modal from DOM when hidden
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

/**
 * Setup real-time form validation
 */
function setupFormValidation() {
    const form = document.getElementById('shipmentForm');
    if (!form) return;
    
    // Add validation classes and feedback
    const inputs = form.querySelectorAll('input, select, textarea');
    
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
    
    if (input.type === 'tel' && input.value) {
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(input.value)) {
            setInvalidInput(input, 'Please enter a valid phone number');
            return false;
        }
    }
    
    if (input.type === 'number') {
        if (input.min && Number(input.value) < Number(input.min)) {
            setInvalidInput(input, `Value must be at least ${input.min}`);
            return false;
        }
        
        if (input.max && Number(input.value) > Number(input.max)) {
            setInvalidInput(input, `Value must be at most ${input.max}`);
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
 * Initialize dynamic form elements
 */
function initializeDynamicFormElements() {
    // Add special handling for fragile and hazardous checkboxes
    const fragileCheck = document.getElementById('fragileCheck');
    const hazardousCheck = document.getElementById('hazardousCheck');
    
    if (fragileCheck) {
        fragileCheck.addEventListener('change', function() {
            if (this.checked) {
                showNotification('Fragile items require special handling and may incur additional fees.', 'info');
            }
        });
    }
    
    if (hazardousCheck) {
        hazardousCheck.addEventListener('change', function() {
            if (this.checked) {
                showNotification('Hazardous materials require special documentation. Additional regulations apply.', 'warning');
                
                // Add a hazardous materials form section
                const specialInstructions = document.getElementById('specialInstructions');
                if (specialInstructions && !specialInstructions.value.includes('[HAZARDOUS]')) {
                    specialInstructions.value = '[HAZARDOUS] ' + specialInstructions.value;
                }
            } else {
                const specialInstructions = document.getElementById('specialInstructions');
                if (specialInstructions) {
                    specialInstructions.value = specialInstructions.value.replace('[HAZARDOUS] ', '');
                }
            }
        });
    }
}