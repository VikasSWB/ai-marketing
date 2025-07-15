// // Object to store chart instances
// const financialCharts = {};

// // Function to destroy a chart if it exists
// function destroyFinancialChart(chartKey) {
//     if (financialCharts[chartKey] && typeof financialCharts[chartKey].destroy === 'function') {
//         financialCharts[chartKey].destroy();
//         delete financialCharts[chartKey];
//         console.log(`Chart ${chartKey} destroyed successfully.`);
//     } else {
//         console.log(`Chart ${chartKey} not found or already destroyed.`);
//     }
// }

// // Common Chart.js options for consistent styling
// const commonOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             titleFont: { size: 14, family: 'Roboto' },
//             bodyFont: { size: 12, family: 'Roboto' },
//             padding: 10,
//             cornerRadius: 5
//         }
//     }
// };

// // Options for Total Revenue Trend chart
// const revenueOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#BBDEFB', // Light blue for blue background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Total Revenue ($)'
//             }
//         }
//     }
// };

// // Options for Shipping Charges Trend chart
// const shippingChargesOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#E8F5E9', // Light green for green background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Shipping Charges ($)'
//             }
//         }
//     }
// };

// // Options for Tax Collected by Month chart
// const taxCollectedOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#FFEBEE', // Light red for red background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Tax Collected ($)'
//             }
//         }
//     }
// };

// // Function to update the date range note
// function updateDateRangeNote(startDate, endDate, dateRangeOption) {
//     const noteElement = document.getElementById('dateRangeNote');
//     if (noteElement) {
//         if (dateRangeOption === 'custom' && startDate && endDate) {
//             noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
//         } else {
//             noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-05-19'} to ${endDate || '2025-05-19'}).`;
//         }
//         console.log("Date range note updated:", noteElement.textContent);
//     } else {
//         console.error("Date range note element not found.");
//     }
// }

// // Function to update the summary table
// function updateSummaryTable(summary) {
//     const totalRevenueCell = document.getElementById('totalRevenue');
//     const totalShippingCell = document.getElementById('totalShipping');
//     const totalTaxCell = document.getElementById('totalTax');
//     const orderCountCell = document.getElementById('orderCount');

//     if (totalRevenueCell && totalShippingCell && totalTaxCell && orderCountCell) {
//         totalRevenueCell.textContent = summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalShippingCell.textContent = summary.total_shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalTaxCell.textContent = summary.total_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         orderCountCell.textContent = summary.order_count.toLocaleString();
//         console.log("Summary table updated:", summary);
//     } else {
//         console.error("Summary table elements not found.");
//     }
// }

// // Fetch financial insights data and populate charts
// function fetchFinancialInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
//     console.log("Fetching financial insights data with parameters:", { page, startDate, endDate, dateRangeOption });

//     // Build the URL with query parameters
//     let url = `/financial-insights-data/?page=${page}`;
//     if (startDate) {
//         url += `&start_date=${startDate}`;
//     }
//     if (endDate) {
//         url += `&end_date=${endDate}`;
//     }
//     url += `&date_range_option=${dateRangeOption}`;
//     console.log("Fetching URL:", url);

//     fetch(url)
//         .then(response => {
//             console.log("API Response Status:", response.status);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Financial insights data received:", data);

//             // Validate the response data
//             if (!data || typeof data !== 'object') {
//                 console.error("Invalid data format received:", data);
//                 throw new Error("Invalid data format received from server.");
//             }

//             // Check for errors in the response
//             if (data.error) {
//                 console.error("Error fetching financial insights data:", data.error);
//                 const errorDiv = document.getElementById('error');
//                 if (errorDiv) {
//                     errorDiv.textContent = data.error;
//                     errorDiv.style.display = 'block';
//                 }
//                 return;
//             }

//             // Validate required fields
//             const requiredFields = ['revenue_months', 'revenue_values', 'shipping_months', 'shipping_values', 'tax_months', 'tax_values', 'summary'];
//             for (const field of requiredFields) {
//                 if (!(field in data)) {
//                     console.error(`Missing required field in response: ${field}`);
//                     throw new Error(`Missing required field in response: ${field}`);
//                 }
//             }

//             // Update the date range note
//             updateDateRangeNote(startDate, endDate, dateRangeOption);

//             // Update the summary table
//             updateSummaryTable(data.summary);

//             // Helper function to render charts
//             const renderChart = (canvasId, chartKey, months, values, options, label) => {
//                 const canvas = document.getElementById(canvasId);
//                 if (canvas) {
//                     // Ensure months and values are arrays
//                     if (!Array.isArray(months)) {
//                         console.warn(`${chartKey} months is not an array, using empty array.`);
//                         months = [];
//                     }
//                     if (!Array.isArray(values)) {
//                         console.warn(`${chartKey} values is not an array, using empty array.`);
//                         values = [];
//                     }

//                     // Ensure lengths match by padding with zeros if necessary
//                     if (months.length !== values.length) {
//                         console.warn(`Length mismatch in ${chartKey}: months (${months.length}) vs values (${values.length}). Adjusting...`);
//                         const maxLength = Math.max(months.length, values.length);
//                         months = months.slice(0, maxLength);
//                         values = values.slice(0, maxLength);
//                         while (values.length < maxLength) values.push(0);
//                         while (months.length < maxLength) months.push('');
//                     }

//                     // Convert values to numbers
//                     const numericValues = values.map(val => {
//                         const num = Number(val);
//                         return isNaN(num) ? 0 : num;
//                     });

//                     // Destroy existing chart
//                     destroyFinancialChart(chartKey);

//                     // Clear the canvas context to ensure a fresh render
//                     const ctx = canvas.getContext('2d');
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     console.log(`${chartKey} Canvas cleared.`);

//                     // Set canvas dimensions explicitly
//                     canvas.width = 500;
//                     canvas.height = 200;
//                     console.log(`${chartKey} Canvas dimensions set:`, { width: 500, height: 200 });

//                     if (months.length > 0 && numericValues.length > 0) {
//                         try {
//                             financialCharts[chartKey] = new Chart(canvas, {
//                                 type: 'line',
//                                 data: {
//                                     labels: months,
//                                     datasets: [{
//                                         label: label,
//                                         data: numericValues,
//                                         borderColor: 'rgba(255, 255, 255, 1)',
//                                         backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                                         fill: false,
//                                         tension: 0.4,
//                                         pointBackgroundColor: 'white',
//                                         pointBorderColor: 'white',
//                                         pointRadius: 4,
//                                         pointHoverRadius: 6
//                                     }]
//                                 },
//                                 options: options
//                             });
//                             financialCharts[chartKey].update();
//                             canvas.style.display = 'block';
//                             console.log(`${chartKey} Chart rendered with data:`, { labels: months, data: numericValues });
//                         } catch (error) {
//                             console.error(`Error rendering ${chartKey} Chart:`, error);
//                             canvas.style.display = 'none';
//                         }
//                     } else {
//                         console.warn(`No valid data for ${chartKey} Chart after validation.`);
//                         canvas.style.display = 'none';
//                     }
//                 } else {
//                     console.error(`${chartKey} Chart canvas not found.`);
//                 }
//             };

