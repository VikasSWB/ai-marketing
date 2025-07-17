
// const charts = {
//     ordersRevenue: null,
//     yearlySales: null,
//     orderStatus: null,
//     paymentMethod: null,
//     avgOrderValue: null,
//     paymentPopularity: null
// };

// // Chart options
// const ordersRevenueOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         yOrders: {
//             type: 'linear',
//             position: 'left',
//             title: {
//                 display: true,
//                 text: 'Number of Orders'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         yRevenue: {
//             type: 'linear',
//             position: 'right',
//             title: {
//                 display: true,
//                 text: 'Revenue ($)'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Month'
//             },
//             grid: {
//                 display: false
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Orders and Revenue Over Time',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             position: 'top'
//         },
//         tooltip: {
//             mode: 'index',
//             intersect: false
//         }
//     },
//     interaction: {
//         mode: 'nearest',
//         intersect: false
//     }
// };

// const yearlySalesComparisonOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Sales ($)'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Month'
//             },
//             grid: {
//                 display: false
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Yearly Sales Comparison',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             position: 'top'
//         },
//         tooltip: {
//             mode: 'index',
//             intersect: false
//         }
//     },
//     interaction: {
//         mode: 'nearest',
//         intersect: false
//     }
// };

// const orderStatusOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Average Order Total ($)'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Order Status'
//             },
//             grid: {
//                 display: false
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Order Status Breakdown',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             display: false
//         }
//     }
// };

// const paymentMethodOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Total Revenue ($)'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Payment Method'
//             },
//             grid: {
//                 display: false
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Revenue by Payment Method',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             display: false
//         }
//     }
// };

// const avgOrderValueOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Average Order Value ($)'
//             },
//             grid: {
//                 display: false
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Customer Email'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 maxRotation: 45,
//                 minRotation: 45
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Average Order Value by Customer',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             display: false
//         }
//     }
// };

// const paymentPopularityOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//         title: {
//             display: true,
//             text: 'Payment Method Popularity',
//             font: {
//                 size: 16
//             }
//         },
//         legend: {
//             position: 'top'
//         }
//     }
// };

// // Fetch and render dashboard data
// function fetchDashboardData() {
//     const dateRange = document.getElementById('dateRange').value || '365';
//     fetch(`/api/dashboard-data/?date_range=${dateRange}`)
//         .then(response => response.json())
//         .then(data => {
//             // Update KPI Cards
//             document.getElementById('todayCustomers').textContent = data.today_customers;
//             document.getElementById('todayProducts').textContent = data.today_products;
//             document.getElementById('totalOrders').textContent = data.total_orders;
//             document.getElementById('totalRevenue').textContent = `$${data.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

//             // Orders and Revenue Over Time
//             if (charts.ordersRevenue) charts.ordersRevenue.destroy();
//             charts.ordersRevenue = new Chart(document.getElementById('ordersRevenueChart'), {
//                 type: 'line',
//                 data: {
//                     labels: data.orders_revenue.labels,
//                     datasets: [
//                         {
//                             label: 'Orders',
//                             data: data.orders_revenue.orders,
//                             borderColor: '#007bff',
//                             yAxisID: 'yOrders',
//                             fill: false
//                         },
//                         {
//                             label: 'Revenue',
//                             data: data.orders_revenue.revenue,
//                             borderColor: '#28a745',
//                             yAxisID: 'yRevenue',
//                             fill: false
//                         }
//                     ]
//                 },
//                 options: ordersRevenueOptions
//             });

//             // Yearly Sales Comparison
//             if (charts.yearlySales) charts.yearlySales.destroy();
//             charts.yearlySales = new Chart(document.getElementById('yearlySalesChart'), {
//                 type: 'line',
//                 data: {
//                     labels: data.yearly_sales.labels,
//                     datasets: [
//                         {
//                             label: 'Sales',
//                             data: data.yearly_sales.sales,
//                             borderColor: '#ff073a',
//                             fill: false
//                         }
//                     ]
//                 },
//                 options: yearlySalesComparisonOptions
//             });

//             // Order Status Breakdown
//             if (charts.orderStatus) charts.orderStatus.destroy();
//             charts.orderStatus = new Chart(document.getElementById('orderStatusChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.order_status.labels,
//                     datasets: [
//                         {
//                             label: 'Average Order Total',
//                             data: data.order_status.data,
//                             backgroundColor: '#007bff'
//                         }
//                     ]
//                 },
//                 options: orderStatusOptions
//             });

//             // Revenue by Payment Method
//             if (charts.paymentMethod) charts.paymentMethod.destroy();
//             charts.paymentMethod = new Chart(document.getElementById('paymentMethodChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.payment_method.labels,
//                     datasets: [
//                         {
//                             label: 'Revenue',
//                             data: data.payment_method.data,
//                             backgroundColor: '#28a745'
//                         }
//                     ]
//                 },
//                 options: paymentMethodOptions
//             });

//             // Average Order Value by Customer
//             if (charts.avgOrderValue) charts.avgOrderValue.destroy();
//             charts.avgOrderValue = new Chart(document.getElementById('avgOrderValueChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.avg_order_value.labels,
//                     datasets: [
//                         {
//                             label: 'Average Order Value',
//                             data: data.avg_order_value.data,
//                             backgroundColor: '#ff073a'
//                         }
//                     ]
//                 },
//                 options: avgOrderValueOptions
//             });

//             // Payment Method Popularity
//             if (charts.paymentPopularity) charts.paymentPopularity.destroy();
//             charts.paymentPopularity = new Chart(document.getElementById('paymentPopularityChart'), {
//                 type: 'doughnut',
//                 data: {
//                     labels: data.payment_popularity.labels,
//                     datasets: [
//                         {
//                             label: 'Popularity',
//                             data: data.payment_popularity.data,
//                             backgroundColor: ['#007bff', '#28a745', '#ff073a', '#ffc107', '#17a2b8']
//                         }
//                     ]
//                 },
//                 options: paymentPopularityOptions
//             });

//             // Recent Orders Table
//             const recentOrdersTableBody = document.getElementById('recentOrdersTableBody');
//             recentOrdersTableBody.innerHTML = '';
//             data.recent_orders.forEach(order => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${order.order_number}</td>
//                     <td>${new Date(order.created_at).toLocaleDateString()}</td>
//                     <td>${order.customer_name}</td>
//                     <td>$${order.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
//                     <td>${order.order_status}</td>
//                 `;
//                 recentOrdersTableBody.appendChild(row);
//             });

//             // Top Products Table
//             const topProductsTableBody = document.getElementById('topProductsTableBody');
//             topProductsTableBody.innerHTML = '';
//             data.top_products.forEach(product => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${product.product}</td>
//                     <td>${product.count}</td>
//                 `;
//                 topProductsTableBody.appendChild(row);
//             });

//             // Discount Usage Table
//             const discountUsageTableBody = document.getElementById('discountUsageTableBody');
//             discountUsageTableBody.innerHTML = '';
//             data.discount_usage.forEach(discount => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${discount.coupon_code}</td>
//                     <td>${discount.times_used}</td>
//                 `;
//                 discountUsageTableBody.appendChild(row);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching dashboard data:', error);
//             alert('Failed to load dashboard data. Please try again.');
//         });
// }

