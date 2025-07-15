// Object to store all chart instances
const charts = {};

// Function to destroy a chart if it exists
function destroyChart(chartKey) {
    if (charts[chartKey] && typeof charts[chartKey].destroy === 'function') {
        charts[chartKey].destroy();
        delete charts[chartKey];
    }
}

// Function to update the Orders Over Time chart
function updateOrdersOverTimeChart(months, orderCounts) {
    const canvas = document.getElementById('ordersOverTimeChart');
    if (!canvas) return; // Skip if not on the EDA Charts page
    const ctx = canvas.getContext('2d');
    destroyChart('ordersOverTimeChart');
    if (months.length > 0 && orderCounts.length > 0) {
        charts['ordersOverTimeChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{ label: 'Number of Orders', data: orderCounts, borderColor: 'coral', fill: false }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
        canvas.style.display = 'block';
    } else {
        console.warn("No data for Orders Over Time Chart.");
        canvas.style.display = 'none';
    }
}

// Function to update the date range note
function updateDateRangeNote(startDate, endDate, dateRangeOption) {
    const noteElement = document.getElementById('dateRangeNote');
    if (noteElement) {
        if (dateRangeOption === 'all' && !startDate && !endDate) {
            noteElement.textContent = 'Showing all data.';
        } else if (startDate && endDate) {
            noteElement.textContent = `Showing data from ${startDate} to ${endDate}.`;
        } else {
            noteElement.textContent = `Showing data for the last 1 year (${startDate || '2024-04-01'} to ${endDate || '2025-04-01'}).`;
        }
        console.log("Date range note updated:", noteElement.textContent);
    } else {
        console.error("Date range note element not found.");
    }
}

// Fetch chart data and populate charts
function fetchChartData(selectedMonth = '') {
    console.log("Fetching chart data with parameters:", { selectedMonth });

    // Build the URL with query parameters
    const baseUrl = '/chart-data/';
    const params = new URLSearchParams();

    // Add month parameter if provided
    if (selectedMonth) {
        params.append('month', selectedMonth);
    }

    // Get date range parameters
    const dateRangeOption = document.getElementById('dateRangeOption') ? document.getElementById('dateRangeOption').value : 'last_1_year';
    let startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '2024-04-01';
    let endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '2025-04-01';

    if (dateRangeOption === 'all') {
        startDate = null;
        endDate = null;
    } else if (!startDate || !endDate) {
        startDate = '2024-04-01';
        endDate = '2025-04-01';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date.');
        return;
    }

    // Add date range parameters
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('date_range_option', dateRangeOption);

    // Construct the final URL
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    console.log("Fetching URL:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse JSON response:", text);
                    throw new Error("Invalid JSON response from server.");
                }
            });
        })
        .then(data => {
            if (data.error) {
                console.error("Error fetching chart data:", data.error);
                document.getElementById('error').textContent = data.error;
                document.getElementById('error').style.display = 'block';
                return;
            }

            // Populate the month filter dropdown (only on EDA Charts page)
            const monthFilter = document.getElementById('monthFilter');
            if (monthFilter) {
                monthFilter.innerHTML = '<option value="">All Months</option>';
                if (data.month_options && data.month_options.length > 0) {
                    data.month_options.forEach(month => {
                        const option = document.createElement('option');
                        option.value = month;
                        option.textContent = month;
                        monthFilter.appendChild(option);
                    });
                } else {
                    console.warn("No month options available.");
                }
            }

            // Update the date range note
            updateDateRangeNote(startDate, endDate, dateRangeOption);

            // EDA Charts (only render if the elements exist)
            const orderTotalsCanvas = document.getElementById('orderTotalsChart');
            if (orderTotalsCanvas) {
                const histLabels = data.hist_labels;
                const histValues = data.hist_values;
                console.log("Order Totals Data:", { labels: histLabels, values: histValues });
                destroyChart('orderTotalsChart');
                if (histLabels.length > 0 && histValues.length > 0) {
                    charts['orderTotalsChart'] = new Chart(orderTotalsCanvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: histLabels,
                            datasets: [{
                                label: 'Order Totals ($)', // Updated to reflect total_price
                                data: histValues,
                                backgroundColor: 'black'
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: { title: { display: true, text: 'Order Total Range ($)' } },
                                y: { beginAtZero: true, title: { display: true, text: 'Frequency' } }
                            }
                        }
                    });
                    orderTotalsCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Order Totals Chart.");
                    orderTotalsCanvas.style.display = 'none';
                }
            }

            const avgOrderValueCanvas = document.getElementById('averageOrderValueChart');
if (avgOrderValueCanvas) {
    const aovLabels = data.aov_labels;
    const aovValues = data.aov_values;
    console.log("Average Order Value Data:", { labels: aovLabels, values: aovValues });
    destroyChart('averageOrderValueChart');
    if (aovLabels.length > 0 && aovValues.length > 0) {
        charts['averageOrderValueChart'] = new Chart(avgOrderValueCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: aovLabels,
                datasets: [{
                    label: 'Average Order Value ($)',
                    data: aovValues,
                    borderColor: 'orange',
                    backgroundColor: 'rgba(255,165,0,0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'AOV ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
        avgOrderValueCanvas.style.display = 'block';
    } else {
        console.warn("No data for Average Order Value Chart.");
        avgOrderValueCanvas.style.display = 'none';
    }
}


            // Orders Over Time (already handled by updateOrdersOverTimeChart)
            updateOrdersOverTimeChart(data.months, data.order_counts);

            const totalsByStatusCanvas = document.getElementById('totalsByStatusChart');
            if (totalsByStatusCanvas) {
                const statuses = data.statuses;
                const means = data.means;
                const mins = data.mins;
                const maxs = data.maxs;
                console.log("Totals by Status Data:", { statuses: statuses, means: means });
                destroyChart('totalsByStatusChart');
                if (statuses.length > 0 && means.length > 0) {
                    charts['totalsByStatusChart'] = new Chart(totalsByStatusCanvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: statuses,
                            datasets: [
                                { label: 'Mean Total ($)', data: means, backgroundColor: 'rgba(100, 100, 100, 0.6)' },
                                { label: 'Min Total ($)', data: mins, backgroundColor: 'rgba(150, 150, 150, 0.6)' },
                                { label: 'Max Total ($)', data: maxs, backgroundColor: 'rgba(0, 0, 0, 0.6)' }
                            ]
                        },
                        options: { responsive: true, scales: { y: { beginAtZero: true } } }
                    });
                    totalsByStatusCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Totals by Status Chart.");
                    totalsByStatusCanvas.style.display = 'none';
                }
            }

            const totalByQuantityRangeCanvas = document.getElementById('totalByQuantityRangeChart');
if (totalByQuantityRangeCanvas) {
    const orderTotals = data.order_totals;
    const quantities = data.quantities;
    console.log("Grouped Bar Chart Data (Total by Quantity Range):", { totals: orderTotals, quantities: quantities });
    destroyChart('totalByQuantityRangeChart');

    if (orderTotals.length > 0 && quantities.length > 0) {
        // Bin quantities into ranges
        const maxQuantity = Math.max(...quantities, 0);
        const binSize = maxQuantity > 0 ? Math.ceil(maxQuantity / 5) : 1; // Create 5 bins
        const bins = Array.from({ length: 5 }, (_, i) => i * binSize);
        const labels = bins.map((bin, i) => {
            const nextBin = (i + 1) * binSize;
            return `${bin}-${nextBin - 1}`;
        });

        // Calculate average total price for each bin
        const avgTotals = bins.map((bin, i) => {
            const nextBin = (i + 1) * binSize;
            const filteredTotals = orderTotals.filter((_, idx) => {
                const qty = quantities[idx];
                return qty >= bin && qty < nextBin;
            });
            return filteredTotals.length > 0 ? filteredTotals.reduce((sum, val) => sum + val, 0) / filteredTotals.length : 0;
        });

        charts['totalByQuantityRangeChart'] = new Chart(totalByQuantityRangeCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Total Price ($)',
                    data: avgTotals,
                    backgroundColor: 'black'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Quantity Range' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Average Total Price ($)' } }
                }
            }
        });
        totalByQuantityRangeCanvas.style.display = 'block';
    } else {
        console.warn("No data for Total by Quantity Range Chart.");
        totalByQuantityRangeCanvas.style.display = 'none';
    }
}

            

            // RFM Analysis Charts (only render if the elements exist)
            const recencyCanvas = document.getElementById('rfm_recencyChart');
            if (recencyCanvas) {
                const recencyLabels = data.recency_hist_labels;
                const recencyValues = data.recency_hist_values;
                console.log("Recency Data:", { labels: recencyLabels, values: recencyValues });
                destroyChart('rfm_recencyChart');
                if (recencyLabels.length > 0 && recencyValues.length > 0) {
                    charts['rfm_recencyChart'] = new Chart(recencyCanvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: recencyLabels,
                            datasets: [{ label: 'Recency (Days)', data: recencyValues, backgroundColor: 'black' }]
                        },
                        options: { 
                            responsive: true, 
                            scales: { 
                                x: { title: { display: true, text: 'Recency Range (Days)' } }, 
                                y: { beginAtZero: true, title: { display: true, text: 'Frequency' } } 
                            } 
                        }
                    });
                    recencyCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Recency Chart.");
                    recencyCanvas.style.display = 'none';
                }
            }

            const frequencyCanvas = document.getElementById('rfm_frequencyChart');
            if (frequencyCanvas) {
                const freqLabels = data.freq_hist_labels;
                const freqValues = data.freq_hist_values;
                console.log("Frequency Data:", { labels: freqLabels, values: freqValues });
                destroyChart('rfm_frequencyChart');
                if (freqLabels.length > 0 && freqValues.length > 0) {
                    charts['rfm_frequencyChart'] = new Chart(frequencyCanvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: freqLabels,
                            datasets: [{ label: 'Frequency (Orders per Customer)', data: freqValues, backgroundColor: 'black' }]
                        },
                        options: { 
                            responsive: true, 
                            scales: { 
                                x: { title: { display: true, text: 'Frequency Range' } }, 
                                y: { beginAtZero: true, title: { display: true, text: 'Customer Count' } } 
                            } 
                        }
                    });
                    frequencyCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Frequency Chart.");
                    frequencyCanvas.style.display = 'none';
                }
            }

            const monetaryCanvas = document.getElementById('rfm_monetaryChart');
            if (monetaryCanvas) {
                const monetaryLabels = data.monetary_hist_labels;
                const monetaryValues = data.monetary_hist_values;
                console.log("Monetary Data:", { labels: monetaryLabels, values: monetaryValues });
                destroyChart('rfm_monetaryChart');
                if (monetaryLabels.length > 0 && monetaryValues.length > 0) {
                    charts['rfm_monetaryChart'] = new Chart(monetaryCanvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: monetaryLabels,
                            datasets: [{ label: 'Monetary (Total Price $)', data: monetaryValues, backgroundColor: 'black' }]
                        },
                        options: { 
                            responsive: true, 
                            scales: { 
                                x: { title: { display: true, text: 'Monetary Range ($)' } }, 
                                y: { beginAtZero: true, title: { display: true, text: 'Customer Count' } } 
                            } 
                        }
                    });
                    monetaryCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Monetary Chart.");
                    monetaryCanvas.style.display = 'none';
                }
            }

            // const freqByChurnCanvas = document.getElementById('rfm_freqByChurnChart');
            // if (freqByChurnCanvas) {
            //     const churnFreq = data.churn_freq; // Backend calculates churn: last order > 90 days from 2025-05-30
            //     console.log("Churn Frequency Data:", churnFreq);
            //     destroyChart('rfm_freqByChurnChart');
            //     if (churnFreq.length > 0) {
            //         charts['rfm_freqByChurnChart'] = new Chart(freqByChurnCanvas.getContext('2d'), {
            //             type: 'bar',
            //             data: {
            //                 labels: ['Non-Churned', 'Churned'],
            //                 datasets: [{ label: 'Avg Frequency (Orders)', data: churnFreq, backgroundColor: 'rgba(255, 206, 86, 0.6)' }]
            //             },
            //             options: { responsive: true, scales: { y: { beginAtZero: true } } }
            //         });
            //         freqByChurnCanvas.style.display = 'block';
            //     } else {
            //         console.warn("No data for Frequency by Churn Chart.");
            //         freqByChurnCanvas.style.display = 'none';
            //     }
            // }

            // const monetaryByChurnCanvas = document.getElementById('rfm_monetaryByChurnChart');
            // if (monetaryByChurnCanvas) {
            //     const churnMonetary = data.churn_monetary;
            //     console.log("Churn Monetary Data:", churnMonetary);
            //     destroyChart('rfm_monetaryByChurnChart');
            //     if (churnMonetary.length > 0) {
            //         charts['rfm_monetaryByChurnChart'] = new Chart(monetaryByChurnCanvas.getContext('2d'), {
            //             type: 'bar',
            //             data: {
            //                 labels: ['Non-Churned', 'Churned'],
            //                 datasets: [{ label: 'Avg Monetary (Total Price $)', data: churnMonetary, backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
            //             },
            //             options: { responsive: true, scales: { y: { beginAtZero: true } } }
            //         });
            //         monetaryByChurnCanvas.style.display = 'block';
            //     } else {
            //         console.warn("No data for Monetary by Churn Chart.");
            //         monetaryByChurnCanvas.style.display = 'none';
            //     }
            // }
            const churnCombinedCanvas = document.getElementById('rfm_churnCombinedChart');