//             // 1. Total Revenue Chart
//             renderChart('revenueChart', 'revenueChart', data.revenue_months, data.revenue_values, revenueOptions, 'Total Revenue ($)');

//             // 2. Shipping Charges Chart
//             renderChart('shippingChargesChart', 'shippingChargesChart', data.shipping_months, data.shipping_values, shippingChargesOptions, 'Shipping Charges ($)');

//             // 3. Tax Collected Chart
//             renderChart('taxCollectedChart', 'taxCollectedChart', data.tax_months, data.tax_values, taxCollectedOptions, 'Tax Collected ($)');

//             // Force a window resize to ensure Chart.js refreshes the canvas
//             window.dispatchEvent(new Event('resize'));
//             console.log("Triggered window resize to force chart refresh.");

//             // Ensure the page stays at the top after charts are rendered
//             window.scrollTo(0, 0);
//         })
//         .catch(error => {
//             console.error("Error fetching financial insights data:", error);
//             const errorDiv = document.getElementById('error');
//             if (errorDiv) {
//                 errorDiv.textContent = `Failed to load financial insights data: ${error.message}`;
//                 errorDiv.style.display = 'block';
//             }
//             window.scrollTo(0, 0);
//         });
// }

// // Initialize the page
// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOM fully loaded, initializing financial insights...");

//     // Initial fetch with default 1-year range
//     const defaultStartDate = '2024-05-19';
//     const defaultEndDate = '2025-05-19';
//     fetchFinancialInsightsData(1, defaultStartDate, defaultEndDate, 'last_1_year');
//     console.log("Initial fetch completed with default range.");

//     // Add event listener for the apply filters button
//     const applyFiltersButton = document.getElementById('applyFilters');
//     if (applyFiltersButton) {
//         console.log("Apply Filters button found, attaching listener.");
//         applyFiltersButton.addEventListener('click', () => {
//             console.log("Apply Filters button clicked.");
//             const dateRangeOption = document.getElementById('dateRangeOption').value;
//             let startDate = document.getElementById('startDate').value;
//             let endDate = document.getElementById('endDate').value;

//             console.log("Captured filter parameters:", { dateRangeOption, startDate, endDate });

//             // Handle date logic based on the selected option
//             if (dateRangeOption === 'last_1_year') {
//                 startDate = '2024-05-19';
//                 endDate = '2025-05-19';
//                 console.log("Last 1 Year selected, setting dates:", { startDate, endDate });
//             } else if (dateRangeOption === 'custom') {
//                 if (!startDate || !endDate) {
//                     alert('Please select both start and end dates for custom range.');
//                     console.log("Custom range selected but startDate or endDate missing.");
//                     return;
//                 }
//                 if (new Date(startDate) > new Date(endDate)) {
//                     alert('Start date must be before end date.');
//                     console.log("Validation failed: Start date is after end date.");
//                     return;
//                 }
//                 console.log("Custom range selected with dates:", { startDate, endDate });
//             }

//             console.log("Calling fetchFinancialInsightsData with final parameters:", { page: 1, startDate, endDate, dateRangeOption });
//             fetchFinancialInsightsData(1, startDate, endDate, dateRangeOption);
//         });
//     } else {
//         console.error("Apply Filters button not found. Check HTML for 'applyFilters' ID.");
//     }
// });



// Object to store chart instances
// const financialCharts = {};

// // Function to destroy a chart if it exists
// function destroyFinancialChart(chartKey) {
//     if (financialCharts[chartKey] && typeof financialCharts[chartKey].destroy === 'function') {
//         financialCharts[chartKey].destroy();
//         delete financialCharts[chartKey];
//         console.log(`Chart ${chartKey} destroyed successfully.`);
//     } else {
//         console.log(`Chart ${chartKey} not found or already destroyed.`);
//     }
// }

// // Common Chart.js options for consistent styling
// const commonOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             titleFont: { size: 14, family: 'Roboto' },
//             bodyFont: { size: 12, family: 'Roboto' },
//             padding: 10,
//             cornerRadius: 5
//         }
//     }
// };

// // Options for Total Revenue Trend chart
// const revenueOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#BBDEFB', // Light blue for blue background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Total Revenue ($)'
//             }
//         }
//     }
// };

// // Options for Shipping Charges Trend chart
// const shippingChargesOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#E8F5E9', // Light green for green background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Shipping Charges ($)'
//             }
//         }
//     }
// };

// // Options for Tax Collected by Month chart
// const taxCollectedOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#FFEBEE', // Light red for red background
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Tax Collected ($)'
//             }
//         }
//     }
// };

// // Function to update the date range note
// function updateDateRangeNote(startDate, endDate, dateRangeOption) {
//     const noteElement = document.getElementById('dateRangeNote');
//     if (noteElement) {
//         if (dateRangeOption === 'custom' && startDate && endDate) {
//             noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
//         } else {
//             noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-05-19'} to ${endDate || '2025-05-19'}).`;
//         }
//         console.log("Date range note updated:", noteElement.textContent);
//     } else {
//         console.error("Date range note element not found.");
//     }
// }

// // Function to update the summary table
// function updateSummaryTable(summary) {
//     const totalRevenueCell = document.getElementById('totalRevenue');
//     const totalShippingCell = document.getElementById('totalShipping');
//     const totalTaxCell = document.getElementById('totalTax');
//     const orderCountCell = document.getElementById('orderCount');

//     if (totalRevenueCell && totalShippingCell && totalTaxCell && orderCountCell) {
//         totalRevenueCell.textContent = summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalShippingCell.textContent = summary.total_shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalTaxCell.textContent = summary.total_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         orderCountCell.textContent = summary.order_count.toLocaleString();
//         console.log("Summary table updated:", summary);
//     } else {
//         console.error("Summary table elements not found.");
//     }
// }

// // Fetch financial insights data and populate charts
// // function fetchFinancialInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
// //     console.log("Fetching financial insights data with parameters:", { page, startDate, endDate, dateRangeOption });

// //     // Build the URL with query parameters
// //     let url = `/financial-insights-data/?page=${page}`;
// //     if (startDate) {
// //         url += `&start_date=${startDate}`;
// //     }
// //     if (endDate) {
// //         url += `&end_date=${endDate}`;
// //     }
// //     url += `&date_range_option=${dateRangeOption}`;
// //     console.log("Fetching URL:", url);

// //     fetch(url)
// //         .then(response => {
// //             console.log("API Response Status:", response.status);
// //             if (!response.ok) {
// //                 throw new Error(`HTTP error! Status: ${response.status}`);
// //             }
// //             return response.json();
// //         })
// //         .then(data => {
// //             console.log("Financial insights data received:", data);

