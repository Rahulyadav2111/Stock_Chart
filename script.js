const ctx = document.getElementById('myChart').getContext('2d'); // Targeting canvas element
const loadingIndicator = document.getElementById('loading');
const dataChanges = document.getElementById('data_changes');
let chartData = [];
let chart; // Declare the chart variable
let currentFilteredData = []; // Store currently filtered data

const names = [
    "Nifty 50", "Nifty Next 50", "Nifty 100", "Nifty 200", "Nifty 500",
    "Nifty Midcap 50", "NIFTY Midcap 100", "NIFTY Smallcap 100",
    "Nifty50 Dividend Points", "Nifty Auto", "Nifty Bank", "Nifty Energy",
    "Nifty Financial Services", "Nifty FMCG", "Nifty IT", "Nifty Media",
    "Nifty Metal", "Nifty MNC", "Nifty Pharma", "Nifty PSU Bank", "Nifty Realty",
    "Nifty India Consumption", "Nifty Commodities", "Nifty Dividend Opportunities 50",
    "Nifty Infrastructure", "Nifty PSE", "Nifty Services Sector", "Nifty50 Shariah",
    "Nifty500 Shariah", "Nifty Low Volatility 50", "Nifty Alpha 50", "Nifty High Beta 50",
    "Nifty100 Equal Weight", "Nifty100 Liquid 15", "Nifty CPSE", "Nifty50 Value 20",
    "Nifty Midcap Liquid 15", "Nifty Shariah 25", "India VIX", "Nifty Growth Sectors 15",
    "Nifty50 TR 1x Inverse", "Nifty50 TR 2x Leverage", "Nifty50 PR 1x Inverse",
    "Nifty50 PR 2x Leverage", "NIFTY100 Quality 30", "Nifty 50 Futures Index",
    "NIFTY50 Equal Weight", "Nifty 50 Futures TR Index", "Nifty Mahindra Group",
    "Nifty Aditya Birla Group", "Nifty Tata Group", "Nifty Tata Group 25% Cap",
    "Nifty Private Bank", "Nifty Smallcap 250", "Nifty Smallcap 50", "Nifty MidSmallcap 400",
    "Nifty Midcap 150", "Nifty Midcap Select", "NIFTY LargeMidcap 250", "NIFTY SME EMERGE",
    "Nifty Oil & Gas", "Nifty Financial Services 25/50", "Nifty Healthcare Index",
    "Nifty500 Multicap 50:25:25", "Nifty Microcap 250", "Nifty Total Market",
    "Nifty India Digital", "Nifty Mobility", "Nifty India Defence",
    "Nifty Financial Services Ex-Bank", "Nifty Housing", "Nifty Transportation & Logistics",
    "Nifty MidSmall Financial Services", "Nifty MidSmall Healthcare", "Nifty MidSmall IT & Telecom",
    "Nifty MidSmall India Consumption", "Nifty REITs & InvITs", "Nifty Core Housing",
    "Nifty500 Multicap Infrastructure 50:30:20", "Nifty Consumer Durables",
    "Nifty Non-Cyclical Consumer", "Nifty500 Multicap India Manufacturing 50:30:20",
    "Nifty100 ESG Sector Leaders", "NIFTY100 Alpha 30", "NIFTY500 Value 50",
    "Nifty100 Low Volatility 30", "NIFTY Alpha Low-Volatility 30",
    "NIFTY Quality Low-Volatility 30", "NIFTY Alpha Quality Low-Volatility 30",
    "NIFTY Alpha Quality Value Low-Volatility 30", "NIFTY200 Quality 30",
    "NIFTY Midcap150 Quality 50", "Nifty200 Momentum 30", "Nifty India Manufacturing",
    "Nifty200 Alpha 30", "Nifty Midcap150 Momentum 50", "Nifty Smallcap250 Quality 50",
    "Nifty Smallcap250 Momentum Quality 100", "Nifty MidSmallcap400 Momentum Quality 100",
    "NIFTY100 ESG", "NIFTY100 Enhanced ESG", "Nifty 50 Arbitrage",
    "Nifty 8-13 yr G-Sec", "Nifty 4-8 yr G-Sec Index", "Nifty 11-15 yr G-Sec Index",
    "Nifty 15 yr and above G-Sec Index", "Nifty Composite G-sec Index",
    "Nifty 10 yr Benchmark G-Sec", "Nifty 10 yr Benchmark G-Sec (Clean Price)",
    "Nifty 1D Rate Index", "Nifty50 USD"
];

function showSuggestions(value) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = ''; // Clear previous suggestions

    if (!value) return; // If input is empty, return

    const filteredNames = names.filter(name => name.toLowerCase().includes(value.toLowerCase()));

    filteredNames.forEach(name => {
        const div = document.createElement('div');
        div.classList.add('suggestion-item');

        const button = document.createElement('button');
        button.textContent = name;
        button.onclick = () => {
            updateChart(name); // Update chart on button click
            document.getElementById('searchInput').value = name; // Set the input value
            suggestions.innerHTML = ''; // Clear suggestions
        };
        div.appendChild(button);

        suggestions.appendChild(div);
    });
}
function showLoading() {
    loadingIndicator.style.display = 'block';
    dataChanges.style.visibility = 'hidden';
    ctx.canvas.style.visibility = 'hidden';
}