if (churnCombinedCanvas) {
    const churnFreq = data.churn_freq; // [non-churned avg freq, churned avg freq]
    const churnMonetary = data.churn_monetary; // [non-churned avg monetary, churned avg monetary]
    console.log("Churn Combined Data:", { churnFreq, churnMonetary });
    destroyChart('rfm_churnCombinedChart');
    if (churnFreq.length > 0 && churnMonetary.length > 0) {
        charts['rfm_churnCombinedChart'] = new Chart(churnCombinedCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Non-Churned', 'Churned'],
                datasets: [
                    {
                        label: 'Avg Frequency (Orders)',
                        data: churnFreq,
                        backgroundColor: 'black',
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Avg Monetary (Total Price $)',
                        data: churnMonetary,
                        backgroundColor: 'grey',
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'Avg Frequency (Orders)' }
                    },
                    y2: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'Avg Monetary ($)' },
                        grid: { drawOnChartArea: false } // Avoid overlapping grid lines
                    }
                }
            }
        });
        churnCombinedCanvas.style.display = 'block';
    } else {
        console.warn("No data for Churn Combined Chart.");
        churnCombinedCanvas.style.display = 'none';
    }
}

            const recencyVsMonetaryCanvas = document.getElementById('rfm_recencyVsMonetaryChart');
            if (recencyVsMonetaryCanvas) {
                const recencyScatter = data.recency_scatter;
                const monetaryScatter = data.monetary_scatter;
                const churnScatter = data.churn_scatter;
                console.log("Recency vs Monetary Data:", { recency: recencyScatter, monetary: monetaryScatter, churn: churnScatter });
                destroyChart('rfm_recencyVsMonetaryChart');
                if (recencyScatter.length > 0 && monetaryScatter.length > 0) {
                    charts['rfm_recencyVsMonetaryChart'] = new Chart(recencyVsMonetaryCanvas.getContext('2d'), {
                        type: 'scatter',
                        data: {
                            datasets: [{
                                label: 'Recency vs Monetary (Churn Colored)',
                                data: recencyScatter.map((recency, i) => ({
                                    x: recency,
                                    y: monetaryScatter[i],
                                    backgroundColor: churnScatter[i] === 0 ? 'blue' : 'red'
                                })),
                            }]
                        },
                        options: { 
                            responsive: true, 
                            scales: { 
                                x: { title: { display: true, text: 'Recency (Days)' } }, 
                                y: { title: { display: true, text: 'Monetary (Total Price $)' } } 
                            } 
                        }
                    });
                    recencyVsMonetaryCanvas.style.display = 'block';
                } else {
                    console.warn("No data for Recency vs Monetary Chart.");
                    recencyVsMonetaryCanvas.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error("Error fetching chart data:", error);
            document.getElementById('error').textContent = `Failed to load chart data: ${error.message}`;
            document.getElementById('error').style.display = 'block';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing charts...");

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

        // Trigger initial state
        if (dateRangeDropdown.value === 'custom') {
            customDateRangeDiv.style.display = 'flex';
        } else {
            customDateRangeDiv.style.display = 'none';
        }
    }

    // Initial chart load
    fetchChartData();

    // Add event listener to Apply button
    const applyFiltersButton = document.getElementById('applyFilters');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', () => {
            console.log("Apply Filters clicked for date range");
            fetchChartData();
        });
    }
});