// //             // Validate the response data
// //             if (!data || typeof data !== 'object') {
// //                 console.error("Invalid data format received:", data);
// //                 throw new Error("Invalid data format received from server.");
// //             }

// //             // Check for errors in the response
// //             if (data.error) {
// //                 console.error("Error fetching financial insights data:", data.error);
// //                 const errorDiv = document.getElementById('error');
// //                 if (errorDiv) {
// //                     errorDiv.textContent = data.error;
// //                     errorDiv.style.display = 'block';
// //                 }
// //                 return;
// //             }

// //             // Validate required fields
// //             const requiredFields = ['revenue_months', 'revenue_values', 'shipping_months', 'shipping_values', 'tax_months', 'tax_values', 'summary'];
// //             for (const field of requiredFields) {
// //                 if (!(field in data)) {
// //                     console.error(`Missing required field in response: ${field}`);
// //                     throw new Error(`Missing required field in response: ${field}`);
// //                 }
// //             }

// //             // Update the date range note
// //             updateDateRangeNote(startDate, endDate, dateRangeOption);

// //             // Update the summary table
// //             updateSummaryTable(data.summary);

// //             // Helper function to render charts
// //             const renderChart = (canvasId, chartKey, months, values, options, label) => {
// //                 const canvas = document.getElementById(canvasId);
// //                 if (canvas) {
// //                     // Ensure months and values are arrays
// //                     if (!Array.isArray(months)) {
// //                         console.warn(`${chartKey} months is not an array, using empty array.`);
// //                         months = [];
// //                     }
// //                     if (!Array.isArray(values)) {
// //                         console.warn(`${chartKey} values is not an array, using empty array.`);
// //                         values = [];
// //                     }

// //                     // Ensure lengths match by padding with zeros if necessary
// //                     if (months.length !== values.length) {
// //                         console.warn(`Length mismatch in ${chartKey}: months (${months.length}) vs values (${values.length}). Adjusting...`);
// //                         const maxLength = Math.max(months.length, values.length);
// //                         months = months.slice(0, maxLength);
// //                         values = values.slice(0, maxLength);
// //                         while (values.length < maxLength) values.push(0);
// //                         while (months.length < maxLength) months.push('');
// //                     }

// //                     // Convert values to numbers
// //                     const numericValues = values.map(val => {
// //                         const num = Number(val);
// //                         return isNaN(num) ? 0 : num;
// //                     });

// //                     // Destroy existing chart
// //                     destroyFinancialChart(chartKey);

// //                     // Clear the canvas context to ensure a fresh render
// //                     const ctx = canvas.getContext('2d');
// //                     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //                     console.log(`${chartKey} Canvas cleared.`);

// //                     // Set canvas dimensions explicitly
// //                     canvas.width = 500;
// //                     canvas.height = 200;
// //                     console.log(`${chartKey} Canvas dimensions set:`, { width: 500, height: 200 });

// //                     if (months.length > 0 && numericValues.length > 0) {
// //                         try {
// //                             financialCharts[chartKey] = new Chart(canvas, {
// //                                 type: 'line',
// //                                 data: {
// //                                     labels: months,
// //                                     datasets: [{
// //                                         label: label,
// //                                         data: numericValues,
// //                                         borderColor: 'rgba(255, 255, 255, 1)',
// //                                         backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //                                         fill: false,
// //                                         tension: 0.4,
// //                                         pointBackgroundColor: 'white',
// //                                         pointBorderColor: 'white',
// //                                         pointRadius: 4,
// //                                         pointHoverRadius: 6
// //                                     }]
// //                                 },
// //                                 options: options
// //                             });
// //                             financialCharts[chartKey].update();
// //                             canvas.style.display = 'block';
// //                             console.log(`${chartKey} Chart rendered with data:`, { labels: months, data: numericValues });
// //                         } catch (error) {
// //                             console.error(`Error rendering ${chartKey} Chart:`, error);
// //                             canvas.style.display = 'none';
// //                         }
// //                     } else {
// //                         console.warn(`No valid data for ${chartKey} Chart after validation.`);
// //                         canvas.style.display = 'none';
// //                     }
// //                 } else {
// //                     console.error(`${chartKey} Chart canvas not found.`);
// //                 }
// //             };

// //             // 1. Total Revenue Chart
// //             renderChart('revenueChart', 'revenueChart', data.revenue_months, data.revenue_values, revenueOptions, 'Total Revenue ($)');

// //             // 2. Shipping Charges Chart
// //             renderChart('shippingChargesChart', 'shippingChargesChart', data.shipping_months, data.shipping_values, shippingChargesOptions, 'Shipping Charges ($)');

// //             // 3. Tax Collected Chart
// //             renderChart('taxCollectedChart', 'taxCollectedChart', data.tax_months, data.tax_values, taxCollectedOptions, 'Tax Collected ($)');

// //             // Force a window resize to ensure Chart.js refreshes the canvas
// //             window.dispatchEvent(new Event('resize'));
// //             console.log("Triggered window resize to force chart refresh.");

// //             // Ensure the page stays at the top after charts are rendered
// //             window.scrollTo(0, 0);
// //         })
// //         .catch(error => {
// //             console.error("Error fetching financial insights data:", error);
// //             const errorDiv = document.getElementById('error');
// //             if (errorDiv) {
// //                 errorDiv.textContent = `Failed to load financial insights data: ${error.message}`;
// //                 errorDiv.style.display = 'block';
// //             }
// //             window.scrollTo(0, 0);
// //         });
// // }

// function fetchFinancialInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
//     console.log("Fetching financial insights data with parameters:", { page, startDate, endDate, dateRangeOption });

//     let url = `/financial-insights-data/?page=${page}`;
//     if (startDate) {
//         url += `&start_date=${startDate}`;
//     }
//     if (endDate) {
//         url += `&end_date=${endDate}`;
//     }
//     url += `&date_range_option=${dateRangeOption}`;
//     console.log("Fetching URL:", url);

//     fetch(url)
//         .then(response => {
//             console.log("API Response Status:", response.status);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Raw API Response:", JSON.stringify(data, null, 2));

//             if (!data || typeof data !== 'object') {
//                 console.error("Invalid data format received:", data);
//                 throw new Error("Invalid data format received from server.");
//             }

//             if (data.error) {
//                 console.error("Error fetching financial insights data:", data.error);
//                 const errorDiv = document.getElementById('error');
//                 if (errorDiv) {
//                     errorDiv.textContent = data.error;
//                     errorDiv.style.display = 'block';
//                 }
//                 return;
//             }

//             const requiredFields = ['revenue_months', 'revenue_values', 'shipping_months', 'shipping_values', 'tax_months', 'tax_values', 'summary'];
//             for (const field of requiredFields) {
//                 if (!(field in data)) {
//                     console.error(`Missing required field in response: ${field}`);
//                     throw new Error(`Missing required field in response: ${field}`);
//                 }
//             }

//             updateDateRangeNote(startDate, endDate, dateRangeOption);
//             updateSummaryTable(data.summary);

