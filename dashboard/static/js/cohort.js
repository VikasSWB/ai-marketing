// // Function to render the cohort revenue matrix
// function renderCohortMatrix(cohorts, revenueMatrix, monthLabels) {
//     const header = document.getElementById('cohortMatrixHeader');
//     const body = document.getElementById('cohortMatrixBody');
//     if (!header || !body) {
//         console.error("Cohort Matrix elements not found.");
//         return;
//     }

//     // Render header
//     header.innerHTML = '<th>Date of First Order</th><th>New Customers</th>';
//     monthLabels.forEach(label => {
//         header.innerHTML += `<th>${label}</th>`;
//     });

//     // Render body
//     body.innerHTML = '';
//     cohorts.forEach((cohort, i) => {
//         const row = document.createElement('tr');
//         const newCustomers = revenueMatrix[i][0].toLocaleString();
//         row.innerHTML = `<td>${cohort}</td><td>${newCustomers}</td>`;
//         const revenueData = revenueMatrix[i].slice(1);
//         if (revenueData.length < 12) {
//             while (revenueData.length < 12) revenueData.push(0);
//         }
//         revenueData.forEach((revenue, j) => {
//             const cell = document.createElement('td');
//             cell.className = 'heatmap-cell';
//             cell.textContent = `$${revenue.toLocaleString() || '0'}`;
//             // Updated revenue ranges
//             let backgroundColor = '#E0E0E0'; // Default light gray for zero
//             let textColor = '#000000';
//             if (revenue >= 1000) {
//                 backgroundColor = '#00CC00'; // Green for high revenue ($1000+)
//             } else if (revenue >= 500) {
//                 backgroundColor = '#99FF99'; // Light green for medium revenue ($500-$1000)
//             } else if (revenue >= 1) {
//                 backgroundColor = '#FFFF99'; // Yellow for low revenue ($1-$500)
//             }
//             cell.style.backgroundColor = backgroundColor;
//             cell.style.color = textColor;
//             row.appendChild(cell);
//         });
//         body.appendChild(row);
//     });
// }

// // Function to render the cohort metrics table
// function renderCohortMetrics(cohortMetrics) {
//     const body = document.getElementById('cohortMetricsBody');
//     if (!body) {
//         console.error("Cohort Metrics Body element not found.");
//         return;
//     }
//     body.innerHTML = '';

//     if (cohortMetrics.length === 0) {
//         const row = document.createElement('tr');
//         row.innerHTML = `<td colspan="6" style="text-align: center;">No cohort metrics data available.</td>`;
//         body.appendChild(row);
//     } else {
//         cohortMetrics.forEach(metric => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${metric.cohort}</td>
//                 <td>${metric.cohort_size}</td>
//                 <td>${metric.purchase_frequency}</td>
//                 <td>$${metric.aov.toLocaleString()}</td>
//                 <td>$${metric.revenue_per_customer.toLocaleString()}</td>
//                 <td>$${metric.ltv.toLocaleString()}</td>
//             `;
//             body.appendChild(row);
//         });
//     }
// }

// // Function to render pagination controls
// function renderPagination(totalPages, currentPage) {
//     const paginationContainer = document.getElementById('pagination');
//     if (!paginationContainer) {
//         const container = document.querySelector('.table-container:last-child');
//         const paginationDiv = document.createElement('div');
//         paginationDiv.id = 'pagination';
//         paginationDiv.className = 'pagination';
//         container.appendChild(paginationDiv);
//     }
//     const pagination = document.getElementById('pagination');
//     if (!pagination) {
//         console.error("Pagination container not found.");
//         return;
//     }
//     pagination.innerHTML = '';

//     const prevButton = document.createElement('button');
//     prevButton.textContent = 'Previous';
//     prevButton.disabled = currentPage === 1;
//     prevButton.onclick = () => fetchCohortData(currentPage - 1);
//     pagination.appendChild(prevButton);

//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//         startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     if (startPage > 1) {
//         const firstPage = document.createElement('span');
//         firstPage.textContent = '1';
//         firstPage.onclick = () => fetchCohortData(1);
//         pagination.appendChild(firstPage);
//         if (startPage > 2) {
//             const ellipsis = document.createElement('span');
//             ellipsis.textContent = '...';
//             ellipsis.className = 'ellipsis';
//             pagination.appendChild(ellipsis);
//         }
//     }