// // Export dashboard as PDF using jsPDF with manual content rendering
// function exportDashboardAsPDF() {
//     setTimeout(() => {
//         const element = document.querySelector('.content');
//         if (!element) {
//             alert('Error: Dashboard content not found.');
//             return;
//         }

//         // Store the current state of accordion sections
//         const collapses = document.querySelectorAll('.accordion-collapse');
//         const collapseStates = Array.from(collapses).map(collapse => collapse.classList.contains('show'));

//         // Temporarily expand all accordion sections
//         collapses.forEach(collapse => collapse.classList.add('show'));

//         // Ensure charts are fully rendered by forcing a resize and disabling animations
//         Object.values(charts).forEach(chart => {
//             if (chart) {
//                 chart.options.animation = false;
//                 chart.resize();
//                 chart.update();
//             }
//         });

//         // Initialize jsPDF
//         const { jsPDF } = window.jspdf;
//         const doc = new jsPDF({
//             orientation: 'portrait',
//             unit: 'in',
//             format: 'letter'
//         });

//         // Page dimensions (letter size: 8.5in x 11in) with 0.5in margins
//         const pageWidth = 8.5 - 1;
//         const margin = 0.5;
//         let yPosition = margin;

//         // Helper function to add a new page if needed
//         const addNewPageIfNeeded = (requiredHeight) => {
//             if (yPosition + requiredHeight > 11 - margin) {
//                 doc.addPage();
//                 yPosition = margin;
//             }
//         };

//         // Helper function to add text with wrapping
//         const addText = (text, x, y, fontSize = 12, maxWidth = pageWidth) => {
//             doc.setFontSize(fontSize);
//             const lines = doc.splitTextToSize(text, maxWidth);
//             addNewPageIfNeeded(lines.length * (fontSize / 72));
//             doc.text(lines, x, y);
//             return lines.length * (fontSize / 72);
//         };

//         // 1. Add Navbar (Title and Date Range)
//         const navbar = document.querySelector('.navbar');
//         const title = navbar.querySelector('h1').textContent;
//         const dateRange = document.querySelector('#dateRange')?.value || 'Unknown Date Range';
//         yPosition += addText(title, margin, yPosition, 16);
//         yPosition += addText(`Date Range: ${dateRange}`, margin, yPosition, 10);
//         yPosition += 0.2;

//         // 2. Add KPI Cards
//         const statCards = document.querySelectorAll('.stat-card');
//         statCards.forEach(card => {
//             const label = card.querySelector('h3').textContent;
//             const value = card.querySelector('p').textContent;
//             addNewPageIfNeeded(0.3);
//             yPosition += addText(`${label}: ${value}`, margin, yPosition, 10);
//             yPosition += 0.1;
//         });
//         yPosition += 0.2;

//         // 3. Add Charts
//         const chartCanvases = document.querySelectorAll('.chart-container canvas');
//         const chartPromises = Array.from(chartCanvases).map((canvas, index) => {
//             const chart = Chart.getChart(canvas);
//             if (chart) {
//                 try {
//                     const imgData = chart.toBase64Image('image/png');
//                     if (!imgData.startsWith('data:image/png;base64,')) {
//                         throw new Error('Invalid chart image data');
//                     }

//                     const img = new Image();
//                     img.src = imgData;

//                     const chartTitles = {
//                         ordersRevenue: 'Orders and Revenue Over Time',
//                         yearlySales: 'Yearly Sales Comparison',
//                         orderStatus: 'Order Status Breakdown',
//                         paymentMethod: 'Revenue by Payment Method',
//                         avgOrderValue: 'Average Order Value by Customer',
//                         paymentPopularity: 'Payment Method Popularity'
//                     };
//                     const chartKey = Object.keys(charts).find(key => charts[key] === chart);
//                     const chartTitle = chart.options.plugins?.title?.text || chartTitles[chartKey] || `Chart ${index + 1}`;

//                     return new Promise((resolve, reject) => {
//                         img.onload = () => {
//                             const imgWidth = img.width;
//                             const imgHeight = img.height;

//                             const chartWidth = pageWidth;
//                             const chartHeight = (chartWidth / imgWidth) * imgHeight;

//                             addNewPageIfNeeded(0.2);
//                             yPosition += addText(chartTitle, margin, yPosition, 12);
//                             yPosition += 0.1;

//                             addNewPageIfNeeded(chartHeight);
//                             doc.addImage(imgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
//                             yPosition += chartHeight + 0.2;

//                             resolve();
//                         };
//                         img.onerror = () => {
//                             addNewPageIfNeeded(0.2);
//                             yPosition += addText(`[Error rendering chart ${index + 1}]`, margin, yPosition, 10);
//                             yPosition += 0.1;
//                             resolve();
//                         };
//                     });
//                 } catch (error) {
//                     addNewPageIfNeeded(0.2);
//                     yPosition += addText(`[Error rendering chart: ${error.message}]`, margin, yPosition, 10);
//                     yPosition += 0.1;
//                     return Promise.resolve();
//                 }
//             }
//             return Promise.resolve();
//         });

//         Promise.all(chartPromises).then(() => {
//             // 4. Add Tables
//             const tables = [
//                 { title: 'Recent Orders', selector: '#recentOrdersTable' },
//                 { title: 'Top Products by Sales', selector: '#topProductsTable' },
//                 { title: 'Discount Usage Overview', selector: '#discountUsageTable' }
//             ];

//             tables.forEach(tableInfo => {
//                 const table = document.querySelector(tableInfo.selector);
//                 if (table) {
//                     addNewPageIfNeeded(0.2);
//                     yPosition += addText(tableInfo.title, margin, yPosition, 12);
//                     yPosition += 0.1;

//                     const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
//                     const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
//                         Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
//                     );

//                     const tableData = rows.map(row => row.map(cell => ({ content: cell })));

//                     const rowHeight = 0.2;
//                     const tableHeight = (headers.length > 0 ? 1 : 0) + rows.length * rowHeight;

//                     addNewPageIfNeeded(tableHeight);
//                     doc.autoTable({
//                         head: [headers],
//                         body: rows,
//                         startY: yPosition,
//                         margin: { left: margin, right: margin },
//                         styles: { fontSize: 8, cellPadding: 0.1 },
//                         headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
//                         bodyStyles: { textColor: [0, 0, 0] }
//                     });

//                     yPosition = doc.lastAutoTable.finalY + 0.2;
//                 }
//             });

//             doc.save(`Dashboard_Export_${new Date().toISOString().split('T')[0]}.pdf`);

//             collapses.forEach((collapse, index) => {
//                 if (!collapseStates[index]) {
//                     collapse.classList.remove('show');
//                 }
//             });

//             Object.values(charts).forEach(chart => {
//                 if (chart) {
//                     chart.options.animation = true;
//                     chart.update();
//                 }
//             });
//         }).catch(error => {
//             alert('Failed to export as PDF. Please try again.');
//             collapses.forEach((collapse, index) => {
//                 if (!collapseStates[index]) {
//                     collapse.classList.remove('show');
//                 }
//             });
//             Object.values(charts).forEach(chart => {
//                 if (chart) {
//                     chart.options.animation = true;
//                     chart.update();
//                 }
//             });
//         });

//     }, 3000);
// }

// // Event Listeners
// document.addEventListener('DOMContentLoaded', () => {
//     fetchDashboardData();