//             const renderChart = (canvasId, chartKey, months, values, options, label) => {
//                 const canvas = document.getElementById(canvasId);
//                 if (canvas) {
//                     console.log(`${chartKey} Input Data:`, { months, values });

//                     if (!Array.isArray(months)) {
//                         console.warn(`${chartKey} months is not an array, using empty array.`);
//                         months = [];
//                     }
//                     if (!Array.isArray(values)) {
//                         console.warn(`${chartKey} values is not an array, using empty array.`);
//                         values = [];
//                     }

//                     if (months.length !== values.length) {
//                         console.warn(`Length mismatch in ${chartKey}: months (${months.length}) vs values (${values.length}). Adjusting...`);
//                         const maxLength = Math.max(months.length, values.length);
//                         months = months.slice(0, maxLength);
//                         values = values.slice(0, maxLength);
//                         while (values.length < maxLength) values.push(0);
//                         while (months.length < maxLength) months.push('');
//                     }

//                     const numericValues = values.map(val => {
//                         const num = Number(val);
//                         console.log(`Converting ${val} to ${num}`);
//                         return isNaN(num) ? 0 : num;
//                     });

//                     destroyFinancialChart(chartKey);

//                     const ctx = canvas.getContext('2d');
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     console.log(`${chartKey} Canvas cleared.`);

//                     canvas.width = 500;
//                     canvas.height = 200;
//                     console.log(`${chartKey} Canvas dimensions set:`, { width: 500, height: 200 });

//                     if (months.length > 0 && numericValues.length > 0) {
//                         try {
//                             financialCharts[chartKey] = new Chart(canvas, {
//                                 type: 'line',
//                                 data: {
//                                     labels: months,
//                                     datasets: [{
//                                         label: label,
//                                         data: numericValues,
//                                         borderColor: 'rgba(255, 255, 255, 1)',
//                                         backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                                         fill: false,
//                                         tension: 0.4,
//                                         pointBackgroundColor: 'white',
//                                         pointBorderColor: 'white',
//                                         pointRadius: 4,
//                                         pointHoverRadius: 6
//                                     }]
//                                 },
//                                 options: options
//                             });
//                             financialCharts[chartKey].update();
//                             canvas.style.display = 'block';
//                             console.log(`${chartKey} Chart rendered with data:`, { labels: months, data: numericValues });
//                         } catch (error) {
//                             console.error(`Error rendering ${chartKey} Chart:`, error);
//                             canvas.style.display = 'none';
//                         }
//                     } else {
//                         console.warn(`No valid data for ${chartKey} Chart: months=${months}, values=${numericValues}`);
//                         canvas.style.display = 'none';
//                     }
//                 } else {
//                     console.error(`${chartKey} Canvas element not found.`);
//                 }
//             };

//             renderChart('revenueChart', 'revenueChart', data.revenue_months, data.revenue_values, revenueOptions, 'Total Revenue ($)');
//             renderChart('shippingChargesChart', 'shippingChargesChart', data.shipping_months, data.shipping_values, shippingChargesOptions, 'Shipping Charges ($)');
//             renderChart('taxCollectedChart', 'taxCollectedChart', data.tax_months, data.tax_values, taxCollectedOptions, 'Tax Collected ($)');

//             window.dispatchEvent(new Event('resize'));
//             console.log("Triggered window resize to force chart refresh.");
//             window.scrollTo(0, 0);
//         })
//         .catch(error => {
//             console.error("Error fetching financial insights data:", error);
//             const errorDiv = document.getElementById('error');
//             if (errorDiv) {
//                 errorDiv.textContent = `Failed to load financial insights data: ${error.message}`;
//                 errorDiv.style.display = 'block';
//             }
//             window.scrollTo(0, 0);
//         });
// }

// // Initialize the page

//     // Show/hide custom date inputs based on dropdown selection
//     const dateRangeDropdown = document.getElementById('dateRangeOption');
//     const customDateRangeDiv = document.getElementById('customDateRange');
//     if (dateRangeDropdown && customDateRangeDiv) {
//         dateRangeDropdown.addEventListener('change', () => {
//             if (dateRangeDropdown.value === 'custom') {
//                 customDateRangeDiv.style.display = 'flex';
//             } else {
//                 customDateRangeDiv.style.display = 'none';
//             }
//         });

//         // Trigger initial state on load
//         if (dateRangeDropdown.value === 'custom') {
//             customDateRangeDiv.style.display = 'flex';
//         } else {
//             customDateRangeDiv.style.display = 'none';
//         }
//     }


//     document.addEventListener('DOMContentLoaded', () => {
//         console.log("DOM fully loaded, initializing financial insights...");
    
//         // Initial fetch with default 1-year range
//         const defaultStartDate = '2024-05-19';
//         const defaultEndDate = '2025-05-19';
//         fetchFinancialInsightsData(1, defaultStartDate, defaultEndDate, 'last_1_year');
//         console.log("Initial fetch completed with default range.");
    
//         // Add event listener for the apply filters button
//         const applyFiltersButton = document.getElementById('applyFilters');
//         if (applyFiltersButton) {
//             console.log("Apply Filters button found, attaching listener.");
//             applyFiltersButton.addEventListener('click', () => {
//                 console.log("Apply Filters button clicked.");
//                 const dateRangeOption = document.getElementById('dateRangeOption').value;
//                 let startDate = document.getElementById('startDate').value;
//                 let endDate = document.getElementById('endDate').value;
    
//                 console.log("Captured filter parameters:", { dateRangeOption, startDate, endDate });
    
//                 // Handle date logic based on the selected option
//                 if (dateRangeOption === 'last_1_year') {
//                     startDate = '2024-05-19';
//                     endDate = '2025-05-19';
//                     console.log("Last 1 Year selected, setting dates:", { startDate, endDate });
//                 } else if (dateRangeOption === 'custom') {
//                     if (!startDate || !endDate) {
//                         alert('Please select both start and end dates for custom range.');
//                         console.log("Custom range selected but startDate or endDate missing.");
//                         return;
//                     }
//                     if (new Date(startDate) > new Date(endDate)) {
//                         alert('Start date must be before end date.');
//                         console.log("Validation failed: Start date is after end date.");
//                         return;
//                     }
//                     console.log("Custom range selected with dates:", { startDate, endDate });
//                 }
    
//                 console.log("Calling fetchFinancialInsightsData with final parameters:", { page: 1, startDate, endDate, dateRangeOption });
//                 fetchFinancialInsightsData(1, startDate, endDate, dateRangeOption);
//             });
//         } else {
//             console.error("Apply Filters button not found. Check HTML for 'applyFilters' ID.");
//         }
    