//     for (let i = startPage; i <= endPage; i++) {
//         const pageSpan = document.createElement('span');
//         pageSpan.textContent = i;
//         pageSpan.className = i === currentPage ? 'active' : '';
//         pageSpan.onclick = () => fetchCohortData(i);
//         pagination.appendChild(pageSpan);
//     }

//     if (endPage < totalPages) {
//         if (endPage < totalPages - 1) {
//             const ellipsis = document.createElement('span');
//             ellipsis.textContent = '...';
//             ellipsis.className = 'ellipsis';
//             pagination.appendChild(ellipsis);
//         }
//         const lastPage = document.createElement('span');
//         lastPage.textContent = totalPages;
//         lastPage.onclick = () => fetchCohortData(totalPages);
//         pagination.appendChild(lastPage);
//     }

//     const nextButton = document.createElement('button');
//     nextButton.textContent = 'Next';
//     nextButton.disabled = currentPage === totalPages;
//     nextButton.onclick = () => fetchCohortData(currentPage + 1);
//     pagination.appendChild(nextButton);
// }

// // Function to export cohort data as CSV
// function exportCohortData(exportData) {
//     const csvRows = [];
//     csvRows.push('Cohort,Customer Email');

//     for (const cohort in exportData) {
//         exportData[cohort].forEach(email => {
//             csvRows.push(`"${cohort}","${email}"`);
//         });
//     }

//     const csvContent = csvRows.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'cohort_data.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

// // Function to fetch cohort data
// function fetchCohortData(page = 1) {
//     const dateRangeOption = document.getElementById('dateRangeOption').value;
//     const startDate = document.getElementById('startDate').value;
//     const endDate = document.getElementById('endDate').value;
//     const errorElement = document.getElementById('error');

//     let url = `/cohort-data/?page=${page}`;
//     if (dateRangeOption) url += `&date_range_option=${dateRangeOption}`;
//     if (startDate && dateRangeOption !== 'all') url += `&start_date=${startDate}`;
//     if (endDate && dateRangeOption !== 'all') url += `&end_date=${endDate}`;

//     fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.error) {
//                 errorElement.textContent = data.error;
//                 errorElement.style.display = 'block';
//                 return;
//             }

//             errorElement.style.display = 'none';
//             updateDateRangeNote(startDate, endDate, dateRangeOption);
//             renderCohortMatrix(data.cohorts, data.revenue_matrix, data.month_labels);
//             renderCohortMetrics(data.cohort_metrics);
//             renderPagination(data.total_pages, data.current_page);

//             const exportButton = document.getElementById('exportCohortData');
//             exportButton.onclick = () => exportCohortData(data.export_data);
//         })
//         .catch(error => {
//             console.error('Error fetching cohort data:', error);
//             errorElement.textContent = `Error fetching data: ${error.message}. Check server logs.`;
//             errorElement.style.display = 'block';
//         });
// }

// // Function to update the date range note
// function updateDateRangeNote(startDate, endDate, dateRangeOption) {
//     const dateRangeNote = document.getElementById('dateRangeNote');
//     if (!dateRangeNote) return;

//     if (dateRangeOption === 'all') {
//         dateRangeNote.textContent = 'Showing all available data.';
//     } else if (startDate && endDate) {
//         dateRangeNote.textContent = `Showing data from ${startDate} to ${endDate}.`;
//     } else {
//         const today = new Date();
//         const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
//         const formatDate = (date) => date.toISOString().split('T')[0];
//         dateRangeNote.textContent = `Showing data from ${formatDate(oneYearAgo)} to ${formatDate(today)}.`;
//     }
// }

// // Event listeners
// document.addEventListener('DOMContentLoaded', () => {
//     fetchCohortData();

//     const applyFiltersButton = document.getElementById('applyFilters');
//     applyFiltersButton.addEventListener('click', () => fetchCohortData());
// });