//     // Date Range Filter
//     document.getElementById('dateRange').addEventListener('change', () => {
//         fetchDashboardData();
//     });

//     // Bootstrap handles the collapsible sidebar functionality via data-bs-toggle="collapse"
//     // No additional JavaScript is needed for the sidebar toggling
// });


// const charts = {
//     ordersRevenue: null,
//     yearlySales: null,
//     orderStatus: null,
//     paymentMethod: null,
//     avgOrderValue: null,
//     paymentPopularity: null
// };

// // Chart options (unchanged)
// const ordersRevenueOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         yOrders: {
//             type: 'linear',
//             position: 'left',
//             title: {
//                 display: true,
//                 text: 'Number of Orders',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.1)'
//             },
//             ticks: {
//                 color: 'black'
//             }
//         },
//         yRevenue: {
//             type: 'linear',
//             position: 'right',
//             title: {
//                 display: true,
//                 text: 'Revenue ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black',
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Month',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Orders and Revenue Over Time',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             position: 'top',
//             labels: {
//                 color: 'black'
//             }
//         },
//         tooltip: {
//             mode: 'index',
//             intersect: false,
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     },
//     interaction: {
//         mode: 'nearest',
//         intersect: false
//     }
// };

// const yearlySalesComparisonOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Sales ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.05)'
//             },
//             ticks: {
//                 color: 'black',
//                 callback: function(value) {
//                     return '$' + value.toLocaleString();
//                 }
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Month',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Yearly Sales Comparison',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             position: 'top',
//             labels: {
//                 color: 'black'
//             }
//         },
//         tooltip: {
//             mode: 'index',
//             intersect: false,
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { family: 'Roboto', size: 14, color: 'black' },
//             bodyFont: { family: 'Roboto', size: 12, color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1,
//             callbacks: {
//                 label: function(context) {
//                     let label = context.dataset.label || '';
//                     if (label) {
//                         label += ': ';
//                     }
//                     if (context.parsed.y !== null) {
//                         label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
//                     }
//                     return label;
//                 }
//             }
//         }
//     },
//     interaction: {
//         mode: 'nearest',
//         intersect: false
//     }
// };

// const orderStatusOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Average Order Total ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.1)'
//             },
//             ticks: {
//                 color: 'black'
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Order Status',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Order Status Breakdown',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     }
// };

// const paymentMethodOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Total Revenue ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.1)'
//             },
//             ticks: {
//                 color: 'black'
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Payment Method',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Revenue by Payment Method',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     }
// };

// const avgOrderValueOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Average Order Value ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.1)'
//             },
//             ticks: {
//                 color: 'black'
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Customer Email',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 maxRotation: 45,
//                 minRotation: 45,
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Average Order Value by Customer',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     }
// };

// const paymentPopularityOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//         title: {
//             display: true,
//             text: 'Payment Method Popularity',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             position: 'top',
//             labels: {
//                 color: 'black'
//             }
//         },
//         tooltip: {
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     }
// };

// function renderYearlySalesChart(chartData) {
//     const ctx = document.getElementById('yearlySalesChart').getContext('2d');

//     // Clean up previous instance
//     if (charts.yearlySales) charts.yearlySales.destroy();

//     // Recreate gradients for consistent styling
//     const gradientBlack = ctx.createLinearGradient(0, 0, 0, 200);
//     gradientBlack.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
//     gradientBlack.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

//     const gradientGray = ctx.createLinearGradient(0, 0, 0, 200);
//     gradientGray.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
//     gradientGray.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

//     // Apply same color logic based on number of datasets
//     chartData.datasets.forEach((dataset, index) => {
//         if (chartData.datasets.length === 1) {
//             // Single-line (custom range): use black gradient
//             dataset.borderColor = 'black';
//             dataset.backgroundColor = gradientBlack;
//         } else {
//             // Two-line (default): apply separate gradients
//             if (index === 0) {
//                 dataset.borderColor = 'black';
//                 dataset.backgroundColor = gradientBlack;
//             } else {
//                 dataset.borderColor = 'rgba(0, 0, 0, 0.5)';
//                 dataset.backgroundColor = gradientGray;
//             }
//         }
//         dataset.fill = true;
//         dataset.tension = 0.4;
//     });

//     charts.yearlySales = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: chartData.labels,
//             datasets: chartData.datasets
//         },
//         options: yearlySalesComparisonOptions
//     });
// }


// // Fetch and render dashboard data
// function fetchDashboardData(startDate, endDate) {
//     let url;
//     const today = new Date();
//     let defaultStartDate;

//     if (!startDate || !endDate) {
//         // Default to last 1 year
//         defaultStartDate = new Date(today);
//         defaultStartDate.setFullYear(today.getFullYear() - 1);
//         startDate = defaultStartDate.toISOString().split('T')[0];
//         endDate = today.toISOString().split('T')[0];
//     }

//     url = `/api/dashboard-data/?start_date=${startDate}&end_date=${endDate}`;
//     console.log('Fetching data with URL:', url); // Debugging

//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             console.log('Data received:', data); // Debugging

//             // Update KPI Cards
//             document.getElementById('todayCustomers').textContent = data.today_customers;
//             document.getElementById('todayProducts').textContent = data.today_products;
//             document.getElementById('totalOrders').textContent = data.total_orders;
//             document.getElementById('totalRevenue').textContent = `$${data.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

//             // Orders and Revenue Over Time
//             if (charts.ordersRevenue) charts.ordersRevenue.destroy();
//             charts.ordersRevenue = new Chart(document.getElementById('ordersRevenueChart'), {
//                 type: 'line',
//                 data: {
//                     labels: data.orders_revenue.labels,
//                     datasets: [
//                         {
//                             label: 'Orders',
//                             data: data.orders_revenue.orders,
//                             borderColor: 'black',
//                             backgroundColor: 'rgba(0, 0, 0, 0.2)',
//                             yAxisID: 'yOrders',
//                             fill: false,
//                             tension: 0.4,
//                             pointBackgroundColor: 'black',
//                             pointBorderColor: 'black',
//                             pointRadius: 4,
//                             pointHoverRadius: 6
//                         },
//                         {
//                             label: 'Revenue',
//                             data: data.orders_revenue.revenue,
//                             borderColor: 'rgba(0, 0, 0, 0.6)',
//                             backgroundColor: 'rgba(0, 0, 0, 0.1)',
//                             yAxisID: 'yRevenue',
//                             fill: false,
//                             tension: 0.4,
//                             pointBackgroundColor: 'rgba(0, 0, 0, 0.6)',
//                             pointBorderColor: 'rgba(0, 0, 0, 0.6)',
//                             pointRadius: 4,
//                             pointHoverRadius: 6
//                         }
//                     ]
//                 },
//                 options: ordersRevenueOptions
//             });

//             // Yearly Sales Comparison
//             // if (charts.yearlySales) charts.yearlySales.destroy();
//             // const yearlyChartCanvas = document.getElementById('yearlySalesChart');
//             // const yearlyCtx = yearlyChartCanvas.getContext('2d');
//             // const thisYearGradient = yearlyCtx.createLinearGradient(0, 0, 0, 200);
//             // thisYearGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
//             // thisYearGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
//             // const lastYearGradient = yearlyCtx.createLinearGradient(0, 0, 0, 200);
//             // lastYearGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
//             // lastYearGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

