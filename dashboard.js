/**
 * IntelliLogistics - Logistics Management System
 * Dashboard JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard charts
    initializeShipmentVolumeChart();
    initializeShipmentStatusChart();
    
    // Set up dashboard interactivity
    setupDashboardInteractivity();
    
    // Initialize data counters
    initializeCounters();
    
    // Setup timeRange dropdown functionality
    setupTimeRangeFilter();
});

/**
 * Initialize the Shipment Volume Chart
 */
function initializeShipmentVolumeChart() {
    const ctx = document.getElementById('shipmentVolumeChart');
    
    if (!ctx) return; // Exit if element doesn't exist
    
    // Sample data for shipment volume over time
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
            {
                label: 'Domestic Shipments',
                data: [65, 59, 80, 81, 56, 55, 72, 78, 82, 85],
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 0.7)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb'
            },
            {
                label: 'International Shipments',
                data: [28, 48, 40, 19, 34, 27, 30, 42, 35, 40],
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.7)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }
        ]
    };
    
    // Chart configuration
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    padding: 10,
                    cornerRadius: 4,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    titleColor: '#ffffff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' shipments';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#64748b'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(226, 232, 240, 0.6)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#64748b',
                        padding: 10
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    borderWidth: 2
                },
                point: {
                    hoverRadius: 6,
                    hoverBorderWidth: 2
                }
            }
        }
    };
    
    // Create the chart
    new Chart(ctx, config);
    
    // Add animation
    ctx.classList.add('fade-in');
}

/**
 * Initialize the Shipment Status Chart
 */
function initializeShipmentStatusChart() {
    const ctx = document.getElementById('shipmentStatusChart');
    
    if (!ctx) return; // Exit if element doesn't exist
    
    // Sample data for shipment status distribution
    const data = {
        labels: ['Delivered', 'In Transit', 'Processing', 'Delayed', 'Returned'],
        datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
                '#10b981', // Delivered - Green
                '#2563eb', // In Transit - Blue
                '#f97316', // Processing - Orange
                '#f59e0b', // Delayed - Amber
                '#ef4444'  // Returned - Red
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 10
        }]
    };
    
    // Chart configuration
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    padding: 10,
                    cornerRadius: 4,
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return `${context.label}: ${value} (${percentage})`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    };
    
    // Create the chart
    new Chart(ctx, config);
    
    // Add animation
    ctx.classList.add('fade-in');
}

/**
 * Setup dashboard interactivity
 */
function setupDashboardInteractivity() {
    // Add click handlers for action buttons in the recent shipments table
    const actionButtons = document.querySelectorAll('.table .btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Get action type from button class
            if (button.classList.contains('btn-outline-primary')) {
                // View action - show shipment details
                showShipmentDetails(button.closest('tr').querySelector('td:first-child').textContent);
            } else if (button.classList.contains('btn-outline-secondary')) {
                // Edit action - navigate to edit form
                editShipment(button.closest('tr').querySelector('td:first-child').textContent);
            }
        });
    });
}

/**
 * Show shipment details in a modal
 * @param {string} trackingId - Shipment tracking ID
 */
function showShipmentDetails(trackingId) {
    // In a real application, this would fetch details from API
    // For this demo, we'll show a notification
    showNotification(`Viewing details for shipment ${trackingId}`, 'info');
    
    // Placeholder for modal functionality
    // In a real implementation, create a Bootstrap modal with shipment details
    
    // Sample code to create modal (would be implemented with real data):
    /*
    const modalHtml = `
        <div class="modal fade" id="shipmentDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Shipment Details: ${trackingId}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="shipment-details">
                            <!-- Details would be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and show the modal
    const modal = new bootstrap.Modal(document.getElementById('shipmentDetailModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('shipmentDetailModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    */
}

/**
 * Navigate to edit shipment page
 * @param {string} trackingId - Shipment tracking ID
 */
function editShipment(trackingId) {
    showNotification(`Editing shipment ${trackingId}`, 'info');
    // In a real application, this would navigate to the edit page
    // window.location.href = `edit-shipment.html?id=${trackingId}`;
}

/**
 * Initialize animated counters for dashboard stats
 */
function initializeCounters() {
    const counterElements = document.querySelectorAll('#totalShipments, #onTimeDelivery, #averageCost, #activeRoutes');
    
    counterElements.forEach(element => {
        const target = element.innerText;
        const suffix = target.includes('%') ? '%' : (target.includes('$') ? '$' : '');
        let start = 0;
        const duration = 1500; // milliseconds
        const interval = 30; // milliseconds
        
        // Extract the numeric value
        const targetValue = parseFloat(target.replace(/[^0-9.-]+/g, ''));
        const increment = targetValue / (duration / interval);
        
        // Start the animation
        const timer = setInterval(() => {
            start += increment;
            
            if (start >= targetValue) {
                element.innerText = suffix + targetValue.toString();
                clearInterval(timer);
            } else {
                if (suffix === '%' || suffix === '$') {
                    element.innerText = suffix + Math.floor(start).toString();
                } else {
                    element.innerText = Math.floor(start).toString();
                }
            }
        }, interval);
    });
}

/**
 * Setup time range filter functionality
 */
function setupTimeRangeFilter() {
    const timeRangeDropdown = document.getElementById('timeRange');
    const dropdownItems = document.querySelectorAll('[data-range]');
    
    if (!timeRangeDropdown || !dropdownItems.length) return;
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Get the range value
            const range = this.getAttribute('data-range');
            
            // Update dropdown button text
            timeRangeDropdown.innerText = this.innerText;
            
            // Here you would update the dashboard data based on the selected range
            updateDashboardData(range);
        });
    });
}

/**
 * Update dashboard data based on time range
 * @param {string} range - Time range in days
 */
function updateDashboardData(range) {
    // Show loading state
    showNotification(`Loading data for the last ${range} days...`, 'info');
    
    // In a real application, this would make an API call to fetch new data
    // For this demo, we'll simulate a data update after a delay
    setTimeout(() => {
        // Simulate data update
        if (range === '7') {
            document.getElementById('totalShipments').innerText = '245';
            document.getElementById('onTimeDelivery').innerText = '92%';
        } else if (range === '30') {
            document.getElementById('totalShipments').innerText = '982';
            document.getElementById('onTimeDelivery').innerText = '89%';
        } else if (range === '90') {
            document.getElementById('totalShipments').innerText = '2,854';
            document.getElementById('onTimeDelivery').innerText = '91%';
        }
        
        // Re-initialize counters
        initializeCounters();
        
        // Show success notification
        showNotification('Dashboard updated successfully', 'success');
    }, 1000);
}