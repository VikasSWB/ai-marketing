// Object to store chart instances
let rfmSegmentChart = null;
let activeCustomersChart = null;
let aovChart = null;
let churnRiskChart = null;

// Function to destroy charts if they exist
function destroyCharts() {
    if (rfmSegmentChart && typeof rfmSegmentChart.destroy === 'function') {
        rfmSegmentChart.destroy();
        rfmSegmentChart = null;
        console.log("RFM Segment Chart destroyed.");
    }
    if (activeCustomersChart && typeof activeCustomersChart.destroy === 'function') {
        activeCustomersChart.destroy();
        activeCustomersChart = null;
        console.log("Active Customers Chart destroyed.");
    }
    if (aovChart && typeof aovChart.destroy === 'function') {
        aovChart.destroy();
        aovChart = null;
        console.log("AOV Chart destroyed.");
    }
    if (churnRiskChart && typeof churnRiskChart.destroy === 'function') {
        churnRiskChart.destroy();
        churnRiskChart = null;
        console.log("Churn Risk Chart destroyed.");
    }
}

// Common Chart.js options for consistent styling
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, family: 'Roboto' },
            bodyFont: { size: 12, family: 'Roboto' },
            padding: 10,
            cornerRadius: 5
        }
    }
};

// Function to update the date range note
function updateDateRangeNote(startDate, endDate, dateRangeOption) {
    const noteElement = document.getElementById('dateRangeNote');
    if (noteElement) {
        if (dateRangeOption === 'all' && !startDate && !endDate) {
            noteElement.textContent = 'Showing all data.';
        } else if (startDate && endDate) {
            noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
        } else {
            noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-05-26'} to ${endDate || '2025-05-26'}).`;
        }
        console.log("Date range note updated:", noteElement.textContent);
    } else {
        console.error("Date range note element not found.");
    }
}

// Function to fetch paginated customer data for a specific segment and page
function fetchCustomerData(segment, page, filterSegment, startDate, endDate, dateRangeOption) {
    let url = `/rfm-churn-visualizations-data/?segment=${encodeURIComponent(segment)}&page=${page}`;
    if (filterSegment && filterSegment !== 'All') {
        url += `&filter_segment=${encodeURIComponent(filterSegment)}`;
    }
    if (startDate) {
        url += `&start_date=${startDate}`;
    }
    if (endDate) {
        url += `&end_date=${endDate}`;
    }
    url += `&date_range_option=${dateRangeOption}`;
    console.log("Fetching customer data URL:", url);

    return fetch(url)
        .then(response => {
            console.log("Customer data API Response Status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("Error fetching customer data:", data.error);
                throw new Error(data.error);
            }
            console.log("Customer data received:", data);
            return data;
        });
}