//             // charts.yearlySales = new Chart(yearlyChartCanvas, {
//             //     type: 'line',
//             //     data: {
//             //         labels: data.yearly_sales.labels,
//             //         datasets: [
//             //             {
//             //                 label: 'This Year Sales',
//             //                 data: data.yearly_sales.sales,
//             //                 borderColor: 'black',
//             //                 backgroundColor: thisYearGradient,
//             //                 fill: true,
//             //                 tension: 0.4,
//             //                 borderWidth: 3,
//             //                 pointRadius: 3,
//             //                 pointHoverRadius: 5,
//             //                 pointBackgroundColor: 'black',
//             //                 pointHoverBackgroundColor: 'rgba(0, 0, 0, 0.8)'
//             //             },
//             //             {
//             //                 label: 'Last Year Sales',
//             //                 data: data.yearly_sales.sales.map((_, i) => data.yearly_sales.sales[i] * 0.8),
//             //                 borderColor: 'rgba(0, 0, 0, 0.5)',
//             //                 backgroundColor: lastYearGradient,
//             //                 fill: true,
//             //                 tension: 0.4,
//             //                 borderWidth: 2,
//             //                 pointRadius: 3,
//             //                 pointHoverRadius: 5,
//             //                 pointBackgroundColor: 'rgba(0, 0, 0, 0.5)',
//             //                 pointHoverBackgroundColor: 'rgba(0, 0, 0, 0.7)'
//             //             }
//             //         ]
//             //     },
//             //     options: yearlySalesComparisonOptions
//             // });
            
//             renderYearlySalesChart(data.yearly_sales);


//             // Order Status Breakdown
//             if (charts.orderStatus) charts.orderStatus.destroy();
//             charts.orderStatus = new Chart(document.getElementById('orderStatusChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.order_status.labels,
//                     datasets: [
//                         {
//                             label: 'Average Order Total',
//                             data: data.order_status.data,
//                             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                             borderRadius: 5
//                         }
//                     ]
//                 },
//                 options: orderStatusOptions
//             });

//             // Revenue by Payment Method
//             if (charts.paymentMethod) charts.paymentMethod.destroy();
//             charts.paymentMethod = new Chart(document.getElementById('paymentMethodChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.payment_method.labels,
//                     datasets: [
//                         {
//                             label: 'Revenue',
//                             data: data.payment_method.data,
//                             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                             borderRadius: 5
//                         }
//                     ]
//                 },
//                 options: paymentMethodOptions
//             });

//             // Average Order Value by Customer
//             if (charts.avgOrderValue) charts.avgOrderValue.destroy();
//             charts.avgOrderValue = new Chart(document.getElementById('avgOrderValueChart'), {
//                 type: 'bar',
//                 data: {
//                     labels: data.avg_order_value.labels,
//                     datasets: [
//                         {
//                             label: 'Average Order Value',
//                             data: data.avg_order_value.data,
//                             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                             borderRadius: 5
//                         }
//                     ]
//                 },
//                 options: avgOrderValueOptions
//             });

//             // Payment Method Popularity
//             if (charts.paymentPopularity) charts.paymentPopularity.destroy();
//             charts.paymentPopularity = new Chart(document.getElementById('paymentPopularityChart'), {
//                 type: 'doughnut',
//                 data: {
//                     labels: data.payment_popularity.labels,
//                     datasets: [
//                         {
//                             label: 'Popularity',
//                             data: data.payment_popularity.data,
//                             backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
//                             borderWidth: 1
//                         }
//                     ]
//                 },
//                 options: paymentPopularityOptions
//             });

//             // Recent Orders Table
//             const recentOrdersTableBody = document.getElementById('recentOrdersTableBody');
//             recentOrdersTableBody.innerHTML = '';
//             data.recent_orders.forEach(order => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${order.order_number}</td>
//                     <td>${new Date(order.created_at).toLocaleDateString()}</td>
//                     <td>${order.customer_name}</td>
//                     <td>$${order.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
//                     <td>${order.order_status}</td>
//                 `;
//                 recentOrdersTableBody.appendChild(row);
//             });

//             // Top Products Table
//             const topProductsTableBody = document.getElementById('topProductsTableBody');
//             topProductsTableBody.innerHTML = '';
//             data.top_products.forEach(product => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${product.product}</td>
//                     <td>${product.count}</td>
//                 `;
//                 topProductsTableBody.appendChild(row);
//             });

//             // Discount Usage Table
//             const discountUsageTableBody = document.getElementById('discountUsageTableBody');
//             discountUsageTableBody.innerHTML = '';
//             data.discount_usage.forEach(discount => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${discount.coupon_code}</td>
//                     <td>${discount.times_used}</td>
//                 `;
//                 discountUsageTableBody.appendChild(row);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching dashboard data:', error);
//             alert('Failed to load dashboard data. Please try again.');
//         });
// }

// // Export dashboard as PDF using jsPDF with manual content rendering
// function exportDashboardAsPDF() {
//     setTimeout(() => {
//         const element = document.querySelector('.content');
//         if (!element) {
//             alert('Error: Dashboard content not found.');
//             return;
//         }

//         // Store the current state of accordion sections
//         const collapses = document.querySelectorAll('.accordion-collapse');
//         const collapseStates = Array.from(collapses).map(collapse => collapse.classList.contains('show'));

//         // Temporarily expand all accordion sections
//         collapses.forEach(collapse => collapse.classList.add('show'));

//         // Ensure charts are fully rendered by forcing a resize and disabling animations
//         Object.values(charts).forEach(chart => {
//             if (chart) {
//                 chart.options.animation = false;
//                 chart.resize();
//                 chart.update();
//             }
//         });

//         // Initialize jsPDF
//         const { jsPDF } = window.jspdf;
//         const doc = new jsPDF({
//             orientation: 'portrait',
//             unit: 'in',
//             format: 'letter'
//         });

//         // Page dimensions (letter size: 8.5in x 11in) with 0.5in margins
//         const pageWidth = 8.5 - 1;
//         const margin = 0.5;
//         let yPosition = margin;

//         // Helper function to add a new page if needed
//         const addNewPageIfNeeded = (requiredHeight) => {
//             if (yPosition + requiredHeight > 11 - margin) {
//                 doc.addPage();
//                 yPosition = margin;
//             }
//         };

//         // Helper function to add text with wrapping
//         const addText = (text, x, y, fontSize = 12, maxWidth = pageWidth) => {
//             doc.setFontSize(fontSize);
//             const lines = doc.splitTextToSize(text, maxWidth);
//             addNewPageIfNeeded(lines.length * (fontSize / 72));
//             doc.text(lines, x, y);
//             return lines.length * (fontSize / 72);
//         };

//         // 1. Add Navbar (Title and Date Range)
//         const navbar = document.querySelector('.navbar');
//         const title = navbar.querySelector('h1').textContent;
//         const dateRangeSelect = document.getElementById('dateRangeSelect').value;
//         let dateRangeText = dateRangeSelect === 'last_1_year' ? 'Last 1 Year' : 'Custom Date Range';
//         if (dateRangeSelect === 'custom') {
//             const startDate = document.getElementById('startDate').value;
//             const endDate = document.getElementById('endDate').value;
//             dateRangeText = `Custom: ${startDate} to ${endDate}`;
//         }
//         yPosition += addText(title, margin, yPosition, 16);
//         yPosition += addText(`Date Range: ${dateRangeText}`, margin, yPosition, 10);
//         yPosition += 0.2;

