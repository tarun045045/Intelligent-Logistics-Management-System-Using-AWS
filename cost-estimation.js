// API Gateway URL - Your existing endpoint
const API_URL = "https://ttobko8gt6.execute-api.ap-south-1.amazonaws.com/prod/estimate";

// Format currency in Indian Rupees
function formatINR(amount) {
    // Indian numbering system: 1,00,000 (1 lakh), 10,00,000 (10 lakhs)
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
}

// Attach event listener to the form
document.getElementById("costEstimationForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent form reload

    // Validate form inputs
    if (!validateForm()) {
        showAlert("Please fill in all required fields correctly.", "danger");
        return;
    }

    // Collect form input values
    const formData = {
        origin_country: document.getElementById("originCountry").value,
        origin_zip: parseInt(document.getElementById("originZip").value) || 110001,
        destination_country: document.getElementById("destinationCountry").value,
        destination_zip: parseInt(document.getElementById("destinationZip").value) || 10001,
        package_type: document.getElementById("packageType").value,
        quantity: parseInt(document.getElementById("packageQuantity").value),
        weight_kg: parseFloat(document.getElementById("weight").value),
        length_cm: parseFloat(document.getElementById("length").value),
        width_cm: parseFloat(document.getElementById("width").value),
        height_cm: parseFloat(document.getElementById("height").value),
        declared_value: parseFloat(document.getElementById("declaredValue").value) || 10000,
        content_type: document.getElementById("packageContent").value,
        service_level: document.getElementById("serviceLevel").value,
        transport_mode: document.getElementById("transportMode").value,
        add_insurance: document.getElementById("insuranceCheck").checked ? 1 : 0,
        signature_required: document.getElementById("signatureCheck").checked ? 1 : 0,
        tracking: document.getElementById("trackingCheck").checked ? 1 : 0
    };

    // Show loading indicator
    showLoadingIndicator(true);

    try {
        // Send POST request to API Gateway
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        // Parse the response
        const data = await response.json();

        if (response.ok && data.success) {
            // Update the UI with the estimated cost
            updateResults(data, formData);
        } else {
            throw new Error(data.error || data.message || "Failed to fetch cost estimation.");
        }
    } catch (error) {
        console.error("Error:", error);
        // Show error message
        showErrorMessage(error.message || "Unable to connect to the server. Please try again later.");
    } finally {
        // Hide loading indicator
        showLoadingIndicator(false);
    }
});

// Validate form inputs
function validateForm() {
    const requiredFields = [
        "originCountry",
        "originZip",
        "destinationCountry",
        "destinationZip",
        "packageType",
        "packageQuantity",
        "weight",
        "length",
        "width",
        "height",
        "declaredValue",
        "packageContent",
        "serviceLevel",
        "transportMode"
    ];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value || field.value.trim() === "") {
            field.classList.add("is-invalid");
            return false;
        } else {
            field.classList.remove("is-invalid");
        }
    }

    // Additional validation for numerical fields
    const numericalFields = ["weight", "length", "width", "height", "packageQuantity", "declaredValue"];
    for (const fieldId of numericalFields) {
        const field = document.getElementById(fieldId);
        const value = parseFloat(field.value);
        if (isNaN(value) || value <= 0) {
            field.classList.add("is-invalid");
            return false;
        } else {
            field.classList.remove("is-invalid");
        }
    }

    return true;
}