//         // Expand active submenu on page load
//         const activeSublinks = document.querySelectorAll('.sidebar-sub-link.active');
//         activeSublinks.forEach(sublink => {
//             const collapseDiv = sublink.closest('.collapse');
//             if (collapseDiv) {
//                 collapseDiv.classList.add('show'); // Expand the submenu
//                 const parentLink = document.querySelector(`[aria-controls="${collapseDiv.id}"]`);
//                 if (parentLink) {
//                     parentLink.setAttribute('aria-expanded', 'true'); // Update ARIA attribute
//                     const arrow = parentLink.querySelector('.bi-chevron-down');
//                     if (arrow) {
//                         arrow.classList.add('rotate'); // Rotate the chevron arrow
//                     }
//                 }
//             }
//         });
//     });

// Object to store chart instances
// const financialCharts = {};

// // Function to destroy a chart if it exists
// function destroyFinancialChart(chartKey) {
//     if (financialCharts[chartKey] && typeof financialCharts[chartKey].destroy === 'function') {
//         financialCharts[chartKey].destroy();
//         delete financialCharts[chartKey];
//         console.log(`Chart ${chartKey} destroyed successfully.`);
//     } else {
//         console.log(`Chart ${chartKey} not found or already destroyed.`);
//     }
// }

// // Common Chart.js options for consistent styling
// const commonOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             titleFont: { size: 14, family: 'Roboto' },
//             bodyFont: { size: 12, family: 'Roboto' },
//             padding: 10,
//             cornerRadius: 5
//         }
//     }
// };

// // Options for Total Revenue Trend chart
// const revenueOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#BBDEFB',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Total Revenue ($)'
//             }
//         }
//     }
// };

// // Options for Shipping Charges Trend chart
// const shippingChargesOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#E8F5E9',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Shipping Charges ($)'
//             }
//         }
//     }
// };

// // Options for Tax Collected by Month chart
// const taxCollectedOptions = {
//     ...commonOptions,
//     scales: {
//         x: {
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 12 },
//                 maxRotation: 45,
//                 minRotation: 45
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Month'
//             }
//         },
//         y: {
//             grid: {
//                 color: 'rgba(255, 255, 255, 0.1)',
//                 borderDash: [5, 5]
//             },
//             ticks: {
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 12 },
//                 beginAtZero: true,
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             },
//             title: {
//                 display: true,
//                 color: '#FFEBEE',
//                 font: { family: 'Roboto', size: 14 },
//                 text: 'Tax Collected ($)'
//             }
//         }
//     }
// };

// // Function to update the date range note
// function updateDateRangeNote(startDate, endDate, dateRangeOption) {
//     const noteElement = document.getElementById('dateRangeNote');
//     if (noteElement) {
//         if (dateRangeOption === 'custom' && startDate && endDate) {
//             noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
//         } else {
//             noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-05-19'} to ${endDate || '2025-05-19'}).`;
//         }
//         console.log("Date range note updated:", noteElement.textContent);
//     } else {
//         console.error("Date range note element not found.");
//     }
// }

// // Function to update the summary table
// function updateSummaryTable(summary) {
//     const totalRevenueCell = document.getElementById('totalRevenue');
//     const totalShippingCell = document.getElementById('totalShipping');
//     const totalTaxCell = document.getElementById('totalTax');
//     const orderCountCell = document.getElementById('orderCount');

//     if (totalRevenueCell && totalShippingCell && totalTaxCell && orderCountCell) {
//         totalRevenueCell.textContent = summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalShippingCell.textContent = summary.total_shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         totalTaxCell.textContent = summary.total_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         orderCountCell.textContent = summary.order_count.toLocaleString();
//         console.log("Summary table updated:", summary);
//     } else {
//         console.error("Summary table elements not found.");
//     }
// }

// // Fallback data for charts (for debugging)
// const fallbackChartData = {
//     months: ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'],
//     values: [1000, 1200, 1500, 1300, 1400, 1600, 1700, 1800, 2000, 1900, 2100, 2200]
// };

// // Fetch financial insights data and populate charts
// function fetchFinancialInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
//     console.log("Fetching financial insights data with parameters:", { page, startDate, endDate, dateRangeOption });

//     // Build the URL with query parameters
//     let url = `/financial-insights-data/?page=${page}`;
//     if (startDate) {
//         url += `&start_date=${startDate}`;
//     }
//     if (endDate) {
//         url += `&end_date=${endDate}`;
//     }
//     url += `&date_range_option=${dateRangeOption}`;
//     console.log("Fetching URL:", url);

//     fetch(url)
//         .then(response => {
//             console.log("API Response Status:", response.status);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Financial insights data received:", JSON.stringify(data, null, 2));

//             // Validate the response data
//             if (!data || typeof data !== 'object') {
//                 console.error("Invalid data format received:", data);
//                 throw new Error("Invalid data format received from server.");
//             }

//             // Check for errors in the response
//             if (data.error) {
//                 console.error("Error fetching financial insights data:", data.error);
//                 const errorDiv = document.getElementById('error');
//                 if (errorDiv) {
//                     errorDiv.textContent = data.error;
//                     errorDiv.style.display = 'block';
//                 }
//                 // Render charts with fallback data
//                 renderChartsWithFallback();
//                 return;
//             }

//             // Validate required fields
//             const requiredFields = ['revenue_months', 'revenue_values', 'shipping_months', 'shipping_values', 'tax_months', 'tax_values', 'summary'];
//             for (const field of requiredFields) {
//                 if (!(field in data)) {
//                     console.error(`Missing required field in response: ${field}`);
//                     // Use fallback data for charts
//                     renderChartsWithFallback();
//                     return;
//                 }
//             }

//             // Update the date range note
//             updateDateRangeNote(startDate, endDate, dateRangeOption);

//             // Update the summary table
//             updateSummaryTable(data.summary);

//             // Helper function to render charts
//             const renderChart = (canvasId, chartKey, months, values, options, label) => {
//                 const canvas = document.getElementById(canvasId);
//                 if (!canvas) {
//                     console.error(`${chartKey} Chart canvas not found for ID: ${canvasId}`);
//                     return;
//                 }

//                 // Ensure months and values are arrays
//                 if (!Array.isArray(months)) {
//                     console.warn(`${chartKey} months is not an array, using fallback months.`);
//                     months = fallbackChartData.months;
//                 }
//                 if (!Array.isArray(values)) {
//                     console.warn(`${chartKey} values is not an array, using fallback values.`);
//                     values = fallbackChartData.values;
//                 }

//                 // Ensure lengths match by padding with zeros if necessary
//                 if (months.length !== values.length) {
//                     console.warn(`Length mismatch in ${chartKey}: months (${months.length}) vs values (${values.length}). Adjusting...`);
//                     const maxLength = Math.max(months.length, values.length);
//                     months = months.slice(0, maxLength);
//                     values = values.slice(0, maxLength);
//                     while (values.length < maxLength) values.push(0);
//                     while (months.length < maxLength) months.push('');
//                 }

//                 // Convert values to numbers
//                 const numericValues = values.map(val => {
//                     const num = Number(val);
//                     return isNaN(num) ? 0 : num;
//                 });