//         // 2. Add KPI Cards
//         const statCards = document.querySelectorAll('.stat-card');
//         statCards.forEach(card => {
//             const label = card.querySelector('h3').textContent;
//             const value = card.querySelector('p').textContent;
//             addNewPageIfNeeded(0.3);
//             yPosition += addText(`${label}: ${value}`, margin, yPosition, 10);
//             yPosition += 0.1;
//         });
//         yPosition += 0.2;

//         // 3. Add Charts
//         const chartCanvases = document.querySelectorAll('.chart-container canvas');
//         const chartPromises = Array.from(chartCanvases).map((canvas, index) => {
//             const chart = Chart.getChart(canvas);
//             if (chart) {
//                 try {
//                     const imgData = chart.toBase64Image('image/png');
//                     if (!imgData.startsWith('data:image/png;base64,')) {
//                         throw new Error('Invalid chart image data');
//                     }

//                     const img = new Image();
//                     img.src = imgData;

//                     const chartTitles = {
//                         ordersRevenue: 'Orders and Revenue Over Time',
//                         yearlySales: 'Yearly Sales Comparison',
//                         orderStatus: 'Order Status Breakdown',
//                         paymentMethod: 'Revenue by Payment Method',
//                         avgOrderValue: 'Average Order Value by Customer',
//                         paymentPopularity: 'Payment Method Popularity'
//                     };
//                     const chartKey = Object.keys(charts).find(key => charts[key] === chart);
//                     const chartTitle = chart.options.plugins?.title?.text || chartTitles[chartKey] || `Chart ${index + 1}`;

//                     return new Promise((resolve, reject) => {
//                         img.onload = () => {
//                             const imgWidth = img.width;
//                             const imgHeight = img.height;

//                             const chartWidth = pageWidth;
//                             const chartHeight = (chartWidth / imgWidth) * imgHeight;

//                             addNewPageIfNeeded(0.2);
//                             yPosition += addText(chartTitle, margin, yPosition, 12);
//                             yPosition += 0.1;

//                             addNewPageIfNeeded(chartHeight);
//                             doc.addImage(imgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
//                             yPosition += chartHeight + 0.2;

//                             resolve();
//                         };
//                         img.onerror = () => {
//                             addNewPageIfNeeded(0.2);
//                             yPosition += addText(`[Error rendering chart ${index + 1}]`, margin, yPosition, 10);
//                             yPosition += 0.1;
//                             resolve();
//                         };
//                     });
//                 } catch (error) {
//                     addNewPageIfNeeded(0.2);
//                     yPosition += addText(`[Error rendering chart: ${error.message}]`, margin, yPosition, 10);
//                     yPosition += 0.1;
//                     return Promise.resolve();
//                 }
//             }
//             return Promise.resolve();
//         });

//         Promise.all(chartPromises).then(() => {
//             // 4. Add Tables
//             const tables = [
//                 { title: 'Recent Orders', selector: '#recentOrdersTable' },
//                 { title: 'Top Products by Sales', selector: '#topProductsTable' },
//                 { title: 'Discount Usage Overview', selector: '#discountUsageTable' }
//             ];

//             tables.forEach(tableInfo => {
//                 const table = document.querySelector(tableInfo.selector);
//                 if (table) {
//                     addNewPageIfNeeded(0.2);
//                     yPosition += addText(tableInfo.title, margin, yPosition, 12);
//                     yPosition += 0.1;

//                     const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
//                     const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
//                         Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
//                     );

//                     const tableData = rows.map(row => row.map(cell => ({ content: cell })));

//                     const rowHeight = 0.2;
//                     const tableHeight = (headers.length > 0 ? 1 : 0) + rows.length * rowHeight;

//                     addNewPageIfNeeded(tableHeight);
//                     doc.autoTable({
//                         head: [headers],
//                         body: rows,
//                         startY: yPosition,
//                         margin: { left: margin, right: margin },
//                         styles: { fontSize: 8, cellPadding: 0.1 },
//                         headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
//                         bodyStyles: { textColor: [0, 0, 0] }
//                     });

//                     yPosition = doc.lastAutoTable.finalY + 0.2;
//                 }
//             });

//             doc.save(`Dashboard_Export_${new Date().toISOString().split('T')[0]}.pdf`);

//             collapses.forEach((collapse, index) => {
//                 if (!collapseStates[index]) {
//                     collapse.classList.remove('show');
//                 }
//             });

//             Object.values(charts).forEach(chart => {
//                 if (chart) {
//                     chart.options.animation = true;
//                     chart.update();
//                 }
//             });
//         }).catch(error => {
//             alert('Failed to export as PDF. Please try again.');
//             collapses.forEach((collapse, index) => {
//                 if (!collapseStates[index]) {
//                     collapse.classList.remove('show');
//                 }
//             });
//             Object.values(charts).forEach(chart => {
//                 if (chart) {
//                     chart.options.animation = true;
//                     chart.update();
//                 }
//             });
//         });

//     }, 3000);
// }

// // Event Listeners
// document.addEventListener('DOMContentLoaded', () => {
//     // Initial fetch with default "Last 1 Year"
//     fetchDashboardData();

//     // Handle dropdown change
//     const dateRangeSelect = document.getElementById('dateRangeSelect');
//     const customDateRange = document.getElementById('customDateRange');
//     const applyCustomDate = document.getElementById('applyCustomDate');
//     const startDateInput = document.getElementById('startDate');
//     const endDateInput = document.getElementById('endDate');

//     // Set default dates for custom range (for user convenience)
//     const today = new Date();
//     const lastYear = new Date(today);
//     lastYear.setFullYear(today.getFullYear() - 1);
//     endDateInput.value = today.toISOString().split('T')[0];
//     startDateInput.value = lastYear.toISOString().split('T')[0];

//     dateRangeSelect.addEventListener('change', () => {
//         if (dateRangeSelect.value === 'custom') {
//             customDateRange.style.display = 'flex';
//         } else {
//             customDateRange.style.display = 'none';
//             // Clear any selected dates
//             startDateInput.value = '';
//             endDateInput.value = '';
//             fetchDashboardData(); // This will now default correctly to last 1 year
//         }
//     });
    

//     applyCustomDate.addEventListener('click', () => {
//         const startDate = startDateInput.value;
//         const endDate = endDateInput.value;

//         if (!startDate || !endDate) {
//             alert('Please select both start and end dates.');
//             return;
//         }

//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         const today = new Date();

//         if (start > end) {
//             alert('Start date must be before end date.');
//             return;
//         }

//         if (end > today) {
//             alert('End date cannot be in the future.');
//             return;
//         }

//         fetchDashboardData(startDate, endDate);
//     });

//     // Add a listener to the date inputs to fetch data when they change (optional, for better UX)
//     startDateInput.addEventListener('change', () => {
//         if (dateRangeSelect.value === 'custom') {
//             const startDate = startDateInput.value;
//             const endDate = endDateInput.value;
//             if (startDate && endDate) {
//                 const start = new Date(startDate);
//                 const end = new Date(endDate);
//                 const today = new Date();
//                 if (start <= end && end <= today) {
//                     fetchDashboardData(startDate, endDate);
//                 }
//             }
//         }
//     });