// Show loading indicator
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById("estimateInitial");
    const resultsContainer = document.getElementById("estimateResults");
    const calculateBtn = document.getElementById("calculateBtn");

    if (show) {
        loadingIndicator.classList.remove("d-none");
        resultsContainer.classList.add("d-none");
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Calculating...';
        
        loadingIndicator.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="lead mb-0">Calculating shipping cost...</p>
                <p class="small text-muted">Using AI-powered prediction model</p>
            </div>`;
    } else {
        loadingIndicator.classList.add("d-none");
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = '<i class="fas fa-calculator me-2"></i> Calculate Cost';
    }
}

// Update results UI
function updateResults(data, formData) {
    const resultsContainer = document.getElementById("estimateResults");

    // Get current date
    const currentDate = new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
    document.getElementById("estimateDate").textContent = `Generated on ${currentDate}`;

    // Update route summary
    document.getElementById("routeSummary").textContent = 
        `${formData.origin_country} → ${formData.destination_country}`;

    // Update total cost (formatted in INR with Indian numbering)
    document.getElementById("totalCost").textContent = formatINR(data.predicted_cost);

    // Update shipment details
    document.getElementById("resultWeight").textContent = formData.weight_kg;
    document.getElementById("resultService").textContent = formData.service_level;
    document.getElementById("resultTransport").textContent = formData.transport_mode;

    // Show results container with animation
    resultsContainer.classList.remove("d-none");
    resultsContainer.style.animation = "fadeIn 0.5s";

    // Show success message
    showAlert(
        `✅ Successfully calculated shipping cost: ${formatINR(data.predicted_cost)}`, 
        "success"
    );

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show error message
function showErrorMessage(message) {
    const resultsContainer = document.getElementById("estimateResults");
    const loadingIndicator = document.getElementById("estimateInitial");

    loadingIndicator.classList.add("d-none");
    
    resultsContainer.innerHTML = `
        <div class="alert alert-danger">
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-circle fa-2x me-3"></i>
                <div>
                    <h6 class="alert-heading mb-1">Error Calculating Cost</h6>
                    <p class="mb-0">${message}</p>
                    <p class="mb-0 small mt-2">Please check your inputs and try again.</p>
                </div>
            </div>
        </div>
        <div class="text-center mt-3">
            <button class="btn btn-outline-primary" onclick="location.reload()">
                <i class="fas fa-redo me-1"></i> Try Again
            </button>
        </div>`;
    
    resultsContainer.classList.remove("d-none");

    // Show alert
    showAlert(message, "danger");
}

// Show Bootstrap alert
function showAlert(message, type) {
    // Check if alert container exists, if not create one
    let alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) {
        alertContainer = document.createElement("div");
        alertContainer.id = "alertContainer";
        alertContainer.className = "position-fixed top-0 end-0 p-3";
        alertContainer.style.zIndex = "9999";
        document.body.appendChild(alertContainer);
    }

    const alertId = `alert-${Date.now()}`;
    const iconClass = type === 'success' ? 'check-circle' : 
                     type === 'danger' ? 'exclamation-triangle' : 
                     'info-circle';
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show shadow-lg" role="alert">
            <i class="fas fa-${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    
    alertContainer.insertAdjacentHTML("beforeend", alertHTML);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.classList.remove("show");
            setTimeout(() => alert.remove(), 150);
        }
    }, 5000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fa-rupee-sign {
        font-size: 0.9em;
    }
`;
document.head.appendChild(style);

// Button handlers
document.addEventListener('DOMContentLoaded', function() {
    // Create Shipment button
    const createShipmentBtn = document.getElementById("createShipmentBtn");
    if (createShipmentBtn) {
        createShipmentBtn.addEventListener("click", function() {
            showAlert("Redirecting to shipment creation...", "info");
            setTimeout(() => {
                window.location.href = "add-shipment.html";
            }, 1000);
        });
    }

    // Download PDF button
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", function() {
            showAlert("📄 PDF download feature will be available soon!", "info");
        });
    }

    // Reset form handler
    document.getElementById("costEstimationForm").addEventListener("reset", function() {
        document.getElementById("estimateResults").classList.add("d-none");
        document.getElementById("estimateInitial").classList.remove("d-none");
        document.getElementById("estimateInitial").innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-calculator fa-3x text-muted mb-3"></i>
                <p class="lead mb-0">Fill in the details and calculate to see cost estimates</p>
                <p class="small text-muted mt-2">All costs will be displayed in Indian Rupees (₹)</p>
            </div>`;
        
        // Remove validation classes
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    });
    
    // Update declared value placeholder based on origin country
    const originCountry = document.getElementById('originCountry');
    const declaredValue = document.getElementById('declaredValue');
    
    originCountry.addEventListener('change', function() {
        if (this.value === 'India') {
            declaredValue.placeholder = 'e.g., 10000 (₹10,000)';
        } else {
            declaredValue.placeholder = 'e.g., 10000 (in ₹)';
        }
    });
});

console.log("✅ Cost Estimation Module Loaded (INR Version)");
console.log("📡 API Endpoint:", API_URL);
console.log("💱 Currency: Indian Rupees (₹)");
console.log("🕒 Loaded at:", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));