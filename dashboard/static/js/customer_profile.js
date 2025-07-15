// Object to store chart instance
let ltvChart = null;

// Function to destroy the chart if it exists
function destroyLtvChart() {
    if (ltvChart && typeof ltvChart.destroy === 'function') {
        ltvChart.destroy();
        ltvChart = null;
        console.log("LTV chart destroyed.");
    }
}

// Common Chart.js options for consistent styling
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, family: 'Roboto' },
            bodyFont: { size: 12, family: 'Roboto' },
            padding: 10,
            cornerRadius: 5
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#6c757d',
                font: { family: 'Roboto', size: 12 },
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#6c757d',
                font: { family: 'Roboto', size: 14 },
                text: 'Time Period'
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderDash: [5, 5]
            },
            ticks: {
                color: '#6c757d',
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true,
                callback: function(value) {
                    return '$' + value.toFixed(2);
                }
            },
            title: {
                display: true,
                color: '#6c757d',
                font: { family: 'Roboto', size: 14 },
                text: 'LTV'
            }
        }
    }
};

// Function to fetch customer profile data and update the UI
function fetchCustomerProfileData(customerName = null) {
    console.log("Fetching customer profile data for:", customerName || "all customers");

    // Build the URL with query parameters
    let url = '/customer_profile_data/';
    if (customerName) {
        url += `?customer_name=${encodeURIComponent(customerName)}`;
    }
    console.log("Fetching URL:", url);

    fetch(url)
        .then(response => {
            console.log("API Response Status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Customer profile data received:", data);

            if (data.error) {
                console.error("Error fetching customer profile data:", data.error);
                const errorDiv = document.getElementById('error');
                if (errorDiv) {
                    errorDiv.textContent = data.error;
                    errorDiv.style.display = 'block';
                }
                return;
            }

            if (data.customers) {
                // Populate the customer dropdown
                const customerSelect = document.getElementById('customerSelect');
                if (customerSelect) {
                    customerSelect.innerHTML = '<option value="">-- Select a Customer --</option>';
                    data.customers.forEach(customer => {
                        const option = document.createElement('option');
                        option.value = customer;
                        option.textContent = customer;
                        customerSelect.appendChild(option);
                    });
                    console.log("Customer dropdown populated with:", data.customers);
                } else {
                    console.error("Customer select element not found.");
                }
            } else {
                // Display the customer profile
                const customerProfile = document.getElementById('customerProfile');
                if (customerProfile) {
                    customerProfile.style.display = 'block';
                } else {
                    console.error("Customer profile element not found.");
                }

                // Customer Details
                document.getElementById('customerName').textContent = data.customer_name || 'N/A';
                document.getElementById('customerEmail').textContent = data.customer_email || 'N/A';
                document.getElementById('firstOrderDate').textContent = data.first_order_date || 'N/A';
                document.getElementById('lastOrderDate').textContent = data.last_order_date || 'N/A';
                document.getElementById('rfmStatus').textContent = data.rfm_segment || 'Unknown';

                // Retention Metrics with validation
                const ltv = typeof data.ltv === 'number' ? data.ltv : 0;
                const lifetimeMonths = typeof data.lifetime_months === 'number' ? data.lifetime_months : 0;
                const avgDaysBetweenOrders = typeof data.avg_days_between_orders === 'number' ? data.avg_days_between_orders : 0;
                const churnRate = typeof data.churn_rate === 'number' ? data.churn_rate : 0;

                document.getElementById('ltv').textContent = `$${ltv.toFixed(2)}`;
                document.getElementById('lifetime').textContent = `${lifetimeMonths.toFixed(2)} months`;
                document.getElementById('avgDaysBetweenOrders').textContent = `${avgDaysBetweenOrders.toFixed(2)} days`;
                document.getElementById('estNextOrderDate').textContent = data.est_next_order_date || 'N/A';
                document.getElementById('churnRate').textContent = `${churnRate.toFixed(2)}%`;

                // Badges
                document.getElementById('ltvBadge').style.display = data.is_top_10_ltv ? 'block' : 'none';
                document.getElementById('lifetimeBadge').style.display = data.is_top_10_lifetime ? 'block' : 'none';

                // Overdue Badge (compare with current date dynamically)
                const estNextOrderDate = data.est_next_order_date && data.est_next_order_date !== 'N/A' ? new Date(data.est_next_order_date) : null;
                const currentDate = new Date(); // Use the actual current date
                console.log("Checking overdue status:", { estNextOrderDate, currentDate });
                document.getElementById('overdueBadge').style.display = estNextOrderDate && estNextOrderDate < currentDate ? 'block' : 'none';

                // LTV Graph with validation
                const ltvOverTime = data.ltv_over_time || {};
                const ltvGraphData = [
                    ltvOverTime['30_days'] || 0,
                    ltvOverTime['90_days'] || 0,
                    ltvOverTime['1_year'] || 0,
                    ltvOverTime['2_years'] || 0,
                    ltvOverTime['5_years'] || 0
                ];
                console.log("LTV Graph Data:", ltvGraphData);

                const ltvGraphCanvas = document.getElementById('ltvGraph');
                if (ltvGraphCanvas) {
                    destroyLtvChart();
                    ltvChart = new Chart(ltvGraphCanvas.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: ['LTV 30 Days', 'LTV 90 Days', 'LTV 1 Year', 'LTV 2 Years', 'LTV 5 Years'],
                            datasets: [{
                                label: 'LTV',
                                data: ltvGraphData,
                                borderColor: '#42A5F5',
                                backgroundColor: 'rgba(66, 165, 245, 0.2)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointBackgroundColor: '#42A5F5'
                            }]
                        },
                        options: commonOptions
                    });
                    ltvGraphCanvas.style.display = 'block';
                    console.log("LTV chart rendered.");
                } else {
                    console.error("LTV graph canvas not found.");
                }

                // Scroll to top
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            console.error("Error fetching customer profile data:", error);
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.textContent = `Failed to load customer profile data: ${error.message}`;
                errorDiv.style.display = 'block';
            } else {
                console.error("Error div not found.");
            }
            window.scrollTo(0, 0);
        });
}

// Initial fetch to populate the customer dropdown
window.addEventListener('load', () => {
    console.log("Window loaded, initializing customer profile...");
    setTimeout(() => {
        fetchCustomerProfileData();
        window.scrollTo(0, 0);

        // Add event listener for the customer dropdown
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.addEventListener('change', () => {
                const selectedCustomer = customerSelect.value;
                console.log("Customer selected:", selectedCustomer);
                if (selectedCustomer) {
                    fetchCustomerProfileData(selectedCustomer);
                } else {
                    const customerProfile = document.getElementById('customerProfile');
                    if (customerProfile) {
                        customerProfile.style.display = 'none';
                    }
                }
            });
        } else {
            console.error("Customer select element not found on load.");
        }
    }, 100);
});