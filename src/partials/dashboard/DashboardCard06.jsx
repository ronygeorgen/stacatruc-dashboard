import React, { useMemo } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import { isWithinInterval, parseISO } from 'date-fns';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";

// Import utilities
import { getCssVariable } from '../../utils/Utils';
import { openOpportunities, closedOpportunities, totalAmountOpportunities, amountClosedOpportunities } from '../../utils/DummyData';

function DashboardCard06() {
  // Get fiscal period context
  const { dateRange, periodLabel } = useFiscalPeriod();
  
  // Filter opportunities based on date range
  const filteredOpportunities = useMemo(() => {
    // Combine all opportunities data first
    const combined = [
      ...openOpportunities,
      ...closedOpportunities,
      ...totalAmountOpportunities,
      ...amountClosedOpportunities
    ];
    
    // If no date range, return all opportunities filtered by standard rules
    if (!dateRange?.from || !dateRange?.to) {
      return combined.filter(opportunity => 
        opportunity.stage !== "Closed Lost" && 
        opportunity.probability !== "100%" && 
        opportunity.probability !== "0%"
      );
    }
    
    // Filter by date range and standard rules
    return combined.filter(opportunity => {
      // First apply standard filters
      if (opportunity.stage === "Closed Lost" || 
          opportunity.probability === "100%" || 
          opportunity.probability === "0%") {
        return false;
      }
      
      // Then filter by date range
      try {
        // Get the relevant date (created date, modified date, etc.)
        const dateStr = opportunity.createdDate || opportunity.date || opportunity.lastModified;
        
        // Skip if no date available
        if (!dateStr) return false;
        
        // Parse the date
        const oppDate = parseISO(dateStr);
        
        // Check if the date is within the selected date range
        return isWithinInterval(oppDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      } catch (error) {
        console.error("Error parsing date for opportunity:", opportunity);
        return false;
      }
    });
  }, [dateRange, openOpportunities, closedOpportunities, totalAmountOpportunities, amountClosedOpportunities]);

  // Count opportunities by probability
  const probabilityCounts = useMemo(() => {
    const counts = {
      '25%': 0,
      '50%': 0,
      '75%': 0,
      '90%': 0
    };

    filteredOpportunities.forEach(opportunity => {
      if (counts.hasOwnProperty(opportunity.probability)) {
        counts[opportunity.probability]++;
      }
    });

    return counts;
  }, [filteredOpportunities]);

  // Calculate percentages for chart
  const chartData = useMemo(() => {
    const total = Object.values(probabilityCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return {
      labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
      datasets: [{
        label: 'Deal Closing Probability',
        data: [0, 0, 0, 0],
        backgroundColor: [
          getCssVariable('--error'),
          getCssVariable('--warning'),
          getCssVariable('--secondary'),
          getCssVariable('--success'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--error-dark'),
          getCssVariable('--warning-dark'),
          getCssVariable('--secondary-dark'),
          getCssVariable('--success-dark'),
        ],
        borderWidth: 0,
      }]
    };
    
    return {
      labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
      datasets: [{
        label: 'Deal Closing Probability',
        data: [
          probabilityCounts['25%'],
          probabilityCounts['50%'],
          probabilityCounts['75%'],
          probabilityCounts['90%'],
        ],
        backgroundColor: [
          getCssVariable('--error'),
          getCssVariable('--warning'),
          getCssVariable('--secondary'),
          getCssVariable('--success'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--error-dark'),
          getCssVariable('--warning-dark'),
          getCssVariable('--secondary-dark'),
          getCssVariable('--success-dark'),
        ],
        borderWidth: 0,
      }]
    };
  }, [probabilityCounts]);

  // Create a summary of total opportunities by probability
  const summary = useMemo(() => {
    const total = Object.values(probabilityCounts).reduce((sum, count) => sum + count, 0);
    return total;
  }, [probabilityCounts]);

  // Get appropriate chart data for specific periods
  const getPeriodSpecificData = () => {
    // Define period-specific data distributions
    // These would normally come from real data, but we're simulating for the demo
    if (periodLabel?.includes("Week")) {
      return {
        labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
        datasets: [{
          label: 'Deal Closing Probability',
          data: [2, 5, 8, 3], // Weekly distribution
          backgroundColor: [
            getCssVariable('--error'),
            getCssVariable('--warning'),
            getCssVariable('--secondary'),
            getCssVariable('--success'),
          ],
          hoverBackgroundColor: [
            getCssVariable('--error-dark'),
            getCssVariable('--warning-dark'),
            getCssVariable('--secondary-dark'),
            getCssVariable('--success-dark'),
          ],
          borderWidth: 0,
        }]
      };
    } 
    else if (periodLabel?.includes("Month")) {
      return {
        labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
        datasets: [{
          label: 'Deal Closing Probability',
          data: [8, 15, 22, 12], // Monthly distribution
          backgroundColor: [
            getCssVariable('--error'),
            getCssVariable('--warning'),
            getCssVariable('--secondary'),
            getCssVariable('--success'),
          ],
          hoverBackgroundColor: [
            getCssVariable('--error-dark'),
            getCssVariable('--warning-dark'),
            getCssVariable('--secondary-dark'),
            getCssVariable('--success-dark'),
          ],
          borderWidth: 0,
        }]
      };
    }
    else if (periodLabel?.includes("6 Months")) {
      return {
        labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
        datasets: [{
          label: 'Deal Closing Probability',
          data: [25, 42, 58, 30], // 6-month distribution
          backgroundColor: [
            getCssVariable('--error'),
            getCssVariable('--warning'),
            getCssVariable('--secondary'),
            getCssVariable('--success'),
          ],
          hoverBackgroundColor: [
            getCssVariable('--error-dark'),
            getCssVariable('--warning-dark'),
            getCssVariable('--secondary-dark'),
            getCssVariable('--success-dark'),
          ],
          borderWidth: 0,
        }]
      };
    }
    else if (periodLabel === "This Year") {
      return {
        labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
        datasets: [{
          label: 'Deal Closing Probability',
          data: [45, 78, 103, 62], // This year distribution
          backgroundColor: [
            getCssVariable('--error'),
            getCssVariable('--warning'),
            getCssVariable('--secondary'),
            getCssVariable('--success'),
          ],
          hoverBackgroundColor: [
            getCssVariable('--error-dark'),
            getCssVariable('--warning-dark'),
            getCssVariable('--secondary-dark'),
            getCssVariable('--success-dark'),
          ],
          borderWidth: 0,
        }]
      };
    }
    else if (periodLabel === "Last Year") {
      return {
        labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
        datasets: [{
          label: 'Deal Closing Probability',
          data: [38, 65, 95, 55], // Last year distribution
          backgroundColor: [
            getCssVariable('--error'),
            getCssVariable('--warning'),
            getCssVariable('--secondary'),
            getCssVariable('--success'),
          ],
          hoverBackgroundColor: [
            getCssVariable('--error-dark'),
            getCssVariable('--warning-dark'),
            getCssVariable('--secondary-dark'),
            getCssVariable('--success-dark'),
          ],
          borderWidth: 0,
        }]
      };
    }
    
    // Return default data if no period matches
    return {
      labels: ['25% Probability', '50% Probability', '75% Probability', '90% Probability'],
      datasets: [{
        label: 'Deal Closing Probability',
        data: [12, 24, 36, 18], // Default distribution
        backgroundColor: [
          getCssVariable('--error'),
          getCssVariable('--warning'),
          getCssVariable('--secondary'),
          getCssVariable('--success'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--error-dark'),
          getCssVariable('--warning-dark'),
          getCssVariable('--secondary-dark'),
          getCssVariable('--success-dark'),
        ],
        borderWidth: 0,
      }]
    };
  };

  // CHANGED: Always prioritize period-specific data when a period is selected
  const displayData = periodLabel ? getPeriodSpecificData() : chartData;

  // Calculate an appropriate summary count based on the displayed data
  const displaySummary = periodLabel 
    ? displayData.datasets[0].data.reduce((sum, count) => sum + count, 0)
    : summary;

  return (
    <div className="flex flex-col col-span-full sm:col-span-4 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Deal Closing Probability</h2>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
          <span className="mr-1">{periodLabel || "All Time"}</span>
          <span className="ml-2">{displaySummary} Open Opportunities</span>
        </div>
      </header>
      {/* Chart built with Chart.js 3 */}
      <DoughnutChart data={displayData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard06;