//     endDateInput.addEventListener('change', () => {
//         if (dateRangeSelect.value === 'custom') {
//             const startDate = startDateInput.value;
//             const endDate = endDateInput.value;
//             if (startDate && endDate) {
//                 const start = new Date(startDate);
//                 const end = new Date(endDate);
//                 const today = new Date();
//                 if (start <= end && end <= today) {
//                     fetchDashboardData(startDate, endDate);
//                 }
//             }
//         }
//     });
// });

const charts = {
    ordersRevenue: null,
    yearlySales: null,
    orderStatus: null,
    paymentMethod: null,
    avgOrderValue: null,
    paymentPopularity: null
};

// ### NEW FOR ORDERS STATTUS CHARTS ### 
function getColorByIndex(i) {
    const colors = ['#00BFFF', '#9370DB', '#4169E1', '#DA70D6', '#20B2AA', '#DAA520', '#FF8C00'];
    return colors[i % colors.length];
}



// Chart options (unchanged from your last version)
const ordersRevenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        yOrders: {
            type: 'linear',
            position: 'left',
            title: {
                display: true,
                text: 'Number of Orders',
                color: 'black'
            },
            grid: {
                display: false,
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                color: 'black'
            }
        },
        yRevenue: {
            type: 'linear',
            position: 'right',
            title: {
                display: true,
                text: 'Revenue ($)',
                color: 'black'
            },
            grid: {
                display: false
            },
            ticks: {
                color: 'black',
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            }
        },
        x: {
            title: {
                display: true,
                text: 'Month',
                color: 'black'
            },
            grid: {
                display: false
            },
            ticks: {
                color: 'black'
            }
        }
    },
    plugins: {
        title: {
            display: true,
            text: 'Orders and Revenue Over Time',
            font: {
                size: 16,
                family: 'Roboto'
            },
            color: 'black'
        },
        legend: {
            position: 'top',
            labels: {
                color: 'black'
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { size: 14, family: 'Roboto', color: 'black' },
            bodyFont: { size: 12, family: 'Roboto', color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }
    },
    interaction: {
        mode: 'nearest',
        intersect: false
    }
};

const yearlySalesComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            title: {
                display: true,
                text: 'Sales ($)',
                color: 'black'
            },
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                color: 'black',
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            },
            beginAtZero: true
        },
        x: {
            title: {
                display: true,
                text: 'Month',  // Will be updated dynamically for custom range
                color: 'black'
            },
            grid: {
                display: false
            },
            ticks: {
                color: 'black'
            }
        }
    },
    plugins: {
        title: {
            display: true,
            text: 'Yearly Sales Comparison',
            font: {
                size: 16,
                family: 'Roboto'
            },
            color: 'black'
        },
        legend: {
            position: 'top',
            labels: {
                color: 'black',
                usePointStyle: true
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { family: 'Roboto', size: 14, color: 'black' },
            bodyFont: { family: 'Roboto', size: 12, color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    interaction: {
        mode: 'nearest',
        intersect: false
    }
};

// const orderStatusOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//         y: {
//             title: {
//                 display: true,
//                 text: 'Average Order Total ($)',
//                 color: 'black'
//             },
//             grid: {
//                 display: false,
//                 color: 'rgba(0, 0, 0, 0.1)'
//             },
//             ticks: {
//                 color: 'black'
//             }
//         },
//         x: {
//             title: {
//                 display: true,
//                 text: 'Order Status',
//                 color: 'black'
//             },
//             grid: {
//                 display: false
//             },
//             ticks: {
//                 color: 'black'
//             }
//         }
//     },
//     plugins: {
//         title: {
//             display: true,
//             text: 'Order Status Breakdown',
//             font: {
//                 size: 16,
//                 family: 'Roboto'
//             },
//             color: 'black'
//         },
//         legend: {
//             display: false
//         },
//         tooltip: {
//             backgroundColor: 'rgba(255, 255, 0.9)',
//             titleFont: { size: 14, family: 'Roboto', color: 'black' },
//             bodyFont: { size: 12, family: 'Roboto', color: 'black' },
//             titleColor: 'black',
//             bodyColor: 'black',
//             padding: 10,
//             cornerRadius: 5,
//             borderColor: 'rgba(0, 0, 0, 0.2)',
//             borderWidth: 1
//         }
//     }
// };

// ### NEW ODER STATUS CCHART ### 
const orderStatusOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { stacked: true, display: false },
        y: { stacked: true, display: false }
    },
    plugins: {
        title: {
            display: true,
            text: 'Order Status Breakdown',
            font: { size: 16, family: 'Roboto' },
            color: 'black'
        },
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: 'black',
                boxWidth: 12
            }
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                }
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { size: 14, family: 'Roboto', color: 'black' },
            bodyFont: { size: 12, family: 'Roboto', color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }
    }
};


const paymentMethodOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            title: {
                display: true,
                text: 'Total Revenue ($)',
                color: 'black'
            },
            grid: {
                display: false,
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                color: 'black'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Payment Method',
                color: 'black'
            },
            grid: {
                display: false
            },
            ticks: {
                color: 'black'
            }
        }
    },
    plugins: {
        title: {
            display: true,
            text: 'Revenue by Payment Method',
            font: {
                size: 16,
                family: 'Roboto'
            },
            color: 'black'
        },
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { size: 14, family: 'Roboto', color: 'black' },
            bodyFont: { size: 12, family: 'Roboto', color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }
    }
};

const avgOrderValueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
        y: {
            title: {
                display: true,
                text: 'Customer Email',
                color: 'black'
            },
            grid: {
                display: false,
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                color: 'black'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Average Order Value ($)',
                color: 'black'
            },
            grid: {
                display: false
            },
            ticks: {
                maxRotation: 45,
                minRotation: 45,
                color: 'black'
            }
        }
    },
    plugins: {
        title: {
            display: true,
            text: 'Average Order Value by Customer',
            font: {
                size: 16,
                family: 'Roboto'
            },
            color: 'black'
        },
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { size: 14, family: 'Roboto', color: 'black' },
            bodyFont: { size: 12, family: 'Roboto', color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }
    }
};

const paymentPopularityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: 'Payment Method Popularity',
            font: {
                size: 16,
                family: 'Roboto'
            },
            color: 'black'
        },
        legend: {
            position: 'top',
            labels: {
                color: 'black'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleFont: { size: 14, family: 'Roboto', color: 'black' },
            bodyFont: { size: 12, family: 'Roboto', color: 'black' },
            titleColor: 'black',
            bodyColor: 'black',
            padding: 10,
            cornerRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }
    }
};

