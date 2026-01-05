// Global variables
let fredData = null;
let charts = {
    lineChart: null,
    interestChart: null,
    recordkeepingChart: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDateDropdowns();

    document.getElementById('calculateBtn').addEventListener('click', function() {
        if (validateInputs()) {
            generateAnalysis();
        }
    });
});

// Generate date options for dropdowns (last 10 years to next 5 years)
function initializeDateDropdowns() {
    const startSelect = document.getElementById('contractStartDate');
    const endSelect = document.getElementById('terminationDate');

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 5;

    // Generate quarterly dates
    for (let year = startYear; year <= endYear; year++) {
        for (let month of [1, 4, 7, 10]) {
            const date = new Date(year, month - 1, 1);
            const dateString = date.toISOString().split('T')[0];
            const displayString = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });

            const option1 = new Option(displayString, dateString);
            const option2 = new Option(displayString, dateString);

            startSelect.add(option1);
            endSelect.add(option2);
        }
    }
}

// Validate all inputs
function validateInputs() {
    const contractStartDate = document.getElementById('contractStartDate').value;
    const terminationDate = document.getElementById('terminationDate').value;
    const contractAssets = document.getElementById('contractAssets').value;
    const currentCreditingRate = document.getElementById('currentCreditingRate').value;
    const competitiveMarketRate = document.getElementById('competitiveMarketRate').value;
    const currentRecordkeepingRate = document.getElementById('currentRecordkeepingRate').value;
    const recordkeepingRateAfterExit = document.getElementById('recordkeepingRateAfterExit').value;

    if (!contractStartDate || !terminationDate) {
        showError('Please select both contract start date and termination date.');
        return false;
    }

    if (new Date(contractStartDate) >= new Date(terminationDate)) {
        showError('Termination date must be after the contract start date.');
        return false;
    }

    if (!contractAssets || contractAssets <= 0) {
        showError('Please enter a valid contract assets amount.');
        return false;
    }

    if (!currentCreditingRate || !competitiveMarketRate ||
        !currentRecordkeepingRate || !recordkeepingRateAfterExit) {
        showError('Please fill in all rate fields.');
        return false;
    }

    return true;
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Main function to generate the analysis
async function generateAnalysis() {
    const loadingDiv = document.getElementById('loadingMessage');
    const outputSection = document.getElementById('outputSection');

    loadingDiv.style.display = 'block';
    outputSection.style.display = 'none';

    try {
        // Fetch FRED data if not already loaded
        if (!fredData) {
            await fetchFREDData();
        }

        // Get input values
        const inputs = getInputValues();

        // Create charts
        createLineChart(inputs);
        createInterestEarnedChart(inputs);
        createRecordkeepingChart(inputs);
        createSummary(inputs);

        // Show output section
        loadingDiv.style.display = 'none';
        outputSection.style.display = 'block';

        // Scroll to results
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        loadingDiv.style.display = 'none';
        showError('Error loading data: ' + error.message);
    }
}

// Fetch FRED DGS3 data
async function fetchFREDData() {
    try {
        // FRED provides a direct CSV download link
        const response = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3');

        if (!response.ok) {
            throw new Error('Unable to fetch FRED data. Status: ' + response.status);
        }

        const csvText = await response.text();
        fredData = parseCSV(csvText);

    } catch (error) {
        // If direct fetch fails, provide sample data for demonstration
        console.warn('Could not fetch FRED data, using sample data:', error);
        fredData = generateSampleData();
    }
}

// Parse CSV data from FRED
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const [date, value] = lines[i].split(',');
        if (date && value && value !== '.') {
            data.push({
                date: date.trim(),
                value: parseFloat(value.trim())
            });
        }
    }

    return data;
}

