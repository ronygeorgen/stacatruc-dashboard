import * as React from "react"
import { Link } from 'react-router-dom';
import { isWithinInterval, parseISO } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import EditMenu from '../../components/DropdownEditMenu';
import OpportunityTable from '../../components/OpportunityTable';
import CardDetailModal from "../../components/CardDetailModal";
import { openOpportunities } from '../../utils/DummyData';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard03() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel } = useFiscalPeriod();
  
  // Filter opportunities based on date range
  const filteredOpportunities = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return openOpportunities;
    
    return openOpportunities.filter(opp => {
      // Parse the creation date or relevant date from string to Date object
      const oppDate = parseISO(opp.createdDate || opp.date);
      
      // Check if the date is within the selected date range
      return isWithinInterval(oppDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [dateRange, openOpportunities]);

  // Calculate total amount from filtered opportunities
  const totalAmount = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    // If the filteredOpportunities has similar structure to the original, just return a fixed amount
    // multiplied by the number of filtered opportunities - adjust this calculation as needed
    const baseAmount = 9962; // Original base amount
    return (filteredOpportunities.length / openOpportunities.length) * baseAmount;
    
    /* Uncomment and modify this if you have actual amount values in the opportunities
    // Sum all opportunity amounts
    return filteredOpportunities.reduce((sum, opp) => {
      let amount = 0;
      if (typeof opp.amount === 'string') {
        // Remove currency symbols and commas, then parse
        amount = parseFloat(opp.amount.replace(/[$,]/g, ''));
      } else if (typeof opp.amount === 'number') {
        amount = opp.amount;
      }
      return isNaN(amount) ? sum : sum + amount;
    }, 0);
    */
  }, [filteredOpportunities, openOpportunities]);
  
  // Calculate growth percentage based on opportunity distribution
  const growthPercentage = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    // For demo purposes, calculate a percentage based on the ratio of filtered to total opportunities
    const ratio = filteredOpportunities.length / openOpportunities.length;
    return Math.round(ratio * 100 - 50); // Adjust to make it fluctuate around 0%
    
    /* Alternative calculation based on opportunity values
    const highValueOpps = filteredOpportunities.filter(opp => {
      const amount = typeof opp.amount === 'string' 
        ? parseFloat(opp.amount.replace(/[$,]/g, ''))
        : (opp.amount || 0);
      return amount > 10000;
    }).length;
    
    return Math.round((highValueOpps / filteredOpportunities.length) * 100);
    */
  }, [filteredOpportunities, openOpportunities]);

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
            540, 466, 540, 466, 385, 432, 334,
            334, 289, 289, 200, 289, 222, 289,
            289, 403, 554, 304, 289, 270, 134,
            270, 829, 344, 388, 364,
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
            689, 562, 477, 477, 477, 477, 458,
            314, 430, 378, 430, 498, 642, 350,
            145, 145, 354, 260, 188, 188, 300,
            300, 282, 364, 660, 554,
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
            data: [290, 320, 350, 330, 400, 380, 270]
          },
          {
            ...baseData.datasets[1],
            data: [260, 290, 320, 300, 370, 350, 240]
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
            data: [310, 350, 330, 380]
          },
          {
            ...baseData.datasets[1],
            data: [280, 320, 300, 350]
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
            data: [289, 270, 134, 270, 829, 344]
          },
          {
            ...baseData.datasets[1],
            data: [188, 188, 300, 300, 282, 364]
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
            data: [289, 403, 554, 304, 289, 270, 134, 270, 829, 344, 388, 364]
          },
          {
            ...baseData.datasets[1],
            data: [350, 145, 145, 354, 260, 188, 188, 300, 300, 282, 364, 660]
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
            data: [466, 540, 466, 385, 432, 334, 334, 289, 289, 200, 289, 222]
          },
          {
            ...baseData.datasets[1],
            data: [562, 477, 477, 477, 477, 458, 314, 430, 378, 430, 498, 642]
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl pb-5" onClick={() => setIsModalOpen(true)}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Open Opportunity Total</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {periodLabel}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Sales</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{formatCurrency(totalAmount)}</div>
          <div className={`text-sm font-medium ${growthPercentage >= 0 ? 'text-green-700 bg-green-500/20' : 'text-red-700 bg-red-500/20'} px-1.5 rounded-full`}>
            {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
          </div>
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
        title={`Open Opportunity Total - ${periodLabel}`}
      >
        <OpportunityTable opportunities={filteredOpportunities} />
      </CardDetailModal>
    </>
  );
}

export default DashboardCard03;