// Function to render the cohort revenue matrix
function renderCohortMatrix(cohorts, revenueMatrix, monthLabels) {
    const body = document.getElementById('cohortMatrix');
    if (!body) {
        console.error("Cohort Matrix element not found.");
        return;
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'table-fancy';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Render header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th style="padding: 12px; background-color: #f8f9fa; color: #333; font-weight: 500; text-align: left; border-bottom: 1px solid #eee;">Date of First Order</th><th style="padding: 12px; background-color: #f8f9fa; color: #333; font-weight: 500; text-align: left; border-bottom: 1px solid #eee;">New Customers</th>';
    monthLabels.forEach(label => {
        headerRow.innerHTML += `<th style="padding: 12px; background-color: #f8f9fa; color: #333; font-weight: 500; text-align: left; border-bottom: 1px solid #eee;">${label}</th>`;
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Render body
    const tbody = document.createElement('tbody');
    cohorts.forEach((cohort, i) => {
        const row = document.createElement('tr');
        const newCustomers = revenueMatrix[i][0].toLocaleString();
        row.innerHTML = `<td style="padding: 12px; color: #333; border-top: 1px solid #eee; border-left: 4px solid #ddd;">${cohort}</td><td style="padding: 12px; color: #333; border-top: 1px solid #eee;">${newCustomers}</td>`;
        const revenueData = revenueMatrix[i].slice(1);
        if (revenueData.length < 12) {
            while (revenueData.length < 12) revenueData.push(0);
        }
        revenueData.forEach((revenue, j) => {
            const cell = document.createElement('td');
            cell.className = 'heatmap-cell';
            cell.textContent = `$${revenue.toLocaleString() || '0'}`;
            let backgroundColor = '#E0E0E0'; // Default for zero
            let textColor = '#000000';
            if (revenue >= 1000) {
                backgroundColor = '#00CC00'; // High revenue
            } else if (revenue >= 500) {
                backgroundColor = '#99FF99'; // Medium revenue
            } else if (revenue >= 1) {
                backgroundColor = '#FFFF99'; // Low revenue
            }
            cell.style.backgroundColor = backgroundColor;
            cell.style.color = textColor;
            cell.style.padding = '12px';
            cell.style.borderTop = '1px solid #eee';
            row.appendChild(cell);
        });
        row.style.backgroundColor = '#fff';
        row.style.transition = 'background-color 0.2s ease';
        row.onmouseover = () => row.style.backgroundColor = '#f9f9f9';
        row.onmouseout = () => row.style.backgroundColor = '#fff';
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Clear and append table
    body.innerHTML = '';
    body.appendChild(table);
}

// Function to render the cohort metrics table
function renderCohortMetrics(cohortMetrics) {
    const body = document.getElementById('summaryTableBody');
    if (!body) {
        console.error("Cohort Metrics Body element not found.");
        return;
    }
    body.innerHTML = '';

    if (cohortMetrics.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="padding: 12px; text-align: center; color: #333; border-top: 1px solid #eee;">No cohort metrics data available.</td>`;
        body.appendChild(row);
    } else {
        cohortMetrics.forEach(metric => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee; border-left: 4px solid #ddd;">${metric.cohort}</td>
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee;">${metric.cohort_size}</td>
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee;">${metric.purchase_frequency}</td>
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee;">$${metric.aov.toLocaleString()}</td>
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee;">$${metric.revenue_per_customer.toLocaleString()}</td>
                <td style="padding: 12px; color: #333; border-top: 1px solid #eee;">$${metric.ltv.toLocaleString()}</td>
            `;
            row.style.backgroundColor = '#fff';
            row.style.transition = 'background-color 0.2s ease';
            row.onmouseover = () => row.style.backgroundColor = '#f9f9f9';
            row.onmouseout = () => row.style.backgroundColor = '#fff';
            body.appendChild(row);
        });
    }
}

// Function to render pagination controls
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        console.error("Pagination container not found.");
        return;
    }
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.className = 'btn btn-outline-primary btn-sm me-2';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => fetchCohortData(currentPage - 1);
    paginationContainer.appendChild(prevButton);

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        const firstPage = document.createElement('button');
        firstPage.className = 'btn btn-outline-primary btn-sm me-1';
        firstPage.textContent = '1';
        firstPage.onclick = () => fetchCohortData(1);
        paginationContainer.appendChild(firstPage);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.margin = '0 8px';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `btn btn-sm me-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => fetchCohortData(i);
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.margin = '0 8px';
            paginationContainer.appendChild(ellipsis);
        }
        const lastPage = document.createElement('button');
        lastPage.className = 'btn btn-outline-primary btn-sm me-2';
        lastPage.textContent = totalPages;
        lastPage.onclick = () => fetchCohortData(totalPages);
        paginationContainer.appendChild(lastPage);
    }

    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-outline-primary btn-sm';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => fetchCohortData(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

// Function to export cohort data as CSV
function exportCohortData(exportData) {
    const csvRows = [];
    csvRows.push('Cohort,Customer Email');

    for (const cohort in exportData) {
        exportData[cohort].forEach(email => {
            csvRows.push(`"${cohort}","${email}"`);
        });
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cohort_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to export cohort metrics table as CSV
function exportSummary() {
    const rows = document.querySelectorAll('#summaryTableBody tr');
    const csvRows = ['Cohort,Cohort Size,Purchase Frequency,AOV ($),Revenue per Customer ($),LTV ($)'];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 6) {
            const cohort = cells[0].textContent;
            const cohortSize = cells[1].textContent;
            const purchaseFrequency = cells[2].textContent;
            const aov = cells[3].textContent.replace('$', '');
            const revenuePerCustomer = cells[4].textContent.replace('$', '');
            const ltv = cells[5].textContent.replace('$', '');
            csvRows.push(`"${cohort}",${cohortSize},${purchaseFrequency},${aov},${revenuePerCustomer},${ltv}`);
        }
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cohort_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to fetch cohort data
function fetchCohortData(page = 1, startDate = null, endDate = null) {
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const startDateInput = document.getElementById('dateRangeStart');
    const endDateInput = document.getElementById('dateRangeEnd');
    const errorElement = document.getElementById('errorMessage');

    let url = `/cohort-data/?page=${page}`;
    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;

    if (dateRangeSelect.value === 'last_1_year' || !startDate || !endDate) {
        const today = new Date();
        const defaultStartDate = new Date(today);
        defaultStartDate.setFullYear(today.getFullYear() - 1);
        effectiveStartDate = defaultStartDate.toISOString().split('T')[0];
        effectiveEndDate = today.toISOString().split('T')[0];
    } else {
        effectiveStartDate = startDateInput.value;
        effectiveEndDate = endDateInput.value;
    }

    url += `&start_date=${effectiveStartDate}&end_date=${effectiveEndDate}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                errorElement.textContent = data.error;
                errorElement.classList.remove('d-none');
                return;
            }

            errorElement.classList.add('d-none');
            updateDateRangeNote(effectiveStartDate, effectiveEndDate);
            renderCohortMatrix(data.cohorts, data.revenue_matrix, data.month_labels);
            renderCohortMetrics(data.cohort_metrics);
            renderPagination(data.total_pages, data.current_page);

            const exportButton = document.getElementById('exportCohortMetrics');
            exportButton.onclick = () => exportSummary();
            const exportCohortButton = document.createElement('button');
            exportCohortButton.className = 'btn btn-outline-success ms-2';
            exportCohortButton.textContent = 'Export Cohort Emails';
            exportCohortButton.onclick = () => exportCohortData(data.export_data);
            exportButton.parentNode.appendChild(exportCohortButton);
        })
        .catch(error => {
            console.error('Error fetching cohort data:', error);
            errorElement.textContent = `Error fetching data: ${error.message}. Check server logs.`;
            errorElement.classList.remove('d-none');
        });
}

