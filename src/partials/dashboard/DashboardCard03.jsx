import * as React from "react"
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import EditMenu from '../../components/DropdownEditMenu';
import OpportunityTable from '../../components/OpportunityTable';
import CardDetailModal from "../../components/CardDetailModal";
import { openOpportunities } from '../../utils/DummyData';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard02() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel } = useFiscalPeriod();
  
  // Filter opportunities based on date range
// Filter opportunities based on date range
const filteredOpportunities = React.useMemo(() => {
  // Check if openOpportunities exists and has items
  if (!openOpportunities || openOpportunities.length === 0) {
    console.log("No open opportunities data available");
    return []; // Return empty array to avoid errors
  }
  
  // If no date range is set, return all opportunities
  if (!dateRange?.from || !dateRange?.to) return openOpportunities;
  
  return openOpportunities.filter(opp => {
    // Skip filtering if no createdDate is available
    if (!opp.createdDate) return false;
    
    try {
      const creationDate = parseISO(opp.createdDate);
      return isWithinInterval(creationDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    } catch (error) {
      console.error(`Error filtering opportunity: ${error.message}`);
      return false; // Exclude items with invalid dates
    }
  });
}, [dateRange, openOpportunities]);

  // Calculate total count of open opportunities
  const totalOpenCount = React.useMemo(() => {
    return filteredOpportunities.length;
  }, [filteredOpportunities]);
  
  // Calculate growth percentage based on opportunity distribution
  const growthPercentage = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    // In a real app, you would compare with previous period
    // For now, we'll calculate based on high-priority opportunities
    const highPriorityOpps = filteredOpportunities.filter(
      opp => opp.priority === 'High'
    ).length;
    
    // Calculate percentage
    const percentage = Math.round((highPriorityOpps / filteredOpportunities.length) * 100);
    return percentage || 22; // Default to 22% if calculation fails
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
            45, 52, 38, 24, 33, 26, 21,
            20, 26, 36, 30, 40, 38, 30,
            46, 36, 39, 33, 27, 39, 46,
            51, 54, 48, 45, 51,
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
            36, 32, 25, 33, 27, 25, 20,
            17, 21, 30, 24, 35, 32, 24,
            38, 28, 31, 29, 21, 28, 36,
            42, 48, 37, 35, 45,
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
            data: [42, 40, 45, 39, 41, 36, 31]
          },
          {
            ...baseData.datasets[1],
            data: [32, 30, 35, 29, 31, 28, 25]
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
            data: [42, 44, 48, 51]
          },
          {
            ...baseData.datasets[1],
            data: [32, 34, 38, 42]
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
            data: [27, 39, 46, 51, 54, 48]
          },
          {
            ...baseData.datasets[1],
            data: [21, 28, 36, 42, 48, 37]
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
            data: [30, 46, 36, 39, 33, 27, 39, 46, 51, 54, 48, 45]
          },
          {
            ...baseData.datasets[1],
            data: [24, 38, 28, 31, 29, 21, 28, 36, 42, 48, 37, 35]
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
            data: [52, 38, 24, 33, 26, 21, 20, 26, 36, 30, 40, 38]
          },
          {
            ...baseData.datasets[1],
            data: [32, 25, 33, 27, 25, 20, 17, 21, 30, 24, 35, 32]
          }
        ]
      };
      return lastYearData;
    }
    
    // For custom range or default
    return baseData;
  }, [periodLabel]);

  return (
    <>
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl" onClick={() => setIsModalOpen(true)}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Open Deals</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {periodLabel}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Active Pipeline</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{totalOpenCount}</div>
          <div className="text-sm font-medium text-green-700 px-1.5 bg-green-500/20 rounded-full">+{growthPercentage}%</div>
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
        title={`Open Opportunities - ${periodLabel}`}
      >
        <OpportunityTable opportunities={filteredOpportunities} />
      </CardDetailModal>
    </>
  );
}

export default DashboardCard02;