// Hide loading indicator
function hideLoading() {
    setTimeout(() => {
        loadingIndicator.style.display = 'none';
        dataChanges.style.visibility = 'visible';
        ctx.canvas.style.visibility = 'visible';
    }, 3000); // Delay for 3 seconds
}

// Fetch the JSON file
fetch('newdump.json')
    .then(function(response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok');
    })
    .then(function(data) {
        chartData = data; // Store data for later use
        createChart(data, 'bar', 'Nifty 50'); // Initialize chart with 'Nifty 50' as default
    })
    .catch(function(error) {
        console.error('There was a problem with the fetch operation:', error);
        hideLoading();
    })
    .finally(() => {
        if (chartData.length === 0) {
            hideLoading(); // Hide loading if no data
        }
    });

// Function to create the chart
function createChart(data, type, indexName) {
    showLoading(); // Show loading indicator
    // Filter data for the specified indexName
    currentFilteredData = data.filter(row => row.index_name === indexName);
    
    if (currentFilteredData.length === 0) {
        console.error(`No data found for index name: ${indexName}`);
        hideLoading();
        return; // Exit if no data found
    }

    // Create the chart
    chart = new Chart(ctx, {
        type: type, // Type of chart
        data: {
            labels: currentFilteredData.map(row => row.index_date), // Holds values for the label
            datasets: [
                {
                    label: indexName + ' Highest',
                    data: currentFilteredData.map(row => row.high_index_value), // High values
                    borderWidth: 1,
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.5)',
                    borderRadius: 20
                },
                {
                    label: indexName + ' Lowest',
                    data: currentFilteredData.map(row => row.low_index_value), // Low values
                    borderWidth: 1,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    borderRadius: 20
                },
                {
                    label: indexName + ' Open',
                    data: currentFilteredData.map(row => row.open_index_value),
                    borderWidth: 1,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                    borderRadius: 20
                },
                {
                    label: indexName + ' Close',
                    data: currentFilteredData.map(row => row.closing_index_value),
                    borderWidth: 1,
                    borderColor: 'purple',
                    backgroundColor: 'rgba(128, 0, 128, 0.5)',
                    borderRadius: 20
                },
            ]
        },
        options: {
            plugins: {
                legend: {
                    position: 'left'
                },
            },
            maintainAspectRatio: false,
            barPercentage: 1,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1000,
                    },
                }
            },
            onClick: function(event) {
                const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                if (activePoints.length > 0) {
                    const index = activePoints[0].index; // Get the index of the clicked bar
                    const dataPoint = currentFilteredData[index]; // Get the corresponding data point

                    // Update the <p> tags with values from the clicked bar
                    updateInfoDisplay(dataPoint);
                }
            }
        }
    });

    // Update the <p> tags with values from the first data point
    updateInfoDisplay(currentFilteredData[0]);
    hideLoading();
}

// Function to update the information display in the <p> tags
function updateInfoDisplay(dataPoint) {
    document.getElementById('index_date').textContent = `Date: ${dataPoint.index_date}`;
    document.getElementById('points_change').textContent = `Points Change: "${dataPoint.points_change}"`;
    document.getElementById('change_percent').textContent = `Change Percent: "${dataPoint.change_percent}"`;
    document.getElementById('volume').textContent = `Volume: "${dataPoint.volume}"`;
    document.getElementById('turnover_rs_cr').textContent = `Turnover Rs Cr: "${dataPoint.turnover_rs_cr}"`;
    document.getElementById('pe_ratio').textContent = `PE Ratio: "${dataPoint.pe_ratio}"`;
    document.getElementById('pb_ratio').textContent = `PB Ratio: "${dataPoint.pb_ratio}"`;
    document.getElementById('div_yield').textContent = `Div Yield: "${dataPoint.div_yield}"`;
}

// Update the chart data based on the selected index_name
function updateChart(indexName) {
    showLoading();
    // Filter new data based on the selected indexName
    currentFilteredData = chartData.filter(row => row.index_name === indexName);
    if (currentFilteredData.length === 0) {
        console.error(`No data found for index name: ${indexName}`);
        hideLoading();
        return; // Exit if no data found
    }
    
    // Update chart data
    chart.data.labels = currentFilteredData.map(row => row.index_date);
    chart.data.datasets[0].data = currentFilteredData.map(row => row.high_index_value);
    chart.data.datasets[1].data = currentFilteredData.map(row => row.low_index_value);
    chart.data.datasets[2].data = currentFilteredData.map(row => row.open_index_value);
    chart.data.datasets[3].data = currentFilteredData.map(row => row.closing_index_value);
    chart.data.datasets[0].label = indexName + ' Highest';
    chart.data.datasets[1].label = indexName + ' Lowest';
    chart.data.datasets[2].label = indexName + ' Open';
    chart.data.datasets[3].label = indexName + ' Close';

    // Update the <p> tags with values from the first data point of the new filtered data
    updateInfoDisplay(currentFilteredData[0]);

    // Update the chart title
    document.getElementById('chart-title').textContent = indexName;

    // Update the chart to reflect the new data
    chart.update();
    hideLoading();
}