//                 // Destroy existing chart
//                 destroyFinancialChart(chartKey);

//                 // Clear the canvas context to ensure a fresh render
//                 const ctx = canvas.getContext('2d');
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 console.log(`${chartKey} Canvas cleared.`);

//                 // Set canvas dimensions explicitly
//                 canvas.width = canvas.parentElement.clientWidth || 500;
//                 canvas.height = 300;
//                 console.log(`${chartKey} Canvas dimensions set:`, { width: canvas.width, height: canvas.height });

//                 if (months.length > 0 && numericValues.length > 0) {
//                     try {
//                         financialCharts[chartKey] = new Chart(canvas, {
//                             type: 'line',
//                             data: {
//                                 labels: months,
//                                 datasets: [{
//                                     label: label,
//                                     data: numericValues,
//                                     borderColor: 'rgba(255, 255, 255, 1)',
//                                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                                     fill: false,
//                                     tension: 0.4,
//                                     pointBackgroundColor: 'white',
//                                     pointBorderColor: 'white',
//                                     pointRadius: 4,
//                                     pointHoverRadius: 6
//                                 }]
//                             },
//                             options: options
//                         });
//                         financialCharts[chartKey].update();
//                         canvas.style.display = 'block';
//                         console.log(`${chartKey} Chart rendered with data:`, { labels: months, data: numericValues });
//                     } catch (error) {
//                         console.error(`Error rendering ${chartKey} Chart:`, error);
//                         canvas.style.display = 'none';
//                     }
//                 } else {
//                     console.warn(`No valid data for ${chartKey} Chart after validation. Using fallback data.`);
//                     months = fallbackChartData.months;
//                     numericValues = fallbackChartData.values;
//                     try {
//                         financialCharts[chartKey] = new Chart(canvas, {
//                             type: 'line',
//                             data: {
//                                 labels: months,
//                                 datasets: [{
//                                     label: label + ' (Fallback)',
//                                     data: numericValues,
//                                     borderColor: 'rgba(255, 255, 255, 1)',
//                                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                                     fill: false,
//                                     tension: 0.4,
//                                     pointBackgroundColor: 'white',
//                                     pointBorderColor: 'white',
//                                     pointRadius: 4,
//                                     pointHoverRadius: 6
//                                 }]
//                             },
//                             options: options
//                         });
//                         financialCharts[chartKey].update();
//                         canvas.style.display = 'block';
//                         console.log(`${chartKey} Chart rendered with fallback data:`, { labels: months, data: numericValues });
//                     } catch (error) {
//                         console.error(`Error rendering ${chartKey} Chart with fallback data:`, error);
//                         canvas.style.display = 'none';
//                     }
//                 }
//             };

//             // Render charts
//             renderChart('revenueChart', 'revenueChart', data.revenue_months, data.revenue_values, revenueOptions, 'Total Revenue ($)');
//             renderChart('shippingChargesChart', 'shippingChargesChart', data.shipping_months, data.shipping_values, shippingChargesOptions, 'Shipping Charges ($)');
//             renderChart('taxCollectedChart', 'taxCollectedChart', data.tax_months, data.tax_values, taxCollectedOptions, 'Tax Collected ($)');

//             // Force a window resize to ensure Chart.js refreshes the canvas
//             window.dispatchEvent(new Event('resize'));
//             console.log("Triggered window resize to force chart refresh.");

//             // Ensure the page stays at the top after charts are rendered
//             window.scrollTo(0, 0);
//         })
//         .catch(error => {
//             console.error("Error fetching financial insights data:", error);
//             const errorDiv = document.getElementById('error');
//             if (errorDiv) {
//                 errorDiv.textContent = `Failed to load financial insights data: ${error.message}`;
//                 errorDiv.style.display = 'block';
//             }
//             // Render charts with fallback data
//             renderChartsWithFallback();
//             window.scrollTo(0, 0);
//         });
// }

// // Helper function to render charts with fallback data
// function renderChartsWithFallback() {
//     console.log("Rendering charts with fallback data due to API failure.");
//     const renderChart = (canvasId, chartKey, options, label) => {
//         const canvas = document.getElementById(canvasId);
//         if (canvas) {
//             destroyFinancialChart(chartKey);
//             const ctx = canvas.getContext('2d');
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             canvas.width = canvas.parentElement.clientWidth || 500;
//             canvas.height = 300;
//             try {
//                 financialCharts[chartKey] = new Chart(canvas, {
//                     type: 'line',
//                     data: {
//                         labels: fallbackChartData.months,
//                         datasets: [{
//                             label: label + ' (Fallback)',
//                             data: fallbackChartData.values,
//                             borderColor: 'rgba(255, 255, 255, 1)',
//                             backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                             fill: false,
//                             tension: 0.4,
//                             pointBackgroundColor: 'white',
//                             pointBorderColor: 'white',
//                             pointRadius: 4,
//                             pointHoverRadius: 6
//                         }]
//                     },
//                     options: options
//                 });
//                 financialCharts[chartKey].update();
//                 canvas.style.display = 'block';
//                 console.log(`${chartKey} Chart rendered with fallback data.`);
//             } catch (error) {
//                 console.error(`Error rendering ${chartKey} Chart with fallback data:`, error);
//                 canvas.style.display = 'none';
//             }
//         } else {
//             console.error(`${chartKey} Chart canvas not found for ID: ${canvasId}`);
//         }
//     };

//     renderChart('revenueChart', 'revenueChart', revenueOptions, 'Total Revenue ($)');
//     renderChart('shippingChargesChart', 'shippingChargesChart', shippingChargesOptions, 'Shipping Charges ($)');
//     renderChart('taxCollectedChart', 'taxCollectedChart', taxCollectedOptions, 'Tax Collected ($)');
// }

// // Initialize the page
// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOM fully loaded, initializing financial insights...");

//     // Show/hide custom date inputs based on dropdown selection
//     const dateRangeDropdown = document.getElementById('dateRangeOption');
//     const customDateRangeDiv = document.getElementById('customDateRange');
//     if (dateRangeDropdown && customDateRangeDiv) {
//         dateRangeDropdown.addEventListener('change', () => {
//             if (dateRangeDropdown.value === 'custom') {
//                 customDateRangeDiv.style.display = 'flex';
//             } else {
//                 customDateRangeDiv.style.display = 'none';
//             }
//         });

//         // Trigger initial state on load
//         if (dateRangeDropdown.value === 'custom') {
//             customDateRangeDiv.style.display = 'flex';
//         } else {
//             customDateRangeDiv.style.display = 'none';
//         }
//     }

//     // Initial fetch with default 1-year range
//     const defaultStartDate = '2024-05-19';
//     const defaultEndDate = '2025-05-19';
//     fetchFinancialInsightsData(1, defaultStartDate, defaultEndDate, 'last_1_year');
//     console.log("Initial fetch completed with default range.");

