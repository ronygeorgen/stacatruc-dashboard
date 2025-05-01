
import * as React from "react"
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO, isValid } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import EditMenu from '../../components/DropdownEditMenu';
import OpportunityTable from "../../components/OpportunityTable";
import CardDetailModal from "../../components/CardDetailModal";
import { closedOpportunities } from '../../utils/DummyData';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpportunities } from "../../features/opportunity/opportunityThunks";
import { opportunityAPI } from "../../features/opportunity/opportunityAPI";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard05() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel, selectedPeriodIndex, fiscalPeriodCode } = useFiscalPeriod();
  const [modalOpportunities, setModalOpportunities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pageSize] = React.useState(10);
  
  const opportunities = useSelector((state) => state.opportunities.data || []);
  const dispatch = useDispatch();
  const { aggregations } = useSelector((state) => state.opportunities);
  
  // Prevent duplicate API calls with useRef flag
  const initialLoadDone = React.useRef(false);
  
  // Fetch opportunities when date range or fiscal period changes
  React.useEffect(() => {
    // Create a function to handle the data fetching
    const fetchData = () => {
      // Set default params
      const params = { 
        searchQuery: "", 
        page: 1, 
        pageSize: 10 
      };
      
      // If a fiscal period code is selected, use that for filtering
      if (fiscalPeriodCode) {
        params.fiscalPeriod = fiscalPeriodCode;
      } 
      // Otherwise use the date range if available
      else if (dateRange && dateRange.from) {
        params.fromDate = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange.to) {
          params.toDate = format(dateRange.to, 'yyyy-MM-dd');
        }
      }
      
      // Check if this is initial load
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        // For initial load, fetch all opportunities without filters
        dispatch(fetchOpportunities({ 
          searchQuery: "", 
          page: 1, 
          pageSize: 10 
        }));
      } else {
        // For subsequent loads, use filters
        dispatch(fetchOpportunities(params));
      }
    };
    
    // Call the fetch function
    fetchData();
  }, [dispatch, dateRange, fiscalPeriodCode]);

  const fetchCloseOpportunities = React.useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        searchQuery: "",
        page: page,
        pageSize: pageSize,
        state: 'close' // Using 'close' as specified
      };
      
      // Apply fiscal period filter if available, otherwise use date range if available
      if (fiscalPeriodCode) {
        params.fiscalPeriod = fiscalPeriodCode;
      } else if (dateRange && dateRange.from) {
        params.fromDate = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange.to) {
          params.toDate = format(dateRange.to, 'yyyy-MM-dd');
        }
      }
      
      const data = await opportunityAPI.getOpportunities(
        params.searchQuery,
        params.page,
        params.pageSize,
        params.fiscalPeriod,
        params.fromDate,
        params.toDate,
        params.state
      );
      
      setModalOpportunities(data.results || []);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching close opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, pageSize, fiscalPeriodCode]);

  const handlePageChange = (page) => {
    fetchCloseOpportunities(page);
  };

  const displayCount = aggregations?.closed_ops_count || 0;

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchCloseOpportunities(1); // Reset to first page when opening modal
  };

  
  // Filter opportunities based on date range
  // const filteredOpportunities = React.useMemo(() => {
  //   // If no opportunities data available, return empty array
  //   if (!Array.isArray(closedOpportunities) || closedOpportunities.length === 0) {
  //     console.log("No closed opportunities data available");
  //     return [];
  //   }
    
  //   // If no date range is set, return all opportunities
  //   if (!dateRange?.from || !dateRange?.to) {
  //     return closedOpportunities;
  //   }
    
  //   return closedOpportunities.filter(opp => {
  //     if (!opp) return false;
      
  //     // Use the closing date for filtering (prioritize different fields that might contain the date)
  //     const dateStr = opp.closingDate || opp.closedDate || opp.closeDate || opp.createdDate;
      
  //     // Skip opportunities without a date
  //     if (!dateStr) return false;
      
  //     try {
  //       const oppDate = parseISO(dateStr);
        
  //       // Check if date is within the selected range
  //       return isWithinInterval(oppDate, {
  //         start: dateRange.from,
  //         end: dateRange.to
  //       });
  //     } catch (error) {
  //       console.error("Error parsing date:", error);
  //       return false;
  //     }
  //   });
  // }, [dateRange, closedOpportunities]);

  // Calculate total count of closed opportunities
  // const totalClosedCount = React.useMemo(() => {
  //   return filteredOpportunities.length;
  // }, [filteredOpportunities]);
  
  // // Calculate growth percentage based on closed won vs closed lost ratio
  // const growthPercentage = React.useMemo(() => {
  //   if (filteredOpportunities.length === 0) return 0;
    
  //   // Calculate based on won vs lost ratio
  //   const closedWon = filteredOpportunities.filter(
  //     opp => opp.stage === 'Closed Won'
  //   ).length;
    
  //   const closedLost = filteredOpportunities.filter(
  //     opp => opp.stage === 'Closed Lost'
  //   ).length;
    
  //   // If all closed are won, return a positive growth
  //   if (closedWon > 0 && closedLost === 0) {
  //     return 15; // Good performance - all wins
  //   }
    
  //   // If all closed are lost, return a negative growth
  //   if (closedWon === 0 && closedLost > 0) {
  //     return -15; // Poor performance - all losses
  //   }
    
  //   // Calculate ratio of won vs total
  //   const ratio = closedWon / filteredOpportunities.length;
    
  //   // Convert to percentage (with some scaling)
  //   return Math.round((ratio * 2 - 1) * 15);
  // }, [filteredOpportunities]);

  // Generate chart data based on the selected period
  // const chartData = React.useMemo(() => {
  //   // Base chart data structure
  //   const baseData = {
  //     labels: [
  //       '12-01-2022', '01-01-2023', '02-01-2023',
  //       '03-01-2023', '04-01-2023', '05-01-2023',
  //       '06-01-2023', '07-01-2023', '08-01-2023',
  //       '09-01-2023', '10-01-2023', '11-01-2023',
  //       '12-01-2023', '01-01-2024', '02-01-2024',
  //       '03-01-2024', '04-01-2024', '05-01-2024',
  //       '06-01-2024', '07-01-2024', '08-01-2024',
  //       '09-01-2024', '10-01-2024', '11-01-2024',
  //       '12-01-2024', '01-01-2025',
  //     ],
  //     datasets: [
  //       // Indigo line
  //       {
  //         data: [
  //           540, 466, 540, 466, 385, 432, 334,
  //           334, 289, 289, 200, 289, 222, 289,
  //           289, 403, 554, 304, 289, 270, 134,
  //           270, 829, 344, 388, 364,
  //         ],
  //         fill: true,
  //         backgroundColor: function(context) {
  //           const chart = context.chart;
  //           const {ctx, chartArea} = chart;
  //           return chartAreaGradient(ctx, chartArea, [
  //             { stop: 0, color: adjustColorOpacity(getCssVariable('--primary'), 0) },
  //             { stop: 1, color: adjustColorOpacity(getCssVariable('--primary'), 0.2) }
  //           ]);
  //         },       
  //         borderColor: getCssVariable('--primary'),
  //         borderWidth: 2,
  //         pointRadius: 0,
  //         pointHoverRadius: 3,
  //         pointBackgroundColor: getCssVariable('--primary'),
  //         pointHoverBackgroundColor: getCssVariable('--primary'),
  //         pointBorderWidth: 0,
  //         pointHoverBorderWidth: 0,          
  //         clip: 20,
  //         tension: 0.2,
  //       },
  //       // Gray line
  //       {
  //         data: [
  //           689, 562, 477, 477, 477, 477, 458,
  //           314, 430, 378, 430, 498, 642, 350,
  //           145, 145, 354, 260, 188, 188, 300,
  //           300, 282, 364, 660, 554,
  //         ],
  //         borderColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
  //         borderWidth: 2,
  //         pointRadius: 0,
  //         pointHoverRadius: 3,
  //         pointBackgroundColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
  //         pointHoverBackgroundColor: adjustColorOpacity(getCssVariable('--color-gray-500'), 0.25),
  //         pointBorderWidth: 0,
  //         pointHoverBorderWidth: 0,
  //         clip: 20,
  //         tension: 0.2,
  //       },
  //     ],
  //   };
    
  //   // Adjust the chart data based on the period
  //   if (periodLabel?.includes("Week")) {
  //     // For week views, use daily data points
  //     const weekData = {
  //       ...baseData,
  //       labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //       datasets: [
  //         {
  //           ...baseData.datasets[0],
  //           data: [2, 1, 3, 2, 2, 0, 1]
  //         },
  //         {
  //           ...baseData.datasets[1],
  //           data: [1, 1, 2, 1, 2, 0, 1]
  //         }
  //       ]
  //     };
  //     return weekData;
  //   } 
  //   else if (periodLabel?.includes("Month")) {
  //     // For month views, use weekly data points
  //     const monthData = {
  //       ...baseData,
  //       labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  //       datasets: [
  //         {
  //           ...baseData.datasets[0],
  //           data: [3, 2, 4, 3]
  //         },
  //         {
  //           ...baseData.datasets[1],
  //           data: [2, 1, 3, 2]
  //         }
  //       ]
  //     };
  //     return monthData;
  //   }
  //   else if (periodLabel?.includes("6 Months")) {
  //     // For 6 months view, use monthly data points
  //     const sixMonthData = {
  //       ...baseData,
  //       labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  //       datasets: [
  //         {
  //           ...baseData.datasets[0],
  //           data: [8, 5, 7, 11, 6, 8]
  //         },
  //         {
  //           ...baseData.datasets[1],
  //           data: [6, 4, 5, 8, 5, 6]
  //         }
  //       ]
  //     };
  //     return sixMonthData;
  //   }
  //   else if (periodLabel === "This Year") {
  //     // For this year view, use monthly data points
  //     const thisYearData = {
  //       ...baseData,
  //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  //       datasets: [
  //         {
  //           ...baseData.datasets[0],
  //           data: [3, 5, 7, 9, 6, 8, 5, 7, 11, 6, 8, 4]
  //         },
  //         {
  //           ...baseData.datasets[1],
  //           data: [2, 3, 5, 7, 4, 6, 4, 5, 8, 5, 6, 3]
  //         }
  //       ]
  //     };
  //     return thisYearData;
  //   }
  //   else if (periodLabel === "Last Year") {
  //     // For last year view, use different monthly data points
  //     const lastYearData = {
  //       ...baseData,
  //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  //       datasets: [
  //         {
  //           ...baseData.datasets[0],
  //           data: [4, 6, 5, 7, 9, 8, 6, 5, 4, 7, 8, 6]
  //         },
  //         {
  //           ...baseData.datasets[1],
  //           data: [3, 4, 4, 5, 7, 6, 5, 4, 3, 5, 6, 4]
  //         }
  //       ]
  //     };
  //     return lastYearData;
  //   }
    
  //   // For custom range or default
  //   return baseData;
  // }, [periodLabel]);
  
  // // Get default count based on fiscal period if no filtered opportunities
  // const getDefaultCount = () => {
  //   if (periodLabel?.includes("Week")) return 5;
  //   if (periodLabel?.includes("Month")) return 12;
  //   if (periodLabel?.includes("6 Months")) return 45;
  //   if (periodLabel === "This Year") return 79;
  //   if (periodLabel === "Last Year") return 75;
  //   return closedOpportunities.length || 5; // Default fallback
  // };

  // Use calculated count or appropriate default


  return (
    <>
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl pb-5" onClick={handleOpenModal}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Closed Deals</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {periodLabel || "All Time"}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Completed Pipeline</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{displayCount}</div>
          {/* <div className={`text-sm font-medium ${growthPercentage >= 0 ? 'text-green-700 bg-green-500/20' : 'text-red-700 bg-red-500/20'} px-1.5 rounded-full`}>
            {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
          </div> */}
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        {/* Change the height attribute to adjust the chart height */}
        {/* <LineChart data={chartData} width={389} height={128} /> */}
      </div>
    </div>
    {/* Modal */}
    <CardDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Closed Opportunities - ${periodLabel}`}
      >
        <OpportunityTable 
          opportunities={modalOpportunities} 
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </CardDetailModal>
    </>
  );
}

export default DashboardCard05;