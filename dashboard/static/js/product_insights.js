// Object to store chart instances
const productCharts = {};

// Function to destroy a chart if it exists
function destroyProductChart(chartKey) {
    if (productCharts[chartKey] && typeof productCharts[chartKey].destroy === 'function') {
        productCharts[chartKey].destroy();
        delete productCharts[chartKey];
        console.log(`Chart ${chartKey} destroyed successfully.`);
    } else {
        console.log(`Chart ${chartKey} not found or already destroyed.`);
    }
}

// Function to truncate labels to a specified length
function truncateLabel(label, maxLength = 20) {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
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
    }
};

// Options for Top Products by Revenue chart (Bar Chart)
const topProductsRevenueOptions = {
    ...commonOptions,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#000',
                font: { family: 'Roboto', size: 12 },
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#000',
                font: { family: 'Roboto', size: 14 },
                text: 'Product'
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderDash: [5, 5]
            },
            ticks: {
                color: '#000',
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true
            },
            title: {
                display: true,
                color: '#000',
                font: { family: 'Roboto', size: 14 },
                text: 'Total Revenue ($)'
            }
        }
    },
    plugins: {
        tooltip: {
            callbacks: {
                title: function(tooltipItems) {
                    const index = tooltipItems[0].dataIndex;
                    return this.chart.options.fullLabels[index]; // Show full product name on hover
                }
            }
        }
    }
};

// Options for Product Quantity Sold Over Time chart (Line Chart)
const quantityOverTimeOptions = {
    ...commonOptions,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#000',
                font: { family: 'Roboto', size: 12 },
                maxTicksLimit: 10,
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#000',
                font: { family: 'Roboto', size: 14 },
                text: 'Month'
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderDash: [5, 5]
            },
            ticks: {
                color: '#000',
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true
            },
            title: {
                display: true,
                color: '#000',
                font: { family: 'Roboto', size: 14 },
                text: 'Quantity Sold'
            }
        }
    }
};

// Function to update the date range note
function updateDateRangeNote(startDate, endDate, dateRangeOption) {
    const noteElement = document.getElementById('dateRangeNote');
    if (noteElement) {
        if (dateRangeOption === 'custom' && startDate && endDate) {
            noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
        } else {
            noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-05-19'} to ${endDate || '2025-05-19'}).`;
        }
        console.log("Date range note updated:", noteElement.textContent);
    } else {
        console.error("Date range note element not found.");
    }
}

// Function to render the Top Products by Revenue chart
function renderTopProductsRevenueChart(data) {
    const topProductsRevenueCanvas = document.getElementById('topProductsRevenueChart');
    if (topProductsRevenueCanvas) {
        let products = data.product_names_revenue;
        let revenues = data.revenue_values;
        console.log("Top Products by Revenue Data:", { products, revenues });

        // Ensure products and revenues are arrays
        if (!Array.isArray(products)) {
            console.warn("product_names_revenue is not an array, using empty array.");
            products = [];
        }
        if (!Array.isArray(revenues)) {
            console.warn("revenue_values is not an array, using empty array.");
            revenues = [];
        }

        // Ensure lengths match by padding with zeros if necessary
        if (products.length !== revenues.length) {
            console.warn(`Length mismatch: products (${products.length}) vs revenues (${revenues.length}). Adjusting...`);
            const maxLength = Math.max(products.length, revenues.length);
            products = products.slice(0, maxLength);
            revenues = revenues.slice(0, maxLength);
            while (revenues.length < maxLength) revenues.push(0);
            while (products.length < maxLength) products.push('');
        }

        // Convert revenues to numbers
        const numericRevenues = revenues.map(val => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        });

        // Truncate product names for display, but keep full names for tooltips
        const truncatedLabels = products.map(label => truncateLabel(label, 20));
        topProductsRevenueOptions.fullLabels = products; // Store full labels for tooltip

        // Destroy existing chart
        destroyProductChart('topProductsRevenueChart');

        // Clear the canvas context to ensure a fresh render
        const ctx = topProductsRevenueCanvas.getContext('2d');
        ctx.clearRect(0, 0, topProductsRevenueCanvas.width, topProductsRevenueCanvas.height);
        console.log("Top Products by Revenue Canvas cleared.");

        // Set canvas dimensions explicitly
        topProductsRevenueCanvas.width = 500;
        topProductsRevenueCanvas.height = 200;
        console.log("Top Products by Revenue Canvas dimensions set:", { width: 500, height: 200 });

        if (products.length > 0 && numericRevenues.length > 0) {
            try {
                productCharts['topProductsRevenueChart'] = new Chart(topProductsRevenueCanvas, {
                    type: 'bar',
                    data: {
                        labels: truncatedLabels, // Use truncated labels
                        datasets: [{
                            label: 'Total Revenue ($)',
                            data: numericRevenues,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderWidth: 0,
                            borderRadius: 5
                        
                        }]
                    },
                    options: topProductsRevenueOptions
                });
                productCharts['topProductsRevenueChart'].update();
                topProductsRevenueCanvas.style.display = 'block';
                console.log("Top Products by Revenue Chart rendered with data:", { labels: truncatedLabels, data: numericRevenues });
            } catch (error) {
                console.error("Error rendering Top Products by Revenue Chart:", error);
                topProductsRevenueCanvas.style.display = 'none';
            }
        } else {
            console.warn("No valid data for Top Products by Revenue Chart after validation.");
            topProductsRevenueCanvas.style.display = 'none';
        }
    } else {
        console.error("Top Products by Revenue Chart canvas not found.");
    }
}

