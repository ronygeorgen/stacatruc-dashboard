import * as React from "react"
import { format } from 'date-fns';
import LineChart from '../../charts/LineChart01';
import CardDetailModal from '../../components/CardDetailModal';
import OpportunityTable from "../../components/OpportunityTable";
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";
import { axiosInstance } from "../../services/api";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpportunities } from "../../features/opportunity/opportunityThunks";
import { opportunityAPI } from "../../features/opportunity/opportunityAPI";

// Import utilities
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

function DashboardCard01() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel, fiscalPeriodCode } = useFiscalPeriod();
  const [modalOpportunities, setModalOpportunities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pageSize] = React.useState(10);
  const [chartData, setChartData] = React.useState(null);
  const [chartLoading, setChartLoading] = React.useState(false);

  const opportunities = useSelector((state) => state.opportunities.data || []);
  const dispatch = useDispatch();
  const { aggregations } = useSelector((state) => state.opportunities);
  
  // Prevent duplicate API calls with useRef flag
  const initialLoadDone = React.useRef(false);
  
  // Fetch opportunities and chart data
  React.useEffect(() => {
    // Create a function to handle the data fetching
    const fetchData = async () => {
      // Set default params
      const params = { 
        searchQuery: "", 
        page: 1, 
        pageSize: 10,
        state: 'open' // Only focus on open opportunities
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
          pageSize: 10,
          state: 'open'
        }));
      } else {
        // For subsequent loads, use filters
        dispatch(fetchOpportunities(params));
      }

      // Fetch chart data with fiscal period parameter
      try {
        setChartLoading(true);
        
        let endpoint = '/opportunity_dash';
        // Add fiscal period as query parameter if available
        if (fiscalPeriodCode) {
          endpoint += `?fiscal_period=${fiscalPeriodCode}`;
        }
        
        const response = await axiosInstance.get(endpoint);
        if (response.data && response.data.graph_data) {
          const graphData = response.data.graph_data;
          
          // Prepare chart data from API response - only open value
          const chartDatasets = {
            labels: graphData.labels,
            datasets: [
              // Open opportunities dataset with enhanced styling
              {
                data: graphData.open,
                fill: true,
                backgroundColor: (context) => {
                  // Create gradient fill
                  if (!context.chart.chartArea) {
                    return 'rgba(20, 83, 156, 0.12)';
                  }
                  
                  const { ctx, chartArea } = context.chart;
                  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                  gradient.addColorStop(0, 'rgba(20, 83, 156, 0.01)');
                  gradient.addColorStop(1, 'rgba(20, 83, 156, 0.15)');
                  return gradient;
                },
                borderColor: 'rgb(20, 83, 156)',
                borderWidth: 2.5,
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 5,
                pointBackgroundColor: 'rgb(255, 255, 255)',
                pointBorderColor: 'rgb(20, 83, 156)',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: 'rgb(20, 83, 156)',
                clip: 20,
                label: 'Open Value'
              }
            ]
          };
          
          setChartData(chartDatasets);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setChartLoading(false);
      }
    };
    
    // Call the fetch function
    fetchData();
  }, [dispatch, dateRange, fiscalPeriodCode]);
  
  const fetchOpenOpportunities = React.useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        searchQuery: "",
        page: page,
        pageSize: pageSize,
        state: 'open'
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
      console.error('Error fetching open opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, pageSize, fiscalPeriodCode]);
    
  const handlePageChange = (page) => {
    fetchOpenOpportunities(page);
  };
  
  const totalAmount = aggregations?.amount_open || 0;

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchOpenOpportunities(1); // Reset to first page when opening modal
  };

  // Format currency in GBP (British Pound)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
    <div className="cursor-pointer flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700" onClick={handleOpenModal}>
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Open Value</h2>
          <div className="text-xs font-semibold text-white px-2 py-1 bg-blue-600 rounded-full">
            {periodLabel}
          </div>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Sales Pipeline</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{formatCurrency(totalAmount)}</div>
          
        </div>
      </div>
      
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px] p-2">
        {chartLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : chartData ? (
          <LineChart 
            data={chartData} 
            width={389} 
            height={128} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No chart data available
          </div>
        )}
      </div>
    </div>
    
    {/* Modal */}
    <CardDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Open Opportunities - ${periodLabel}`}
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

export default DashboardCard01;