// Function to update the date range note
function updateDateRangeNote(startDate, endDate) {
    const dateRangeDisplay = document.getElementById('currentDateRange');
    if (!dateRangeDisplay) return;

    dateRangeDisplay.textContent = `${startDate} to ${endDate}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch with default "Last 1 Year"
    fetchCohortData();

    // Handle dropdown change
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const customDateRange = document.getElementById('customDateRange');
    const applyCustomDate = document.getElementById('applyCustomDate');
    const startDateInput = document.getElementById('dateRangeStart');
    const endDateInput = document.getElementById('dateRangeEnd');

    dateRangeSelect.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            customDateRange.classList.remove('d-none');
        } else {
            // customDateRange.classList.add('d-none');
            const today = new Date();
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);
            startDateInput.value = lastYear.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
            fetchCohortData();
        }
    });

    applyCustomDate.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        if (start > end) {
            alert('Start date must be before end date.');
            return;
        }

        if (end > today) {
            alert('End date cannot be in the future.');
            return;
        }

        fetchCohortData(1, startDate, endDate);
    });

    startDateInput.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const today = new Date();
                if (start <= end && end <= today) {
                    fetchCohortData(1, startDate, endDate);
                }
            }
        }
    });

    endDateInput.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const today = new Date();
                if (start <= end && end <= today) {
                    fetchCohortData(1, startDate, endDate);
                }
            }
        }
    });
});