// Function to render the Product Quantity Sold Over Time chart
function renderQuantityOverTimeChart(data) {
    const quantityOverTimeCanvas = document.getElementById('quantityOverTimeChart');
    if (quantityOverTimeCanvas) {
        let months = data.quantity_months;
        let quantities = data.quantity_values;
        console.log("Product Quantity Over Time Data:", { months, quantities });

        // Ensure months and quantities are arrays
        if (!Array.isArray(months)) {
            console.warn("quantity_months is not an array, using empty array.");
            months = [];
        }
        if (!Array.isArray(quantities)) {
            console.warn("quantity_values is not an array, using empty array.");
            quantities = [];
        }

        // Ensure lengths match by padding with zeros if necessary
        if (months.length !== quantities.length) {
            console.warn(`Length mismatch: months (${months.length}) vs quantities (${quantities.length}). Adjusting...`);
            const maxLength = Math.max(months.length, quantities.length);
            months = months.slice(0, maxLength);
            quantities = quantities.slice(0, maxLength);
            while (quantities.length < maxLength) quantities.push(0);
            while (months.length < maxLength) months.push('');
        }

        // Convert quantities to numbers
        const numericQuantities = quantities.map(val => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        });

        // Destroy existing chart
        destroyProductChart('quantityOverTimeChart');

        // Clear the canvas context to ensure a fresh render
        const ctx = quantityOverTimeCanvas.getContext('2d');
        ctx.clearRect(0, 0, quantityOverTimeCanvas.width, quantityOverTimeCanvas.height);
        console.log("Product Quantity Over Time Canvas cleared.");

        // Set canvas dimensions explicitly
        quantityOverTimeCanvas.width = 500;
        quantityOverTimeCanvas.height = 200;
        console.log("Product Quantity Over Time Canvas dimensions set:", { width: 500, height: 200 });

        if (months.length > 0 && numericQuantities.length > 0) {
            try {
                productCharts['quantityOverTimeChart'] = new Chart(quantityOverTimeCanvas, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Quantity Sold',
                            data: numericQuantities,
                            borderColor: 'rgb(0, 0, 0)',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: quantityOverTimeOptions
                });
                productCharts['quantityOverTimeChart'].update();
                quantityOverTimeCanvas.style.display = 'block';
                console.log("Product Quantity Over Time Chart rendered with data:", { labels: months, data: numericQuantities });
            } catch (error) {
                console.error("Error rendering Product Quantity Over Time Chart:", error);
                quantityOverTimeCanvas.style.display = 'none';
            }
        } else {
            console.warn("No valid data for Product Quantity Over Time Chart after validation.");
            quantityOverTimeCanvas.style.display = 'none';
        }
    } else {
        console.error("Product Quantity Over Time Chart canvas not found.");
    }
}