function renderYearlySalesChart(chartData) {
    const ctx = document.getElementById('yearlySalesChart').getContext('2d');

    // Clean up previous instance
    if (charts.yearlySales) charts.yearlySales.destroy();

    // Log raw data for debugging
    console.log('Yearly Sales Chart Data:', JSON.stringify(chartData, null, 2));

    // Update chart options dynamically based on the data
    const isCustomRange = chartData.datasets.length === 1;
    const updatedOptions = { ...yearlySalesComparisonOptions };
    updatedOptions.scales.x.title.text = isCustomRange ? 'Year' : 'Month';
    updatedOptions.plugins.title.text = isCustomRange ? 'Sales by Year (Custom Range)' : 'Yearly Sales Comparison (2024 vs 2025)';

    // Apply styling and validate data
    chartData.datasets.forEach((dataset, index) => {
        // Respect backend styling; apply defaults only if missing
        dataset.borderColor = dataset.borderColor || (isCustomRange ? '#000000' : (index === 0 ? '#000000' : '#D3D3D3'));
        dataset.backgroundColor = dataset.backgroundColor || (isCustomRange ? 'rgba(0, 0, 0, 0.2)' : (index === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(211, 211, 211, 0.2)'));
        dataset.fill = dataset.fill !== undefined ? dataset.fill : true;
        dataset.tension = dataset.tension || 0.4;
        dataset.borderWidth = dataset.borderWidth || 3;
        dataset.pointRadius = dataset.pointRadius || 3;
        dataset.pointHoverRadius = dataset.pointHoverRadius || 5;
        dataset.pointBackgroundColor = dataset.pointBackgroundColor || dataset.borderColor;
        dataset.pointHoverBackgroundColor = dataset.pointHoverBackgroundColor || dataset.borderColor;

        // Validate and normalize data
        dataset.data = dataset.data.map(val => (val != null && !isNaN(val) ? Number(val) : 0));

        // Log dataset for debugging
        console.log(`Dataset ${index} (${dataset.label}):`, {
            data: dataset.data,
            borderColor: dataset.borderColor,
            backgroundColor: dataset.backgroundColor,
            fill: dataset.fill
        });
    });

    // Warn if a dataset is all zeros
    chartData.datasets.forEach(dataset => {
        if (dataset.data.every(val => val === 0)) {
            console.warn(`Dataset "${dataset.label}" has all zero values and will appear as a flat line.`);
        }
    });

    charts.yearlySales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
        },
        options: updatedOptions
    });
}

// Fetch and render dashboard data
function fetchDashboardData(startDate, endDate) {
    let url;
    const today = new Date('2025-05-22'); // Hardcode for consistency with backend
    let defaultStartDate;

    if (!startDate || !endDate) {
        // Default to last 1 year (May 22, 2024 - May 22, 2025)
        defaultStartDate = new Date(today);
        defaultStartDate.setFullYear(today.getFullYear() - 1);
        startDate = defaultStartDate.toISOString().split('T')[0]; // 2024-05-22
        endDate = today.toISOString().split('T')[0]; // 2025-05-22
    }

    url = `/api/dashboard-data/?start_date=${startDate}&end_date=${endDate}`;
    console.log('Fetching data with URL:', url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);

            // Update KPI Cards
            document.getElementById('todayCustomers').textContent = data.today_customers;
            document.getElementById('todayProducts').textContent = data.today_products;
            document.getElementById('totalOrders').textContent = data.total_orders;
            document.getElementById('totalRevenue').textContent = `$${data.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

            // Orders and Revenue Over Time
            if (charts.ordersRevenue) charts.ordersRevenue.destroy();
            charts.ordersRevenue = new Chart(document.getElementById('ordersRevenueChart'), {
                type: 'line',
                data: {
                    labels: data.orders_revenue.labels,
                    datasets: [
                        {
                            label: 'Orders',
                            data: data.orders_revenue.orders,
                            borderColor: 'black',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            yAxisID: 'yOrders',
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: 'black',
                            pointBorderColor: 'black',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Revenue',
                            data: data.orders_revenue.revenue,
                            borderColor: 'rgba(0, 0, 0, 0.6)',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            yAxisID: 'yRevenue',
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: 'rgba(0, 0, 0, 0.6)',
                            pointBorderColor: 'rgba(0, 0, 0, 0.6)',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: ordersRevenueOptions
            });

            // Yearly Sales Comparison
            renderYearlySalesChart(data.yearly_sales);

            // Order Status Breakdown
            // if (charts.orderStatus) charts.orderStatus.destroy();
            // charts.orderStatus = new Chart(document.getElementById('orderStatusChart'), {
            //     type: 'bar',
            //     data: {
            //         labels: data.order_status.labels,
            //         datasets: [
            //             {
            //                 label: 'Average Order Total',
            //                 data: data.order_status.data,
            //                 backgroundColor: 'rgba(0, 0, 0, 0.8)',
            //                 borderRadius: 5
            //             }
            //         ]
            //     },
            //     options: orderStatusOptions
            // });

            // ## new oder status chart ### 
            if (charts.orderStatus) charts.orderStatus.destroy();
charts.orderStatus = new Chart(document.getElementById('orderStatusChart'), {
    type: 'bar',
    data: {
        labels: [''],  // Single stacked horizontal bar
        datasets: data.order_status.labels.map((label, i) => ({
            label: label,
            data: [data.order_status.data[i]],
            backgroundColor: getColorByIndex(i),
            borderColor: 'white',
            borderWidth: 2,
            borderRadius: 4
        }))
    },
    options: {
        ...orderStatusOptions,
        indexAxis: 'y'
    }
});


            // Revenue by Payment Method
            if (charts.paymentMethod) charts.paymentMethod.destroy();
            charts.paymentMethod = new Chart(document.getElementById('paymentMethodChart'), {
                type: 'bar',
                data: {
                    labels: data.payment_method.labels,
                    datasets: [
                        {
                            label: 'Revenue',
                            data: data.payment_method.data,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: 5
                        }
                    ]
                },
                options: paymentMethodOptions
            });

            // Average Order Value by Customer
            if (charts.avgOrderValue) charts.avgOrderValue.destroy();
            charts.avgOrderValue = new Chart(document.getElementById('avgOrderValueChart'), {
                type: 'bar',
                data: {
                    labels: data.avg_order_value.labels,
                    datasets: [
                        {
                            label: 'Average Order Value',
                            data: data.avg_order_value.data,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: 3,
                            barThickness: 10
                        }
                    ]
                },
                options: avgOrderValueOptions
            });

            // Payment Method Popularity
            if (charts.paymentPopularity) charts.paymentPopularity.destroy();
            charts.paymentPopularity = new Chart(document.getElementById('paymentPopularityChart'), {
                type: 'doughnut',
                data: {
                    labels: data.payment_popularity.labels,
                    datasets: [
                        {
                            label: 'Popularity',
                            data: data.payment_popularity.data,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                            borderWidth: 1
                        }
                    ]
                },
                options: paymentPopularityOptions
            });

            // Recent Orders Table
            const recentOrdersTableBody = document.getElementById('recentOrdersTableBody');
            recentOrdersTableBody.innerHTML = '';
            data.recent_orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.order_number}</td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>${order.customer_name}</td>
                    <td>$${order.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${order.order_status}</td>
                `;
                recentOrdersTableBody.appendChild(row);
            });

            // Top Products Table
            const topProductsTableBody = document.getElementById('topProductsTableBody');
            topProductsTableBody.innerHTML = '';
            data.top_products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.product}</td>
                    <td>${product.count}</td>
                `;
                topProductsTableBody.appendChild(row);
            });

            // Discount Usage Table
            const discountUsageTableBody = document.getElementById('discountUsageTableBody');
            discountUsageTableBody.innerHTML = '';
            data.discount_usage.forEach(discount => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${discount.coupon_code}</td>
                    <td>${discount.times_used}</td>
                `;
                discountUsageTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
            alert('Failed to load dashboard data. Please try again.');
        });
}