// Function to render a customer table for a segment
function renderCustomerTable(segment, customers, pagination, filterSegment, startDate, endDate, dateRangeOption) {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-striped mt-3';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Name', 'Email', 'Recency (days)', 'Frequency', 'Monetary ($)', 'Churned', 'Recommended Action'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    customers.forEach(customer => {
        const row = document.createElement('tr');
        const cells = [
            customer.customer_name,
            customer.customer_email || 'N/A',
            customer.recency,
            customer.frequency,
            customer.monetary.toFixed(2),
            customer.Churn,
            customer['Recommended Action']
        ];
        cells.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Pagination controls
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls d-flex justify-content-end mt-2';

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.current_page} of ${pagination.total_pages} (${pagination.total_items} customers)`;
    pageInfo.className = 'mr-2 align-self-center';
    paginationDiv.appendChild(pageInfo);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'btn btn-outline-secondary btn-sm mr-1';
    prevButton.disabled = pagination.current_page === 1;
    prevButton.addEventListener('click', () => {
        if (pagination.current_page > 1) {
            fetchCustomerData(segment, pagination.current_page - 1, filterSegment, startDate, endDate, dateRangeOption).then(data => {
                const segmentDiv = document.getElementById(`segment-${segment.replace(/\s+/g, '-')}`);
                segmentDiv.querySelector('.table').remove();
                segmentDiv.querySelector('.pagination-controls').remove();
                const newTable = renderCustomerTable(segment, data.customer_data[segment], data.pagination_data[segment], filterSegment, startDate, endDate, dateRangeOption);
                segmentDiv.appendChild(newTable);
            });
        }
    });
    paginationDiv.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'btn btn-outline-secondary btn-sm';
    nextButton.disabled = pagination.current_page === pagination.total_pages;
    nextButton.addEventListener('click', () => {
        if (pagination.current_page < pagination.total_pages) {
            fetchCustomerData(segment, pagination.current_page + 1, filterSegment, startDate, endDate, dateRangeOption).then(data => {
                const segmentDiv = document.getElementById(`segment-${segment.replace(/\s+/g, '-')}`);
                segmentDiv.querySelector('.table').remove();
                segmentDiv.querySelector('.pagination-controls').remove();
                const newTable = renderCustomerTable(segment, data.customer_data[segment], data.pagination_data[segment], filterSegment, startDate, endDate, dateRangeOption);
                segmentDiv.appendChild(newTable);
            });
        }
    });
    paginationDiv.appendChild(nextButton);

    const container = document.createElement('div');
    container.appendChild(table);
    container.appendChild(paginationDiv);
    return container;
}

// Function to render Churn Risk by Segment Chart
// function renderChurnRiskChart(churnBySegment) {
//     const labels = Object.keys(churnBySegment);
//     // const values = Object.values(churnBySegment).map(v => Math.round(v * 100));  // Convert to %
//      const values = Object.values(churnBySegment);  // Already in %
//     const ctx = document.getElementById('churnRiskChart').getContext('2d');

//     if (churnRiskChart) {
//         churnRiskChart.destroy();
//     }

//     churnRiskChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Avg Churn Risk (%)',
//                 data: values,
//                 backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                 borderColor: 'rgb(0, 0, 0)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     max: 100,
//                     title: {
//                         display: true,
//                         text: 'Churn Probability (%)'
//                     }
//                 }
//             },
//             plugins: {
//                 legend: { display: false },
//                 title: {
//                     display: true,
//                     text: 'Churn Risk by Segment',
//                     font: {
//                         size: 13
//                     }
//                 }
//             }
//         }
//     });
//     console.log("Churn Risk Chart rendered.");
// }

// Function to render Churn Risk by Segment Chart
function renderChurnRiskChart(churnBySegment) {
    const labels = Object.keys(churnBySegment);
    const values = Object.values(churnBySegment);  // Already in %

    const ctx = document.getElementById('churnRiskChart').getContext('2d');

    if (churnRiskChart) {
        churnRiskChart.destroy();
    }

    churnRiskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Churn Risk (%)',
                data: values,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Churn Probability (%)',
                        color: '#000'  // ✅ Y-axis title text color
                    },
                    ticks: {
                        color: '#000'  // ✅ Y-axis labels color
                    }
                },
                x: {
                    ticks: {
                        color: '#000'  // ✅ X-axis labels color
                    },
                    title: {
                        display: false
                        // You can enable this if needed:
                        // text: 'Customer Segment',
                        // color: '#000'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Churn Risk by Segment',
                    font: {
                        size: 13
                    },
                    color: '#000000'  // ✅ Chart title color
                }
            }
        }
    });

    console.log("Churn Risk Chart rendered.");
}



// Function to fetch visualization data and render charts
function fetchVisualizationData(filterSegment = null, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
    console.log("Fetching RFM, active customers/orders, AOV, and recommendations data with parameters:", { filterSegment, startDate, endDate, dateRangeOption });

    let url = '/rfm-churn-visualizations-data/';
    const params = new URLSearchParams();
    if (filterSegment && filterSegment !== 'All') {
        params.append('filter_segment', filterSegment);
    }
    if (startDate) {
        params.append('start_date', startDate);
    }
    if (endDate) {
        params.append('end_date', endDate);
    }
    params.append('date_range_option', dateRangeOption);
    if (params.toString()) {
        url += `?${params.toString()}`;
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
            console.log("Visualization data received:", data);

            if (data.error) {
                console.error("Error fetching visualization data:", data.error);
                const errorDiv = document.getElementById('error');
                if (errorDiv) {
                    errorDiv.textContent = data.error;
                    errorDiv.style.display = 'block';
                }
                return;
            }

            // Destroy existing charts
            destroyCharts();

            // Update the date range note
            updateDateRangeNote(startDate, endDate, dateRangeOption);

            // RFM Segment Pie Chart
            const rfmSegmentCanvas = document.getElementById('rfmSegmentChart');
            const rfmSegmentContainer = rfmSegmentCanvas ? rfmSegmentCanvas.parentElement : null;
            if (rfmSegmentCanvas && rfmSegmentContainer) {
                // Check if segment data is empty (all values are 0)
                const totalSegments = data.segment_data.values.reduce((sum, value) => sum + value, 0);
                if (totalSegments === 0) {
                    rfmSegmentContainer.innerHTML = '<p class="text-center text-muted">No RFM segment data available for the selected period.</p>';
                    console.log("RFM Segment Chart not rendered: No data available.");
                } else {
                    rfmSegmentChart = new Chart(rfmSegmentCanvas.getContext('2d'), {
                        type: 'pie',
                        data: {
                            labels: data.segment_data.labels,
                            datasets: [{
                                data: data.segment_data.values,
                                backgroundColor: [
                                    '#000000', // Loyal Customer (Black)
                                    '#333333', // Active Customer (Dark Gray)
                                    '#666666', // Average Customer (Medium Gray)
                                    '#999999', // At Risk (Light Gray)
                                    '#CCCCCC'  // New Customer (Very Light Gray)
                                ],
                                borderColor: '#FFFFFF', // White borders for contrast
                                borderWidth: 1
                            }]
                        },
                        options: {
                            ...commonOptions,
                            plugins: {
                                ...commonOptions.plugins,
                                legend: {
                                    display: true,
                                    position: 'right',
                                    labels: {
                                        font: { family: 'Roboto', size: 12 },
                                        color: '#000000' // Black legend text
                                    }
                                }
                            }
                        }
                    });
                    console.log("RFM Segment Chart rendered.");
                }
            } else {
                console.error("RFM Segment Chart canvas or container not found.");
            }

            // Active Customers and Orders Chart
            const activeCustomersCanvas = document.getElementById('activeCustomersChart');
            if (activeCustomersCanvas) {
                const labels = data.active_customers_data.labels;
                const displayLabels = labels.map((label, index) => {
                    if (label.endsWith('-01') || label === labels[0]) {
                        return label;
                    }
                    return '';
                });

                activeCustomersChart = new Chart(activeCustomersCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Active Customers',
                                data: data.active_customers_data.active_customers,
                                backgroundColor: 'rgba(0, 0, 0, 0.2)', // Black fill with transparency
                                borderColor: '#000000', // Black line
                                fill: true,
                                tension: 0.4,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Total Orders',
                                data: data.active_customers_data.orders,
                                borderColor: '#666666', // Medium Gray line
                                backgroundColor: 'rgba(102, 102, 102, 0.1)', // Medium Gray fill
                                fill: false,
                                tension: 0.4,
                                yAxisID: 'y1',
                                pointRadius: 3,
                                pointBackgroundColor: '#666666' // Medium Gray points
                            }
                        ]
                    },
                    options: {
                        ...commonOptions,
                        plugins: {
                            ...commonOptions.plugins,
                            annotation: labels.includes('2024-11') ? {
                                annotations: {
                                    label1: {
                                        type: 'label',
                                        xValue: '2024-11',
                                        yValue: data.active_customers_data.active_customers[labels.indexOf('2024-11')],
                                        content: ['Surge in active customers'],
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        color: 'white',
                                        font: { size: 12, family: 'Roboto' },
                                        position: 'center',
                                        yAdjust: -20
                                    }
                                }
                            } : {}
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: '#000000', // Black ticks
                                    font: { family: 'Roboto', size: 12 },
                                    maxRotation: 45,
                                    minRotation: 45,
                                    callback: function(value, index) {
                                        return displayLabels[index];
                                    }
                                },
                                title: {
                                    display: true,
                                    color: '#000000', // Black title
                                    font: { family: 'Roboto', size: 14 },
                                    text: 'Year-Month'
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)', // Black grid lines
                                    borderDash: [5, 5]
                                },
                                ticks: {
                                    color: '#000000', // Black ticks
                                    font: { family: 'Roboto', size: 12 },
                                    beginAtZero: true
                                },
                                title: {
                                    display: true,
                                    color: '#000000', // Black title
                                    font: { family: 'Roboto', size: 14 },
                                    text: 'Active Customers'
                                }
                            },
                            y1: {
                                position: 'right',
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: '#000000', // Black ticks
                                    font: { family: 'Roboto', size: 12 },
                                    beginAtZero: true
                                },
                                title: {
                                    display: true,
                                    color: '#000000', // Black title
                                    font: { family: 'Roboto', size: 14 },
                                    text: 'Total Orders'
                                }
                            }
                        }
                    }
                });
                console.log("Active Customers Chart rendered.");
            } else {
                console.error("Active Customers Chart canvas not found.");
            }

            // Average Order Value Over Time Chart
            const aovCanvas = document.getElementById('aovChart');
            if (aovCanvas) {
                const labels = data.active_customers_data.labels;
                const displayLabels = labels.map((label, index) => {
                    if (label.endsWith('-01') || label === labels[0]) {
                        return label;
                    }
                    return '';
                });

                aovChart = new Chart(aovCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Average Order Value ($)',
                            data: data.active_customers_data.avg_order_value,
                            borderColor: '#000000', // Black line
                            backgroundColor: 'rgba(0, 0, 0, 0.1)', // Black fill with transparency
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointBackgroundColor: '#000000' // Black points
                        }]
                    },
                    options: {
                        ...commonOptions,
                        plugins: {
                            ...commonOptions.plugins,
                            annotation: labels.includes('2024-11') ? {
                                annotations: {
                                    label1: {
                                        type: 'label',
                                        xValue: '2024-11',
                                        yValue: data.active_customers_data.avg_order_value[labels.indexOf('2024-11')],
                                        content: ['AOV after customer surge'],
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        color: 'white',
                                        font: { size: 12, family: 'Roboto' },
                                        position: 'center',
                                        yAdjust: -20
                                    }
                                }
                            } : {}
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: '#000000', // Black ticks
                                    font: { family: 'Roboto', size: 12 },
                                    maxRotation: 45,
                                    minRotation: 45,
                                    callback: function(value, index) {
                                        return displayLabels[index];
                                    }
                                },
                                title: {
                                    display: true,
                                    color: '#000000', // Black title
                                    font: { family: 'Roboto', size: 14 },
                                    text: 'Year-Month'
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)', // Black grid lines
                                    borderDash: [5, 5]
                                },
                                ticks: {
                                    color: '#000000', // Black ticks
                                    font: { family: 'Roboto', size: 12 },
                                    beginAtZero: true,
                                    callback: function(value) {
                                        return '$' + value;
                                    }
                                },
                                title: {
                                    display: true,
                                    color: '#000000', // Black title
                                    font: { family: 'Roboto', size: 14 },
                                    text: 'Average Order Value ($)'
                                }
                            }
                        }
                    }
                });
                console.log("AOV Chart rendered.");
            } else {
                console.error("AOV Chart canvas not found.");
            }

                        // Churn Risk by Segment Chart
            const churnRiskCanvas = document.getElementById('churnRiskChart');
            if (churnRiskCanvas && data.churn_by_segment) {
                const totalChurnRisk = Object.values(data.churn_by_segment).reduce((sum, value) => sum + value, 0);
                if (totalChurnRisk === 0) {
                    churnRiskCanvas.parentElement.innerHTML = '<p class="text-center text-muted">No churn risk data available for the selected period.</p>';
                    console.log("Churn Risk Chart not rendered: No data available.");
                } else {
                    renderChurnRiskChart(data.churn_by_segment);
                }
            } else {
                console.error("Churn Risk Chart canvas not found or no churn data available.");
            }

            // Populate Customer Recommendations with Pagination
            const recommendationsSection = document.getElementById('recommendations-section');
            if (recommendationsSection) {
                recommendationsSection.innerHTML = '';

                const segments = Object.keys(data.customer_data).sort();
                if (segments.length === 0) {
                    recommendationsSection.innerHTML = '<p class="text-center text-muted">No customer data available for the selected period.</p>';
                    console.log("Customer Recommendations section not rendered: No data available.");
                } else {
                    segments.forEach(segment => {
                        const customers = data.customer_data[segment];
                        const recommendation = data.recommendations[segment] || 'No action specified.';
                        const pagination = data.pagination_data[segment];

                        const card = document.createElement('div');
                        card.className = 'card mb-4 shadow-sm';
                        card.id = `segment-${segment.replace(/\s+/g, '-')}`;

                        const cardHeader = document.createElement('div');
                        cardHeader.className = 'card-header';
                        const title = document.createElement('h4');
                        title.className = 'my-0 font-weight-normal';
                        title.textContent = `${segment} (${pagination.total_items} customers)`;
                        cardHeader.appendChild(title);
                        card.appendChild(cardHeader);

                        const cardBody = document.createElement('div');
                        cardBody.className = 'card-body';
                        const recText = document.createElement('p');
                        recText.textContent = `Recommendation: ${recommendation}`;
                        cardBody.appendChild(recText);

                        const tableContainer = renderCustomerTable(segment, customers, pagination, filterSegment, startDate, endDate, dateRangeOption);
                        cardBody.appendChild(tableContainer);
                        card.appendChild(cardBody);

                        recommendationsSection.appendChild(card);
                    });
                    console.log("Customer recommendations section updated.");
                }
            } else {
                console.error("Recommendations section not found.");
            }

            // Force a window resize to ensure Chart.js refreshes the canvas
            window.dispatchEvent(new Event('resize'));
            console.log("Triggered window resize to force chart refresh.");

            // Scroll to top
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error("Error fetching visualization data:", error);
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.textContent = `Failed to load visualization data: ${error.message}`;
                errorDiv.style.display = 'block';
            }
            window.scrollTo(0, 0);
        });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing RFM and churn visualizations...");

    // Show/hide custom date inputs based on dropdown selection
    const dateRangeDropdown = document.getElementById('dateRangeOption');
    const customDateRangeDiv = document.getElementById('customDateRange');
    if (dateRangeDropdown && customDateRangeDiv) {
        dateRangeDropdown.addEventListener('change', () => {
            if (dateRangeDropdown.value === 'custom') {
                customDateRangeDiv.style.display = 'flex';
            } else {
                customDateRangeDiv.style.display = 'none';
            }
        });

        // Trigger initial state on load
        if (dateRangeDropdown.value === 'custom') {
            customDateRangeDiv.style.display = 'flex';
        } else {
            customDateRangeDiv.style.display = 'none';
        }
    }

    // Initial fetch with default 1-year range
    const defaultStartDate = '2024-05-26';
    const defaultEndDate = '2025-05-26';
    fetchVisualizationData(null, defaultStartDate, defaultEndDate, 'last_1_year');
    console.log("Initial fetch completed with default range.");

    // Add event listener for the apply filters button
    const applyFiltersButton = document.getElementById('applyFilters');
    if (applyFiltersButton) {
        console.log("Apply Filters button found, attaching listener.");
        applyFiltersButton.addEventListener('click', () => {
            console.log("Apply Filters button clicked.");
            const filterSegment = document.getElementById('filterSegment').value;
            const dateRangeOption = document.getElementById('dateRangeOption').value;
            let startDate = document.getElementById('startDate').value;
            let endDate = document.getElementById('endDate').value;

            // Handle date logic based on the selected option
            if (dateRangeOption === 'last_1_year') {
                startDate = '2024-05-26';
                endDate = '2025-05-26';
                console.log("Last 1 Year selected, setting dates:", { startDate, endDate });
            } else if (dateRangeOption === 'all') {
                startDate = null;
                endDate = null;
                console.log("All Data selected, clearing dates.");
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

            console.log("Calling fetchVisualizationData with final parameters:", { filterSegment, startDate, endDate, dateRangeOption });
            fetchVisualizationData(filterSegment, startDate, endDate, dateRangeOption);
        });
    } else {
        console.error("Apply Filters button not found. Check HTML for 'applyFilters' ID.");
    }

    // Expand active submenu on page load
    const activeSublinks = document.querySelectorAll('.sidebar-sub-link.active');
    activeSublinks.forEach(sublink => {
        const collapseDiv = sublink.closest('.collapse');
        if (collapseDiv) {
            collapseDiv.classList.add('show');
            const parentLink = document.querySelector(`[aria-controls="${collapseDiv.id}"]`);
            if (parentLink) {
                parentLink.setAttribute('aria-expanded', 'true');
                const arrow = parentLink.querySelector('.bi-chevron-down');
                if (arrow) {
                    arrow.classList.add('rotate');
                }
            }
        }
    });
});