// Function to populate the product dropdown and set up search functionality
function setupProductDropdown(products) {
    const productSearch = document.getElementById('productSearch');
    const productList = document.getElementById('productList');
    let allProducts = ['All Products'].concat(products);
    let filteredProducts = allProducts;

    // Function to render the dropdown list
    function renderDropdownList(items, selectedValue) {
        productList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.setAttribute('data-value', item);
            li.textContent = truncateLabel(item, 30); // Truncate in dropdown as well
            if (item === selectedValue) {
                li.classList.add('selected');
            }
            productList.appendChild(li);
        });
    }

    // Initial render of the dropdown list
    renderDropdownList(allProducts, 'All Products');
    productSearch.value = 'All Products';

    // Show/hide dropdown list on input focus/blur
    productSearch.addEventListener('focus', () => {
        productList.style.display = 'block';
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!productSearch.contains(event.target) && !productList.contains(event.target)) {
            productList.style.display = 'none';
        }
    });

    // Filter products as the user types
    productSearch.addEventListener('input', () => {
        const searchValue = productSearch.value.toLowerCase();
        filteredProducts = allProducts.filter(product => 
            product.toLowerCase().includes(searchValue)
        );
        renderDropdownList(filteredProducts, productSearch.value);
        productList.style.display = 'block';
    });

    // Handle selection by clicking an option
    productList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const selectedProduct = event.target.getAttribute('data-value');
            productSearch.value = selectedProduct;
            productList.style.display = 'none';
            const dateRangeOption = document.getElementById('dateRangeOption').value;
            let startDate = document.getElementById('startDate').value;
            let endDate = document.getElementById('endDate').value;

            if (dateRangeOption === 'last_1_year') {
                startDate = '2024-05-19';
                endDate = '2025-05-19';
            } else if (dateRangeOption === 'custom' && (!startDate || !endDate)) {
                alert('Please select both start and end dates for custom range.');
                return;
            }

            fetchProductInsightsData(1, startDate, endDate, dateRangeOption, selectedProduct);
        }
    });

    // Handle selection by pressing Enter
    productSearch.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const searchValue = productSearch.value.toLowerCase();
            const matchedProduct = allProducts.find(product => 
                product.toLowerCase() === searchValue
            );
            if (matchedProduct) {
                productSearch.value = matchedProduct;
                productList.style.display = 'none';
                const dateRangeOption = document.getElementById('dateRangeOption').value;
                let startDate = document.getElementById('startDate').value;
                let endDate = document.getElementById('endDate').value;

                if (dateRangeOption === 'last_1_year') {
                    startDate = '2024-05-19';
                    endDate = '2025-05-19';
                } else if (dateRangeOption === 'custom' && (!startDate || !endDate)) {
                    alert('Please select both start and end dates for custom range.');
                    return;
                }

                fetchProductInsightsData(1, startDate, endDate, dateRangeOption, matchedProduct);
            } else if (filteredProducts.length > 0) {
                productSearch.value = filteredProducts[0];
                productList.style.display = 'none';
                fetchProductInsightsData(1, startDate, endDate, dateRangeOption, filteredProducts[0]);
            }
        }
    });
}

