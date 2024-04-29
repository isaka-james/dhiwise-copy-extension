// Function to fetch and update exchange rates for 10 major currencies
function updateExchangeRates() {
    fetch('https://open.er-api.com/v6/latest/TZS')
    .then(response => response.json())
    .then(data => {
        const rates = data.rates;
        const tableBody = document.querySelector('#exchange-table tbody');
        tableBody.innerHTML = ''; // Clear existing data
        
        // Define the 10 major currencies to display
        const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR', 'ZAR'];

        // Iterate through each major currency and add a row to the table
        majorCurrencies.forEach(currency => {
            const exchangeRate = rates[currency];
            if (exchangeRate) {
                const rateToTZS = (1 / exchangeRate).toFixed(2); // Calculate exchange rate to TZS for 1 unit of currency
                const row = `<tr>
                                <td>${currency}</td>
                                <td>${rateToTZS} TZS</td>
                            </tr>`;
                tableBody.innerHTML += row;
            }
        });
    })
    .catch(error => console.error('Error fetching exchange rates:', error));
}

// Update exchange rates initially and every 10 seconds
updateExchangeRates();
setInterval(updateExchangeRates, 10000); // Update every 10 seconds