// Export dashboard as PDF (unchanged)
function exportDashboardAsPDF() {
    setTimeout(() => {
        const element = document.querySelector('.content');
        if (!element) {
            alert('Error: Dashboard content not found.');
            return;
        }

        const collapses = document.querySelectorAll('.accordion-collapse');
        const collapseStates = Array.from(collapses).map(collapse => collapse.classList.contains('show'));
        collapses.forEach(collapse => collapse.classList.add('show'));

        Object.values(charts).forEach(chart => {
            if (chart) {
                chart.options.animation = false;
                chart.resize();
                chart.update();
            }
        });

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });

        const pageWidth = 8.5 - 1;
        const margin = 0.5;
        let yPosition = margin;

        const addNewPageIfNeeded = (requiredHeight) => {
            if (yPosition + requiredHeight > 11 - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };

        const addText = (text, x, y, fontSize = 12, maxWidth = pageWidth) => {
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxWidth);
            addNewPageIfNeeded(lines.length * (fontSize / 72));
            doc.text(lines, x, y);
            return lines.length * (fontSize / 72);
        };

        const navbar = document.querySelector('.navbar');
        const title = navbar.querySelector('h1').textContent;
        const dateRangeSelect = document.getElementById('dateRangeSelect').value;
        let dateRangeText = dateRangeSelect === 'last_1_year' ? 'Last 1 Year' : 'Custom Date Range';
        if (dateRangeSelect === 'custom') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            dateRangeText = `Custom: ${startDate} to ${endDate}`;
        }
        yPosition += addText(title, margin, yPosition, 16);
        yPosition += addText(`Date Range: ${dateRangeText}`, margin, yPosition, 10);
        yPosition += 0.2;

        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const label = card.querySelector('h3').textContent;
            const value = card.querySelector('p').textContent;
            addNewPageIfNeeded(0.3);
            yPosition += addText(`${label}: ${value}`, margin, yPosition, 10);
            yPosition += 0.1;
        });
        yPosition += 0.2;

        const chartCanvases = document.querySelectorAll('.chart-container canvas');
        const chartPromises = Array.from(chartCanvases).map((canvas, index) => {
            const chart = Chart.getChart(canvas);
            if (chart) {
                try {
                    const imgData = chart.toBase64Image('image/png');
                    if (!imgData.startsWith('data:image/png;base64,')) {
                        throw new Error('Invalid chart image data');
                    }

                    const img = new Image();
                    img.src = imgData;

                    const chartTitles = {
                        ordersRevenue: 'Orders and Revenue Over Time',
                        yearlySales: charts.yearlySales?.options?.plugins?.title?.text || 'Yearly Sales Comparison',
                        orderStatus: 'Order Status Breakdown',
                        paymentMethod: 'Revenue by Payment Method',
                        avgOrderValue: 'Average Order Value by Customer',
                        paymentPopularity: 'Payment Method Popularity'
                    };
                    const chartKey = Object.keys(charts).find(key => charts[key] === chart);
                    const chartTitle = chart.options.plugins?.title?.text || chartTitles[chartKey] || `Chart ${index + 1}`;

                    return new Promise((resolve, reject) => {
                        img.onload = () => {
                            const imgWidth = img.width;
                            const imgHeight = img.height;

                            const chartWidth = pageWidth;
                            const chartHeight = (chartWidth / imgWidth) * imgHeight;

                            addNewPageIfNeeded(0.2);
                            yPosition += addText(chartTitle, margin, yPosition, 12);
                            yPosition += 0.1;

                            addNewPageIfNeeded(chartHeight);
                            doc.addImage(imgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
                            yPosition += chartHeight + 0.2;

                            resolve();
                        };
                        img.onerror = () => {
                            addNewPageIfNeeded(0.2);
                            yPosition += addText(`[Error rendering chart ${index + 1}]`, margin, yPosition, 10);
                            yPosition += 0.1;
                            resolve();
                        };
                    });
                } catch (error) {
                    addNewPageIfNeeded(0.2);
                    yPosition += addText(`[Error rendering chart: ${error.message}]`, margin, yPosition, 10);
                    yPosition += 0.1;
                    return Promise.resolve();
                }
            }
            return Promise.resolve();
        });

        Promise.all(chartPromises).then(() => {
            const tables = [
                { title: 'Recent Orders', selector: '#recentOrdersTable' },
                { title: 'Top Products by Sales', selector: '#topProductsTable' },
                { title: 'Discount Usage Overview', selector: '#discountUsageTable' }
            ];

            tables.forEach(tableInfo => {
                const table = document.querySelector(tableInfo.selector);
                if (table) {
                    addNewPageIfNeeded(0.2);
                    yPosition += addText(tableInfo.title, margin, yPosition, 12);
                    yPosition += 0.1;

                    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
                    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
                        Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
                    );

                    const tableData = rows.map(row => row.map(cell => ({ content: cell })));

                    const rowHeight = 0.2;
                    const tableHeight = (headers.length > 0 ? 1 : 0) + rows.length * rowHeight;

                    addNewPageIfNeeded(tableHeight);
                    doc.autoTable({
                        head: [headers],
                        body: rows,
                        startY: yPosition,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8, cellPadding: 0.1 },
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
                        bodyStyles: { textColor: [0, 0, 0] }
                    });

                    yPosition = doc.lastAutoTable.finalY + 0.2;
                }
            });

            doc.save(`Dashboard_Export_${new Date().toISOString().split('T')[0]}.pdf`);

            collapses.forEach((collapse, index) => {
                if (!collapseStates[index]) {
                    collapse.classList.remove('show');
                }
            });

            Object.values(charts).forEach(chart => {
                if (chart) {
                    chart.options.animation = true;
                    chart.update();
                }
            });
        }).catch(error => {
            alert('Failed to export as PDF. Please try again.');
            collapses.forEach((collapse, index) => {
                if (!collapseStates[index]) {
                    collapse.classList.remove('show');
                }
            });
            Object.values(charts).forEach(chart => {
                if (chart) {
                    chart.options.animation = true;
                    chart.update();
                }
            });
        });

    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch with default "Last 1 Year"
    fetchDashboardData();

    // Handle dropdown change
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const customDateRange = document.getElementById('customDateRange');
    const applyCustomDate = document.getElementById('applyCustomDate');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Set default dates for custom range (for user convenience)
    const today = new Date('2025-05-22');
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    endDateInput.value = today.toISOString().split('T')[0];
    startDateInput.value = lastYear.toISOString().split('T')[0];

    dateRangeSelect.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            // customDateRange.style.display = 'flex';
            customDateRange.classList.remove('visually-hidden');
        } else {
            // customDateRange.style.display = 'none';
            customDateRange.classList.add('visually-hidden');
            startDateInput.value = lastYear.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
            fetchDashboardData(); // Default to last 1 year
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
        const today = new Date('2025-05-22');

        if (start > end) {
            alert('Start date must be before end date.');
            return;
        }

        if (end > today) {
            alert('End date cannot be in the future.');
            return;
        }

        fetchDashboardData(startDate, endDate);
    });

    startDateInput.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const today = new Date('2025-05-22');
                if (start <= end && end <= today) {
                    fetchDashboardData(startDate, endDate);
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
                const today = new Date('2025-05-22');
                if (start <= end && end <= today) {
                    fetchDashboardData(startDate, endDate);
                }
            }
        }
    });
});