// Generate sample data if FRED fetch fails
function generateSampleData() {
    const data = [];
    const startDate = new Date('2014-01-01');
    const endDate = new Date();

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // Generate realistic treasury rate data (between 0.5% and 5%)
        const baseRate = 2.5;
        const variation = Math.sin(currentDate.getTime() / (365 * 24 * 60 * 60 * 1000)) * 1.5;
        const randomNoise = (Math.random() - 0.5) * 0.5;
        const value = Math.max(0.1, baseRate + variation + randomNoise);

        data.push({
            date: currentDate.toISOString().split('T')[0],
            value: parseFloat(value.toFixed(2))
        });

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
    }

    return data;
}

// Get all input values
function getInputValues() {
    return {
        contractStartDate: document.getElementById('contractStartDate').value,
        terminationDate: document.getElementById('terminationDate').value,
        contractAssets: parseFloat(document.getElementById('contractAssets').value),
        currentCreditingRate: parseFloat(document.getElementById('currentCreditingRate').value),
        competitiveMarketRate: parseFloat(document.getElementById('competitiveMarketRate').value),
        currentRecordkeepingRate: parseFloat(document.getElementById('currentRecordkeepingRate').value),
        recordkeepingRateAfterExit: parseFloat(document.getElementById('recordkeepingRateAfterExit').value),
        lookbackPeriod: parseInt(document.getElementById('lookbackPeriod').value)
    };
}

// Create line chart with markers
function createLineChart(inputs) {
    const ctx = document.getElementById('lineChart');

    // Destroy existing chart if it exists
    if (charts.lineChart) {
        charts.lineChart.destroy();
    }

    // Filter data for relevant time period (expand range for context)
    const startDate = new Date(inputs.contractStartDate);
    const endDate = new Date(inputs.terminationDate);
    const lookbackMonths = inputs.lookbackPeriod * 12; // Convert years to months

    const displayStartDate = new Date(startDate);
    displayStartDate.setMonth(displayStartDate.getMonth() - lookbackMonths);

    const displayEndDate = new Date(endDate);
    displayEndDate.setMonth(displayEndDate.getMonth() + 12); // Show 1 year after termination for context

    const filteredData = fredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= displayStartDate && itemDate <= displayEndDate;
    });

    // Find values at contract dates
    const startDataPoint = findClosestDataPoint(inputs.contractStartDate);
    const endDataPoint = findClosestDataPoint(inputs.terminationDate);

    // Create datasets
    const datasets = [
        {
            label: '3-Year Treasury Rate',
            data: filteredData.map(item => ({ x: item.date, y: item.value })),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
        }
    ];

    // Add marker points
    if (startDataPoint) {
        datasets.push({
            label: 'Contract Start',
            data: [{ x: startDataPoint.date, y: startDataPoint.value }],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
        });
    }

    if (endDataPoint) {
        datasets.push({
            label: 'Termination Date',
            data: [{ x: endDataPoint.date, y: endDataPoint.value }],
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
        });
    }

    charts.lineChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rate (%)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Find closest data point to a given date
function findClosestDataPoint(targetDate) {
    const target = new Date(targetDate);
    let closest = null;
    let minDiff = Infinity;

    for (const item of fredData) {
        const itemDate = new Date(item.date);
        const diff = Math.abs(itemDate - target);

        if (diff < minDiff) {
            minDiff = diff;
            closest = item;
        }
    }

    return closest;
}