// Fetch product insights data and populate charts
function fetchProductInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year', selectedProduct = null) {
    console.log("Fetching product insights data with parameters:", { page, startDate, endDate, dateRangeOption, selectedProduct });

    let url = `/product_insights_data/?page=${page}`;
    if (startDate) {
        url += `&start_date=${startDate}`;
    }
    if (endDate) {
        url += `&end_date=${endDate}`;
    }
    url += `&date_range_option=${dateRangeOption}`;
    if (selectedProduct && selectedProduct !== 'All Products') {
        url += `&product=${encodeURIComponent(selectedProduct)}`;
    }
    console.log("Fetching URL:", url);

    fetch(url)
        .then(response => {
            console.log("API Response Status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text().then(text => {
                console.log("Raw API Response:", text);
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse JSON response:", text);
                    throw new Error("Invalid JSON response from server.");
                }
            });
        })
        .then(data => {
            console.log("Parsed Product insights data:", data);

            if (!data || typeof data !== 'object') {
                console.error("Invalid data format received:", data);
                throw new Error("Invalid data format received from server.");
            }

            if (data.error) {
                console.error("Error fetching product insights data:", data.error);
                const errorDiv = document.getElementById('error');
                if (errorDiv) {
                    errorDiv.textContent = data.error;
                    errorDiv.style.display = 'block';
                }
                const topProductsCanvas = document.getElementById('topProductsRevenueChart');
                const quantityCanvas = document.getElementById('quantityOverTimeChart');
                if (topProductsCanvas) topProductsCanvas.style.display = 'none';
                if (quantityCanvas) quantityCanvas.style.display = 'none';
                return;
            }

            const requiredFields = ['product_names_revenue', 'revenue_values', 'quantity_months', 'quantity_values', 'product_list'];
            for (const field of requiredFields) {
                if (!(field in data)) {
                    console.error(`Missing required field in response: ${field}`);
                    throw new Error(`Missing required field in response: ${field}`);
                }
            }

            console.log("Product List Length:", data.product_list.length);
            console.log("Top Products by Revenue Data Length:", data.product_names_revenue.length);
            console.log("Quantity Over Time Data Length:", data.quantity_months.length);

            if (!selectedProduct) {
                setupProductDropdown(data.product_list);
            }

            updateDateRangeNote(startDate, endDate, dateRangeOption);

            if (data.product_names_revenue.length > 0) {
                renderTopProductsRevenueChart(data);
            } else {
                console.warn("No data for Top Products by Revenue Chart.");
                const canvas = document.getElementById('topProductsRevenueChart');
                if (canvas) canvas.style.display = 'none';
            }

            if (data.quantity_months.length > 0) {
                renderQuantityOverTimeChart(data);
            } else {
                console.warn("No data for Product Quantity Over Time Chart.");
                const canvas = document.getElementById('quantityOverTimeChart');
                if (canvas) canvas.style.display = 'none';
            }

            window.dispatchEvent(new Event('resize'));
            console.log("Triggered window resize to force chart refresh.");

            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error("Error fetching product insights data:", error);
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.textContent = `Failed to load product insights data: ${error.message}`;
                errorDiv.style.display = 'block';
            }
            const topProductsCanvas = document.getElementById('topProductsRevenueChart');
            const quantityCanvas = document.getElementById('quantityOverTimeChart');
            if (topProductsCanvas) topProductsCanvas.style.display = 'none';
            if (quantityCanvas) quantityCanvas.style.display = 'none';
            window.scrollTo(0, 0);
        });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing product insights...");

    const defaultStartDate = '2024-05-19';
    const defaultEndDate = '2025-05-19';
    fetchProductInsightsData(1, defaultStartDate, defaultEndDate, 'last_1_year');
    console.log("Initial fetch completed with default range.");

    const applyFiltersButton = document.getElementById('applyFilters');
    if (applyFiltersButton) {
        console.log("Apply Filters button found, attaching listener.");
        applyFiltersButton.addEventListener('click', () => {
            console.log("Apply Filters button clicked.");
            const dateRangeOption = document.getElementById('dateRangeOption').value;
            let startDate = document.getElementById('startDate').value;
            let endDate = document.getElementById('endDate').value;
            const selectedProduct = document.getElementById('productSearch').value || 'All Products';

            console.log("Captured filter parameters:", { dateRangeOption, startDate, endDate, selectedProduct });

            if (dateRangeOption === 'last_1_year') {
                startDate = '2024-05-19';
                endDate = '2025-05-19';
                console.log("Last 1 Year selected, setting dates:", { startDate, endDate });
            } else if (dateRangeOption === 'custom') {
                if (!startDate || !endDate) {
                    alert('Please select both start and end dates for custom range.');
                    console.log("Custom range selected but startDate or endDate missing.");
                    return;
                }
                if (new Date(startDate) > new Date(endDate)) {
                    alert('Start date must be before end date.');
                    console.log("Validation failed: Start date is after end date.");
                    return;
                }
                console.log("Custom range selected with dates:", { startDate, endDate });
            }

            console.log("Calling fetchProductInsightsData with final parameters:", { page: 1, startDate, endDate, dateRangeOption, selectedProduct });
            fetchProductInsightsData(1, startDate, endDate, dateRangeOption, selectedProduct);
        });
    } else {
        console.error("Apply Filters button not found. Check HTML for 'applyFilters' ID.");
    }
});