# Stable Value Strategy Exit Assessment Tool

A web-based tool that helps users assess the optimal timing for exiting a stable value investment strategy using Federal Reserve economic data.

## Features

### User Inputs
- **Contract Start Date**: Dropdown selection for the contract inception date
- **Projected Termination Date**: Dropdown selection for the anticipated exit date
- **Contract Assets**: Total dollar amount of assets in the contract
- **Current Crediting Rate**: Current interest rate being credited (%)
- **Competitive Market Rate**: Alternative market interest rate available (%)
- **Current Recordkeeping Rate**: Current recordkeeping fee rate (%)
- **Recordkeeping Rate After Exit**: Projected recordkeeping rate post-exit (%)

### Visual Outputs

#### 1. Line Graph - Treasury Rate History
- Displays historical 3-Year Treasury Constant Maturity Rate (DGS3) from FRED
- Highlights contract start date with a green marker
- Highlights termination date with a red marker
- Provides context for rate environment during contract period

#### 2. Column Chart - Investor Interest Earned
- Compares annual interest under current crediting rate vs. competitive market rate
- Shows potential gains or losses from exiting the strategy
- Displays the dollar difference between the two scenarios

#### 3. Column Chart - Recordkeeping Fee Impact
- Compares current recordkeeping fees vs. post-exit fees
- Visualizes potential cost savings or increases
- Shows the dollar difference in annual fees

#### 4. Summary Analysis
- Comprehensive text summary of the analysis
- Net annual benefit or cost of exiting
- Recommendation based on input parameters

## Data Source

The tool uses the **3-Year Treasury Constant Maturity Rate (DGS3)** from the Federal Reserve Economic Data (FRED) database maintained by the Federal Reserve Bank of St. Louis.

- **Source URL**: https://fred.stlouisfed.org/series/DGS3
- **Update Frequency**: Daily (business days)
- **Data Range**: Historical data from 1982 to present

## How to Use

1. **Open the Tool**: Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)

2. **Enter Input Parameters**:
   - Select your contract start date from the dropdown
   - Select your projected termination date
   - Enter your contract assets amount
   - Enter all applicable interest and fee rates

3. **Generate Analysis**: Click the "Calculate & Generate Analysis" button

4. **Review Results**:
   - Examine the treasury rate history graph to understand the rate environment
   - Review the interest earned comparison to see potential gains
   - Check the recordkeeping fee comparison for cost implications
   - Read the summary analysis for a comprehensive recommendation

## Technical Details

### Technologies Used
- **HTML5**: Structure and content
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Application logic and data processing
- **Chart.js v4.4.1**: Data visualization library

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Data Handling
The tool attempts to fetch live data from FRED. If the fetch fails (due to CORS restrictions or network issues), it automatically generates realistic sample data for demonstration purposes.

## Installation

No installation required! This is a standalone web application.

### Option 1: Local File
Simply open `index.html` in your web browser.

### Option 2: Web Server
For production use, host the files on any web server:
```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Calculations

### Interest Earned
```
Current Interest = Contract Assets × (Current Crediting Rate / 100)
Competitive Interest = Contract Assets × (Competitive Market Rate / 100)
Difference = Competitive Interest - Current Interest
```

### Recordkeeping Fees
```
Current Fee = Contract Assets × (Current Recordkeeping Rate / 100)
After Exit Fee = Contract Assets × (Recordkeeping Rate After Exit / 100)
Savings = Current Fee - After Exit Fee
```

### Net Annual Benefit
```
Net Benefit = Interest Difference + Fee Savings
```

## Disclaimer

This tool is for informational and educational purposes only. It does not constitute financial, investment, or professional advice. Users should consult with qualified financial professionals before making any investment decisions.

The analysis provided is based on the input parameters and historical data. Past performance does not guarantee future results. Actual results may vary based on market conditions, contract terms, and other factors not captured in this tool.

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please refer to the repository documentation or contact your financial advisor for investment-specific guidance.