//     // Add event listener for the apply filters button
//     const applyFiltersButton = document.getElementById('applyFilters');
//     if (applyFiltersButton) {
//         console.log("Apply Filters button found, attaching listener.");
//         applyFiltersButton.addEventListener('click', () => {
//             console.log("Apply Filters button clicked.");
//             const dateRangeOption = document.getElementById('dateRangeOption').value;
//             let startDate = document.getElementById('startDate').value;
//             let endDate = document.getElementById('endDate').value;

//             console.log("Captured filter parameters:", { dateRangeOption, startDate, endDate });

//             // Handle date logic based on the selected option
//             if (dateRangeOption === 'last_1_year') {
//                 startDate = '2024-05-19';
//                 endDate = '2025-05-19';
//                 console.log("Last 1 Year selected, setting dates:", { startDate, endDate });
//             } else if (dateRangeOption === 'custom') {
//                 if (!startDate || !endDate) {
//                     alert('Please select both start and end dates for custom range.');
//                     console.log("Custom range selected but startDate or endDate missing.");
//                     return;
//                 }
//                 if (new Date(startDate) > new Date(endDate)) {
//                     alert('Start date must be before end date.');
//                     console.log("Validation failed: Start date is after end date.");
//                     return;
//                 }
//                 console.log("Custom range selected with dates:", { startDate, endDate });
//             }

//             console.log("Calling fetchFinancialInsightsData with final parameters:", { page: 1, startDate, endDate, dateRangeOption });
//             fetchFinancialInsightsData(1, startDate, endDate, dateRangeOption);
//         });
//     } else {
//         console.error("Apply Filters button not found. Check HTML for 'applyFilters' ID.");
//     }

//     // Expand active submenu on page load
//     const activeSublinks = document.querySelectorAll('.sidebar-sub-link.active');
//     activeSublinks.forEach(sublink => {
//         const collapseDiv = sublink.closest('.collapse');
//         if (collapseDiv) {
//             collapseDiv.classList.add('show');
//             const parentLink = document.querySelector(`[aria-controls="${collapseDiv.id}"]`);
//             if (parentLink) {
//                 parentLink.setAttribute('aria-expanded', 'true');
//                 const arrow = parentLink.querySelector('.bi-chevron-down');
//                 if (arrow) {
//                     arrow.classList.add('rotate');
//                 }
//             }
//         }
//     });
// });


// Object to store chart instances
const financialCharts = {};

// Function to destroy a chart if it exists
function destroyFinancialChart(chartKey) {
    if (financialCharts[chartKey] && typeof financialCharts[chartKey].destroy === 'function') {
        financialCharts[chartKey].destroy();
        delete financialCharts[chartKey];
        console.log(`Chart ${chartKey} destroyed successfully.`);
    } else {
        console.log(`Chart ${chartKey} not found or already destroyed.`);
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Keep tooltip background dark for contrast
            titleFont: { size: 14, family: 'Roboto' },
            bodyFont: { size: 12, family: 'Roboto' },
            padding: 10,
            cornerRadius: 5
        }
    }
};

// Options for Total Revenue Trend chart
const revenueOptions = {
    ...commonOptions,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Month'
            }
        },
        y: {
            grid: {
                color: '#000000', // Black grid lines
                borderDash: [5, 5]
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true,
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Total Revenue ($)'
            }
        }
    }
};

// Options for Shipping Charges Trend chart
const shippingChargesOptions = {
    ...commonOptions,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Month'
            }
        },
        y: {
            grid: {
                color: '#000000', // Black grid lines
                borderDash: [5, 5]
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true,
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Shipping Charges ($)'
            }
        }
    }
};

