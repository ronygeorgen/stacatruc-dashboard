import * as React from "react"
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import CardDetailModal from '../../components/CardDetailModal';
import { totalAmountOpportunities } from '../../utils/DummyData';
import OpportunityTable from "../../components/OpportunityTable";
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard01() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel } = useFiscalPeriod();
  
  // Filter opportunities based on date range
  const filteredOpportunities = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return totalAmountOpportunities;
    
    return totalAmountOpportunities.filter(opp => {
      // Parse the closing date from string to Date object
      const closingDate = parseISO(opp.closingDate);
      
      // Check if the closing date is within the selected date range
      return isWithinInterval(closingDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [dateRange, totalAmountOpportunities]);

  // Calculate total amount from filtered opportunities
  const totalAmount = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    // In a real application, you would sum the actual amount fields
    const averageOpportunityValue = 24780 / filteredOpportunities.length;
    return (filteredOpportunities.length * averageOpportunityValue).toFixed(0);
  }, [filteredOpportunities]);
  
  // Calculate growth percentage based on probability distribution of filtered opportunities
  const growthPercentage = React.useMemo(() => {
    if (filteredOpportunities.length === 0) return 0;
    
    const highProbabilityOpps = filteredOpportunities.filter(
      opp => opp.probability === "75%" || opp.probability === "90%"
    ).length;
    
    const percentage = Math.round((highProbabilityOpps / filteredOpportunities.length) * 100);
    return percentage || 49; // Default to 49% if calculation fails
  }, [filteredOpportunities]);

  // Generate chart data based on the selected period
  const chartData = React.useMemo(() => {
    // You would typically fetch this data from an API based on the date range
    // For now, we'll use the predefined data but adjust it based on period
    
    // Base chart data structure
    const baseData = {
      labels: [
        '12-01-2022', '01-01-2023', '02-01-2023', '03-01-2023', '04-01-2023',
        '05-01-2023', '06-01-2023', '07-01-2023', '08-01-2023', '09-01-2023',
        '10-01-2023', '11-01-2023', '12-01-2023', '01-01-2024', '02-01-2024',
        '03-01-2024', '04-01-2024', '05-01-2024', '06-01-2024', '07-01-2024',
        '08-01-2024', '09-01-2024', '10-01-2024', '11-01-2024', '12-01-2024',
        '01-01-2025',
      ],
      datasets: [
        // green line
        {
          data: [732, 610, 610, 504, 504, 504, 349, 349, 504, 342, 504, 610, 391, 192, 154, 273, 191, 191, 126, 263, 349, 252, 423, 622, 470, 532],
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
          data: [532, 532, 532, 404, 404, 314, 314, 314, 314, 314, 234, 314, 234, 234, 314, 314, 314, 388, 314, 202, 202, 202, 202, 314, 720, 642],
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
    // In a real app, this would come from an API
    if (periodLabel.includes("Week")) {
      // For week views, use daily data points
      const weekData = {
        ...baseData,
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            ...baseData.datasets[0],
            data: [350, 425, 500, 475, 525, 420, 380]
          },
          {
            ...baseData.datasets[1],
            data: [300, 340, 360, 350, 370, 310, 290]
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
            data: [420, 470, 510, 490]
          },
          {
            ...baseData.datasets[1],
            data: [320, 340, 360, 330]
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
            data: [400, 450, 470, 490, 520, 532]
          },
          {
            ...baseData.datasets[1],
            data: [300, 320, 350, 380, 410, 450]
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
            data: [310, 350, 390, 420, 450, 470, 500, 510, 520, 530, 540, 532]
          },
          {
            ...baseData.datasets[1],
            data: [250, 270, 290, 310, 330, 350, 370, 390, 410, 430, 440, 450]
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
            data: [280, 320, 360, 400, 430, 450, 470, 490, 500, 510, 520, 515]
          },
          {
            ...baseData.datasets[1],
            data: [220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 410, 420]
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
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl " onClick={() => setIsModalOpen(true)}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Amount worth</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {periodLabel}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Sales</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{formatCurrency(totalAmount)}</div>
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
        title={`Total Amount Worth - ${periodLabel}`}
      >
        <OpportunityTable opportunities={filteredOpportunities} />
      </CardDetailModal>
    </>
  );
}

export default DashboardCard01;