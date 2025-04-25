import * as React from "react"
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import EditMenu from '../../components/DropdownEditMenu';
import OpportunityTable from '../../components/OpportunityTable';
import CardDetailModal from "../../components/CardDetailModal";
import { amountClosedOpportunities } from '../../utils/DummyData';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard02() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel } = useFiscalPeriod();
  
  // Filter opportunities based on date range
  const filteredOpportunities = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return amountClosedOpportunities;
    
    return amountClosedOpportunities.filter(opp => {
      // Parse the closing date from string to Date object
      const closingDate = parseISO(opp.closingDate);
      
      // Check if the closing date is within the selected date range
      return isWithinInterval(closingDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [dateRange, amountClosedOpportunities]);

  // Calculate total amount from filtered opportunities
  const totalAmount = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    // In a real application, you would sum the actual amount fields
    const averageOpportunityValue = 17489 / amountClosedOpportunities.length;
    return (filteredOpportunities.length * averageOpportunityValue).toFixed(0);
  }, [filteredOpportunities]);
  
  // Calculate growth percentage based on opportunity distribution
  const growthPercentage = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    const highValueOpps = filteredOpportunities.filter(
      opp => typeof opp.amount === 'string' && parseInt(opp.amount.replace(/[$,]/g, ''), 10) > 10000
    ).length;
    
    
    // Calculate percentage and invert to show negative growth
    const percentage = -Math.round((highValueOpps / filteredOpportunities.length) * 100);
    return percentage || -14; // Default to -14% if calculation fails
  }, [filteredOpportunities]);

  // Generate chart data based on the selected period
  const chartData = React.useMemo(() => {
    // Base chart data structure
    const baseData = {
      labels: [
        '12-01-2022', '01-01-2023', '02-01-2023',
        '03-01-2023', '04-01-2023', '05-01-2023',
        '06-01-2023', '07-01-2023', '08-01-2023',
        '09-01-2023', '10-01-2023', '11-01-2023',
        '12-01-2023', '01-01-2024', '02-01-2024',
        '03-01-2024', '04-01-2024', '05-01-2024',
        '06-01-2024', '07-01-2024', '08-01-2024',
        '09-01-2024', '10-01-2024', '11-01-2024',
        '12-01-2024', '01-01-2025',
      ],
      datasets: [
        // Indigo line
        {
          data: [
            622, 622, 426, 471, 365, 365, 238,
            324, 288, 206, 324, 324, 500, 409,
            409, 273, 232, 273, 500, 570, 767,
            808, 685, 767, 685, 685,
          ],
          fill: true,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            return chartAreaGradient(ctx, chartArea, [
              { stop: 0, color: adjustColorOpacity(getCssVariable('--primary'), 0) },
              { stop: 1, color: adjustColorOpacity(getCssVariable('--primary'), 0.2) }
            ]);
          },       
          borderColor: getCssVariable('--primary'),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointBackgroundColor: getCssVariable('--primary'),
          pointHoverBackgroundColor: getCssVariable('--primary'),
          pointBorderWidth: 0,
          pointHoverBorderWidth: 0,          
          clip: 20,
          tension: 0.2,
        },
        // Gray line
        {
          data: [
            732, 610, 610, 504, 504, 504, 349,
            349, 504, 342, 504, 610, 391, 192,
            154, 273, 191, 191, 126, 263, 349,
            252, 423, 622, 470, 532,
          ],
          borderColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointBackgroundColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
          pointHoverBackgroundColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
          pointBorderWidth: 0,
          pointHoverBorderWidth: 0,
          clip: 20,
          tension: 0.2,
        },
      ],
    };
    
    // Adjust the chart data based on the period
    if (periodLabel.includes("Week")) {
      // For week views, use daily data points
      const weekData = {
        ...baseData,
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [310, 290, 320, 280, 325, 300, 270]
          },
          {
            ...baseData.datasets[1],
            data: [280, 250, 290, 260, 300, 270, 240]
          }
        ]
      };
      return weekData;
    } 
    else if (periodLabel.includes("Month")) {
      // For month views, use weekly data points
      const monthData = {
        ...baseData,
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [300, 320, 290, 270]
          },
          {
            ...baseData.datasets[1],
            data: [270, 290, 260, 240]
          }
        ]
      };
      return monthData;
    }
    else if (periodLabel.includes("6 Months")) {
      // For 6 months view, use monthly data points
      const sixMonthData = {
        ...baseData,
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [500, 570, 767, 808, 685, 767]
          },
          {
            ...baseData.datasets[1],
            data: [126, 263, 349, 252, 423, 622]
          }
        ]
      };
      return sixMonthData;
    }
    else if (periodLabel === "This Year") {
      // For this year view, use monthly data points
      const thisYearData = {
        ...baseData,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [409, 409, 273, 232, 273, 500, 570, 767, 808, 685, 767, 685]
          },
          {
            ...baseData.datasets[1],
            data: [192, 154, 273, 191, 191, 126, 263, 349, 252, 423, 622, 470]
          }
        ]
      };
      return thisYearData;
    }
    else if (periodLabel === "Last Year") {
      // For last year view, use different monthly data points
      const lastYearData = {
        ...baseData,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [622, 426, 471, 365, 365, 238, 324, 288, 206, 324, 324, 500]
          },
          {
            ...baseData.datasets[1],
            data: [610, 610, 504, 504, 504, 349, 349, 504, 342, 504, 610, 391]
          }
        ]
      };
      return lastYearData;
    }
    
    // For custom range or default
    return baseData;
  }, [periodLabel]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl " onClick={() => setIsModalOpen(true)}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Closed Value</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {periodLabel}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Sales</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{formatCurrency(totalAmount)}</div>
          <div className="text-sm font-medium text-red-700 px-1.5 bg-red-500/20 rounded-full">{growthPercentage}%</div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        {/* Change the height attribute to adjust the chart height */}
        <LineChart data={chartData} width={389} height={128} />
      </div>
      
    </div>
    {/* Modal */}
    <CardDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Amount Closed Total - ${periodLabel}`}
      >
        <OpportunityTable opportunities={filteredOpportunities} />
      </CardDetailModal>
    </>
  );
}

export default DashboardCard02;