// Options for Tax Collected by Month chart
const taxCollectedOptions = {
    ...commonOptions,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                maxRotation: 45,
                minRotation: 45
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Month'
            }
        },
        y: {
            grid: {
                color: '#000000', // Black grid lines
                borderDash: [5, 5]
            },
            ticks: {
                color: '#000000', // Black ticks
                font: { family: 'Roboto', size: 12 },
                beginAtZero: true,
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            },
            title: {
                display: true,
                color: '#000000', // Black title
                font: { family: 'Roboto', size: 14 },
                text: 'Tax Collected ($)'
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

// Function to update the summary table
function updateSummaryTable(summary) {
    const totalRevenueCell = document.getElementById('totalRevenue');
    const totalShippingCell = document.getElementById('totalShipping');
    const totalTaxCell = document.getElementById('totalTax');
    const orderCountCell = document.getElementById('orderCount');

    if (totalRevenueCell && totalShippingCell && totalTaxCell && orderCountCell) {
        totalRevenueCell.textContent = summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalShippingCell.textContent = summary.total_shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalTaxCell.textContent = summary.total_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        orderCountCell.textContent = summary.order_count.toLocaleString();
        console.log("Summary table updated:", summary);
    } else {
        console.error("Summary table elements not found.");
    }
}

// Fallback data for charts (for debugging)
const fallbackChartData = {
    months: ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'],
    values: [1000, 1200, 1500, 1300, 1400, 1600, 1700, 1800, 2000, 1900, 2100, 2200]
};

// Fetch financial insights data and populate charts
function fetchFinancialInsightsData(page = 1, startDate = null, endDate = null, dateRangeOption = 'last_1_year') {
    console.log("Fetching financial insights data with parameters:", { page, startDate, endDate, dateRangeOption });

    // Build the URL with query parameters
    let url = `/financial-insights-data/?page=${page}`;
    if (startDate) {
        url += `&start_date=${startDate}`;
    }
    if (endDate) {
        url += `&end_date=${endDate}`;
    }
    url += `&date_range_option=${dateRangeOption}`;
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
            console.log("Financial insights data received:", JSON.stringify(data, null, 2));

            // Validate the response data
            if (!data || typeof data !== 'object') {
                console.error("Invalid data format received:", data);
                throw new Error("Invalid data format received from server.");
            }

            // Check for errors in the response
            if (data.error) {
                console.error("Error fetching financial insights data:", data.error);
                const errorDiv = document.getElementById('error');
                if (errorDiv) {
                    errorDiv.textContent = data.error;
                    errorDiv.style.display = 'block';
                }
                // Render charts with fallback data
                renderChartsWithFallback();
                return;
            }

            // Validate required fields
            const requiredFields = ['revenue_months', 'revenue_values', 'shipping_months', 'shipping_values', 'tax_months', 'tax_values', 'summary'];
            for (const field of requiredFields) {
                if (!(field in data)) {
                    console.error(`Missing required field in response: ${field}`);
                    // Use fallback data for charts
                    renderChartsWithFallback();
                    return;
                }
            }

            // Update the date range note
            updateDateRangeNote(startDate, endDate, dateRangeOption);

            // Update the summary table
            updateSummaryTable(data.summary);

            // Helper function to render charts
            const renderChart = (canvasId, chartKey, months, values, options, label) => {
                const canvas = document.getElementById(canvasId);
                if (!canvas) {
                    console.error(`${chartKey} Chart canvas not found for ID: ${canvasId}`);
                    return;
                }

                // Ensure months and values are arrays
                if (!Array.isArray(months)) {
                    console.warn(`${chartKey} months is not an array, using fallback months.`);
                    months = fallbackChartData.months;
                }
                if (!Array.isArray(values)) {
                    console.warn(`${chartKey} values is not an array, using fallback values.`);
                    values = fallbackChartData.values;
                }

                // Ensure lengths match by padding with zeros if necessary
                if (months.length !== values.length) {
                    console.warn(`Length mismatch in ${chartKey}: months (${months.length}) vs values (${values.length}). Adjusting...`);
                    const maxLength = Math.max(months.length, values.length);
                    months = months.slice(0, maxLength);
                    values = values.slice(0, maxLength);
                    while (values.length < maxLength) values.push(0);
                    while (months.length < maxLength) months.push('');
                }

                // Convert values to numbers
                const numericValues = values.map(val => {
                    const num = Number(val);
                    return isNaN(num) ? 0 : num;
                });

                // Destroy existing chart
                destroyFinancialChart(chartKey);

                // Clear the canvas context to ensure a fresh render
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                console.log(`${chartKey} Canvas cleared.`);

                // Set canvas dimensions explicitly
                canvas.width = canvas.parentElement.clientWidth || 500;
                canvas.height = 300;
                console.log(`${chartKey} Canvas dimensions set:`, { width: canvas.width, height: canvas.height });

                if (months.length > 0 && numericValues.length > 0) {
                    try {
                        financialCharts[chartKey] = new Chart(canvas, {
                            type: 'line',
                            data: {
                                labels: months,
                                datasets: [{
                                    label: label,
                                    data: numericValues,
                                    borderColor: '#000000', // Black line
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Black transparent fill
                                    fill: false,
                                    tension: 0.4,
                                    pointBackgroundColor: '#000000', // Black points
                                    pointBorderColor: '#000000', // Black point borders
                                    pointRadius: 4,
                                    pointHoverRadius: 6
                                }]
                            },
                            options: options
                        });
                        financialCharts[chartKey].update();
                        canvas.style.display = 'block';
                        console.log(`${chartKey} Chart rendered with data:`, { labels: months, data: numericValues });
                    } catch (error) {
                        console.error(`Error rendering ${chartKey} Chart:`, error);
                        canvas.style.display = 'none';
                    }
                } else {
                    console.warn(`No valid data for ${chartKey} Chart after validation. Using fallback data.`);
                    months = fallbackChartData.months;
                    numericValues = fallbackChartData.values;
                    try {
                        financialCharts[chartKey] = new Chart(canvas, {
                            type: 'line',
                            data: {
                                labels: months,
                                datasets: [{
                                    label: label + ' (Fallback)',
                                    data: numericValues,
                                    borderColor: '#000000', // Black line
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Black transparent fill
                                    fill: false,
                                    tension: 0.4,
                                    pointBackgroundColor: '#000000', // Black points
                                    pointBorderColor: '#000000', // Black point borders
                                    pointRadius: 4,
                                    pointHoverRadius: 6
                                }]
                            },
                            options: options
                        });
                        financialCharts[chartKey].update();
                        canvas.style.display = 'block';
                        console.log(`${chartKey} Chart rendered with fallback data:`, { labels: months, data: numericValues });
                    } catch (error) {
                        console.error(`Error rendering ${chartKey} Chart with fallback data:`, error);
                        canvas.style.display = 'none';
                    }
                }
            };

            // Render charts
            renderChart('revenueChart', 'revenueChart', data.revenue_months, data.revenue_values, revenueOptions, 'Total Revenue ($)');
            renderChart('shippingChargesChart', 'shippingChargesChart', data.shipping_months, data.shipping_values, shippingChargesOptions, 'Shipping Charges ($)');
            renderChart('taxCollectedChart', 'taxCollectedChart', data.tax_months, data.tax_values, taxCollectedOptions, 'Tax Collected ($)');

            // Force a window resize to ensure Chart.js refreshes the canvas
            window.dispatchEvent(new Event('resize'));
            console.log("Triggered window resize to force chart refresh.");

            // Ensure the page stays at the top after charts are rendered
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error("Error fetching financial insights data:", error);
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.textContent = `Failed to load financial insights data: ${error.message}`;
                errorDiv.style.display = 'block';
            }
            // Render charts with fallback data
            renderChartsWithFallback();
            window.scrollTo(0, 0);
        });
}

// Helper function to render charts with fallback data
function renderChartsWithFallback() {
    console.log("Rendering charts with fallback data due to API failure.");
    const renderChart = (canvasId, chartKey, options, label) => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            destroyFinancialChart(chartKey);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.parentElement.clientWidth || 500;
            canvas.height = 300;
            try {
                financialCharts[chartKey] = new Chart(canvas, {
                    type: 'line',
                    data: {
                        labels: fallbackChartData.months,
                        datasets: [{
                            label: label + ' (Fallback)',
                            data: fallbackChartData.values,
                            borderColor: '#000000', // Black line
                            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Black transparent fill
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: '#000000', // Black points
                            pointBorderColor: '#000000', // Black point borders
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: options
                });
                financialCharts[chartKey].update();
                canvas.style.display = 'block';
                console.log(`${chartKey} Chart rendered with fallback data.`);
            } catch (error) {
                console.error(`Error rendering ${chartKey} Chart with fallback data:`, error);
                canvas.style.display = 'none';
            }
        } else {
            console.error(`${chartKey} Chart canvas not found for ID: ${canvasId}`);
        }
    };

    renderChart('revenueChart', 'revenueChart', revenueOptions, 'Total Revenue ($)');
    renderChart('shippingChargesChart', 'shippingChargesChart', shippingChargesOptions, 'Shipping Charges ($)');
    renderChart('taxCollectedChart', 'taxCollectedChart', taxCollectedOptions, 'Tax Collected ($)');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing financial insights...");

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
    const defaultStartDate = '2024-05-19';
    const defaultEndDate = '2025-05-19';
    fetchFinancialInsightsData(1, defaultStartDate, defaultEndDate, 'last_1_year');
    console.log("Initial fetch completed with default range.");

    // Add event listener for the apply filters button
    const applyFiltersButton = document.getElementById('applyFilters');
    if (applyFiltersButton) {
        console.log("Apply Filters button found, attaching listener.");
        applyFiltersButton.addEventListener('click', () => {
            console.log("Apply Filters button clicked.");
            const dateRangeOption = document.getElementById('dateRangeOption').value;
            let startDate = document.getElementById('startDate').value;
            let endDate = document.getElementById('endDate').value;

            console.log("Captured filter parameters:", { dateRangeOption, startDate, endDate });

            // Handle date logic based on the selected option
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

            console.log("Calling fetchFinancialInsightsData with final parameters:", { page: 1, startDate, endDate, dateRangeOption });
            fetchFinancialInsightsData(1, startDate, endDate, dateRangeOption);
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