// Create Interest Earned chart
function createInterestEarnedChart(inputs) {
    const ctx = document.getElementById('interestChart');

    if (charts.interestChart) {
        charts.interestChart.destroy();
    }

    const currentInterest = inputs.contractAssets * (inputs.currentCreditingRate / 100);
    const competitiveInterest = inputs.contractAssets * (inputs.competitiveMarketRate / 100);
    const difference = competitiveInterest - currentInterest;

    charts.interestChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current Strategy', 'Competitive Market'],
            datasets: [{
                label: 'Annual Interest Earned',
                data: [currentInterest, competitiveInterest],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    '#667eea',
                    '#10b981'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    const diffText = document.getElementById('interestDifference');
    const sign = difference >= 0 ? '+' : '';
    diffText.textContent = sign + '$' + difference.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    diffText.style.color = difference >= 0 ? '#10b981' : '#ef4444';
}

// Create Recordkeeping Fee chart
function createRecordkeepingChart(inputs) {
    const ctx = document.getElementById('recordkeepingChart');

    if (charts.recordkeepingChart) {
        charts.recordkeepingChart.destroy();
    }

    const currentFee = inputs.contractAssets * (inputs.currentRecordkeepingRate / 100);
    const afterExitFee = inputs.contractAssets * (inputs.recordkeepingRateAfterExit / 100);
    const difference = currentFee - afterExitFee;

    charts.recordkeepingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current Fee', 'After Exit Fee'],
            datasets: [{
                label: 'Annual Recordkeeping Fee',
                data: [currentFee, afterExitFee],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    '#ef4444',
                    '#10b981'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    const diffText = document.getElementById('recordkeepingDifference');
    const sign = difference >= 0 ? '' : '-';
    diffText.textContent = sign + '$' + Math.abs(difference).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' savings';
    diffText.style.color = difference >= 0 ? '#10b981' : '#ef4444';
}

// Create summary text
function createSummary(inputs) {
    const summaryDiv = document.getElementById('summaryText');

    const currentInterest = inputs.contractAssets * (inputs.currentCreditingRate / 100);
    const competitiveInterest = inputs.contractAssets * (inputs.competitiveMarketRate / 100);
    const interestDifference = competitiveInterest - currentInterest;

    const currentFee = inputs.contractAssets * (inputs.currentRecordkeepingRate / 100);
    const afterExitFee = inputs.contractAssets * (inputs.recordkeepingRateAfterExit / 100);
    const feeSavings = currentFee - afterExitFee;

    const netBenefit = interestDifference + feeSavings;

    const startDate = new Date(inputs.contractStartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
    const endDate = new Date(inputs.terminationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });

    let summary = `<p><strong>Contract Period:</strong> ${startDate} to ${endDate}</p>`;
    summary += `<p><strong>Contract Assets:</strong> $${inputs.contractAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`;
    summary += `<hr style="margin: 15px 0; border: none; border-top: 1px solid #dee2e6;">`;

    if (interestDifference > 0) {
        summary += `<p>By exiting to a competitive market rate, you could potentially earn an additional <strong style="color: #10b981;">$${interestDifference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> in annual interest.</p>`;
    } else {
        summary += `<p>Your current crediting rate provides <strong>$${Math.abs(interestDifference).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> more in annual interest compared to the competitive market rate.</p>`;
    }

    if (feeSavings > 0) {
        summary += `<p>Exiting could save <strong style="color: #10b981;">$${feeSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> annually in recordkeeping fees.</p>`;
    } else {
        summary += `<p>Recordkeeping fees would increase by <strong style="color: #ef4444;">$${Math.abs(feeSavings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> annually after exit.</p>`;
    }

    summary += `<hr style="margin: 15px 0; border: none; border-top: 1px solid #dee2e6;">`;

    if (netBenefit > 0) {
        summary += `<p><strong>Total Annual Benefit of Exiting:</strong> <span style="color: #10b981; font-size: 1.2em;">$${netBenefit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>`;
        summary += `<p style="color: #10b981; font-weight: 600;">Based on current inputs, exiting the stable value strategy appears favorable.</p>`;
    } else {
        summary += `<p><strong>Total Annual Cost of Exiting:</strong> <span style="color: #ef4444; font-size: 1.2em;">$${Math.abs(netBenefit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>`;
        summary += `<p style="color: #ef4444; font-weight: 600;">Based on current inputs, maintaining the current strategy may be more beneficial.</p>`;
    }

    summaryDiv.innerHTML = summary;
}
