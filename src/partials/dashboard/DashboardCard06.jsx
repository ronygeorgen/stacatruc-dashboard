import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import PieChart from '../../charts/PieChart';
import ChartModal from '../../components/ChartModal';
import { axiosInstance } from "../../services/api";
import OpportunityTable from '../../components/OpportunityTable';
import CardDetailModal from '../../components/CardDetailModal';
import { useFiscalPeriod } from "../../contexts/FiscalPeriodContext";
import { useDispatch, useSelector } from 'react-redux';
import { downloadAsCSV } from '../../components/DownloadAsCSV';

function DashboardCard06() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [opportunityData, setOpportunityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [estimatedClosingStartDate, setEstimatedClosingStartDate] = useState(null);
  const [estimatedClosingEndDate, setEstimatedClosingEndDate] = useState(null);
  const [estimatedDeliveryStartDate, setEstimatedDeliveryStartDate] = useState(null);
  const [estimatedDeliveryEndDate, setEstimatedDeliveryEndDate] = useState(null);
  const [updateStartDate, setUpdateStartDate] = useState(null);
  const [updateEndDate, setUpdateEndDate] = useState(null);
  
  // Add fiscal period context
  const { dateRange, periodLabel, selectedPeriodIndex, fiscalPeriodCode } = useFiscalPeriod();
  
  const selectedPipelines = useSelector((state) => state.filters?.selectedGlobalFilterPipelines || []);
  const selectedPipelineStages = useSelector((state) => state.filters?.pipelineStages || []);
  const selectedAssignedUsers = useSelector((state) => state.filters?.assignedUsers || []);
  const selectedOpportunityOwners = useSelector((state) => state.filters?.opportunityOwners || []);
  const selectedOpportunitySources = useSelector((state) => state.filters?.opportunitySources || []);
  const selectedProductSales = useSelector((state) => state.filters?.productSales || []);
  
  // Prevent duplicate API calls with useRef flag
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setLoading(true);
        
        // Create a function to build query parameters
        const buildParams = () => {
          const params = new URLSearchParams();
          
          // If a fiscal period code is selected, use that for filtering
          if (fiscalPeriodCode) {
            params.append('fiscal_period', fiscalPeriodCode);
          } 
          // Otherwise use the date range if available
          else if (dateRange && dateRange.from) {
            params.append('created_at_min', format(dateRange.from, 'yyyy-MM-dd'));
            if (dateRange.to) {
              params.append('created_at_max', format(dateRange.to, 'yyyy-MM-dd'));
            }
          }

          // Add pipeline filters if available
          if (selectedPipelines && selectedPipelines.length > 0) {
            selectedPipelines.forEach(pipeline => {
              params.append('pipeline',pipeline)
            });
          }

          if (selectedPipelineStages && selectedPipelineStages.length > 0) {
            selectedPipelineStages.forEach(stage_name => {
              params.append("stage_name", stage_name);
            });
          }
          
          if (selectedAssignedUsers && selectedAssignedUsers.length > 0) {
            selectedAssignedUsers.forEach(assigned_to => {
              params.append("assigned_to", assigned_to);
            });
          }
          
          if (selectedOpportunityOwners && selectedOpportunityOwners.length > 0) {
            selectedOpportunityOwners.forEach(contact => {
              params.append("contact", contact);
            });
          }
          
          if (selectedOpportunitySources && selectedOpportunitySources.length > 0) {
            selectedOpportunitySources.forEach(opportunity_source => {
              params.append("opportunity_source", opportunity_source);
            });
          }
          
          return params.toString();
        };
        
        const queryParams = buildParams();
        const url = queryParams ? `/opportunity_dash?${queryParams}` : '/opportunity_dash';
        
        const response = await axiosInstance.get(url);
        setDashboardData(response.data);
        if (response.data?.chances) {
          setOpportunityData(response.data.chances);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching opportunity data:", err);
        setError("Failed to load opportunity data");
        setLoading(false);
      }
    };

    // Check if this is initial load or if the filters have changed
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      // For initial load, fetch all opportunities without filters
      fetchOpportunityData();
    } else {
      // For subsequent loads, use filters
      fetchOpportunityData();
    }
  }, [dateRange, fiscalPeriodCode, selectedPipelines, selectedPipelineStages, selectedAssignedUsers, selectedOpportunityOwners, selectedOpportunitySources]);


  const processedChancesData = useMemo(() => {
    const result = [];

    dashboardData?.chances?.forEach(item => {
      if (item.chances_value && item.chances_value !== "Unknown") {
        const percentageMatch = item.chances_value.match(/(\d+)%/);
        if (percentageMatch && percentageMatch[1]) {
          const percentage = percentageMatch[1] + '%';
          const count = item.count || 0;
          const value = item.total_value || 0;

          result.push({
            probability: percentage,
            label: `${percentage} Probability`,
            count: count,
            value: value
          });
        }
      }
    });

    return result;
  }, [dashboardData]);

  const chartData = useMemo(() => {
    const sortedChances = [...processedChancesData].sort((a, b) => {
      return parseInt(a.probability) - parseInt(b.probability);
    });

    return {
      labels: sortedChances.map(item => item.label),
      datasets: [
        {
          label: 'Deal Closing Probability',
          data: sortedChances.map(item => item.count),
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          tooltipData: sortedChances // Custom field to pass original objects for tooltip customization
        }
      ]
    };
  }, [processedChancesData]);

  const totalOpportunities = useMemo(() => {
    return dashboardData?.open_ops_count || 0;
  }, [dashboardData]);



  const fetchFilteredOpportunities = useCallback(async (
    probability, 
    page = 1, 
    createdAtMin = null, 
    createdAtMax = null,
    estimatedClosingMin = null,
    estimatedClosingMax = null,
    estimatedDeliveryMin = null,
    estimatedDeliveryMax = null,
    updateMin = null,
    updateMax = null,
  ) => {
    setLoading(true);
    
    try {
      // Format the chances parameter correctly - don't use encodeURIComponent here
      const chancesParam = `${probability} chances of closing the deal`;
      
      // Build the base URL without URLSearchParams to avoid double encoding
      let url = `/opportunities/?chances=${encodeURIComponent(chancesParam)}&page=${page}&page_size=${pageSize}`;
      
      // Add fiscal period filter if available, otherwise use date range
      if (createdAtMin && createdAtMax) {
        url += `&created_at_min=${createdAtMin}&created_at_max=${createdAtMax}`;
      } else if (fiscalPeriodCode) {
        url += `&fiscal_period=${encodeURIComponent(fiscalPeriodCode)}`;
      } else if (dateRange && dateRange.from) {
        url += `&created_at_min=${format(dateRange.from, 'yyyy-MM-dd')}`;
        if (dateRange.to) {
          url += `&created_at_max=${format(dateRange.to, 'yyyy-MM-dd')}`;
        }
      }

      // Add estimated closing date filters
      if (estimatedClosingMin && estimatedClosingMax) {
        url += `&estimated_closing_date_min=${estimatedClosingMin}&estimated_closing_date_max=${estimatedClosingMax}`;
      }

      // Add estimated delivery date filters
      if (estimatedDeliveryMin && estimatedDeliveryMax) {
        url += `&estimated_delivery_date_min=${estimatedDeliveryMin}&estimated_delivery_date_max=${estimatedDeliveryMax}`;
      }
      
      // Add estimated delivery date filters
      if (updateMin && updateMax) {
        url += `&updated_at_min=${updateMin}&updated_at_max=${updateMax}`;
      }

      // Add pipeline filters if available
      if (selectedPipelines && selectedPipelines.length > 0) {
        selectedPipelines.forEach(pipeline => {
          url += `&pipeline=${encodeURIComponent(pipeline)}`;
        });
      }
      
      if (selectedPipelineStages && selectedPipelineStages.length > 0) {
        selectedPipelineStages.forEach(stage_name => {
          url += `&stage_name=${encodeURIComponent(stage_name)}`;
        });
      }
      
      if (selectedAssignedUsers && selectedAssignedUsers.length > 0) {
        selectedAssignedUsers.forEach(assigned_to => {
          url += `&assigned_to=${encodeURIComponent(assigned_to)}`;
        });
      }
      
      if (selectedOpportunityOwners && selectedOpportunityOwners.length > 0) {
        selectedOpportunityOwners.forEach(contact => {
          url += `&contact=${encodeURIComponent(contact)}`;
        });
      }
      
      if (selectedOpportunitySources && selectedOpportunitySources.length > 0) {
        selectedOpportunitySources.forEach(opportunity_source => {
          url += `&opportunity_source=${encodeURIComponent(opportunity_source)}`;
        });
      }
      
      
      const response = await axiosInstance.get(url);
      setSelectedOpportunities(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch filtered opportunities:", error);
      setSelectedOpportunities([]);
      setLoading(false);
    }
  }, [dateRange, fiscalPeriodCode, selectedPipelines, selectedPipelineStages, selectedAssignedUsers, selectedOpportunityOwners, selectedOpportunitySources]);

 // Fixed handlers that only pass the specific filter being set
const handleEstimatedClosingDateFilterChange = useCallback((newStartDate, newEndDate) => {
  if (selectedProbability) {
    setEstimatedClosingStartDate(newStartDate);
    setEstimatedClosingEndDate(newEndDate);
    fetchFilteredOpportunities(
      selectedProbability, 
      currentPage, 
      startDate,  // Only pass if actually set
      endDate,    // Only pass if actually set
      newStartDate,  // estimatedClosingMin - only this filter is being set
      newEndDate,    // estimatedClosingMax - only this filter is being set
      estimatedDeliveryStartDate,  // Only pass if actually set
      estimatedDeliveryEndDate,     // Only pass if actually set
      updateStartDate,
      updateEndDate
    );
  }
}, [selectedProbability, currentPage, startDate, endDate, estimatedDeliveryStartDate, estimatedDeliveryEndDate, updateStartDate, updateEndDate, fetchFilteredOpportunities]);

const handleEstimatedDeliveryDateFilterChange = useCallback((newStartDate, newEndDate) => {
  if (selectedProbability) {
    setEstimatedDeliveryStartDate(newStartDate);
    setEstimatedDeliveryEndDate(newEndDate);
    fetchFilteredOpportunities(
      selectedProbability, 
      currentPage, 
      startDate,  // Only pass if actually set
      endDate,    // Only pass if actually set
      estimatedClosingStartDate,   // Only pass if actually set
      estimatedClosingEndDate,     // Only pass if actually set
      newStartDate,  // estimatedDeliveryMin - only this filter is being set
      newEndDate,     // estimatedDeliveryMax - only this filter is being set
      updateStartDate,
      updateEndDate
    );
  }
}, [selectedProbability, currentPage, startDate, endDate, estimatedClosingStartDate, estimatedClosingEndDate, updateStartDate, updateEndDate, fetchFilteredOpportunities]);

const handleUpdateDateFilterChange = useCallback((newStartDate, newEndDate) => {
  if (selectedProbability) {
    setUpdateStartDate(newStartDate);
    setUpdateEndDate(newEndDate);
    fetchFilteredOpportunities(
      selectedProbability, 
      currentPage, 
      startDate,  // Only pass if actually set
      endDate,    // Only pass if actually set
      estimatedClosingStartDate,   // Only pass if actually set
      estimatedClosingEndDate,     // Only pass if actually set
      estimatedDeliveryStartDate,  // estimatedDeliveryMin - only this filter is being set
      estimatedDeliveryEndDate,     // estimatedDeliveryMax - only this filter is being set
      newStartDate,
      newEndDate
    );
  }
}, [selectedProbability, currentPage, startDate, endDate, estimatedClosingStartDate, estimatedClosingEndDate, estimatedDeliveryStartDate, estimatedDeliveryEndDate, fetchFilteredOpportunities]);

const handleDateFilterChange = useCallback((startDate, endDate) => {
  if (selectedProbability) {
    setStartDate(startDate);
    setEndDate(endDate);
    fetchFilteredOpportunities(
      selectedProbability, 
      currentPage, 
      startDate,  // createdAtMin - only this filter is being set
      endDate,    // createdAtMax - only this filter is being set
      estimatedClosingStartDate,   // Only pass if actually set
      estimatedClosingEndDate,     // Only pass if actually set
      estimatedDeliveryStartDate,  // Only pass if actually set
      estimatedDeliveryEndDate,     // Only pass if actually set
      updateStartDate,
      updateEndDate
    );
  }
}, [selectedProbability, currentPage, estimatedClosingStartDate, estimatedClosingEndDate, estimatedDeliveryStartDate, estimatedDeliveryEndDate, updateStartDate, updateEndDate, fetchFilteredOpportunities]);



  const handleDownloadCSV = useCallback(async () => {
    
    try {
    setDownloadLoading(true);
    
    const chancesParam = `${selectedProbability} chances of closing the deal`;
    const filters = {
      chancesParam,
      startDate,
      endDate,
      estimatedClosingStartDate,
      estimatedClosingEndDate,
      estimatedDeliveryStartDate,
      estimatedDeliveryEndDate,
      updateStartDate,
      updateEndDate,
      fiscalPeriodCode,
      dateRange,
      selectedPipelines,
      selectedPipelineStages,
      selectedAssignedUsers,
      selectedOpportunityOwners,
      selectedOpportunitySources,
      format
    };
    
    await downloadAsCSV([], selectedProbability, axiosInstance, filters);
    
    // Reset all date states
    setStartDate(null);
    setEndDate(null);
    setEstimatedClosingStartDate(null);
    setEstimatedClosingEndDate(null);
    setEstimatedDeliveryStartDate(null);
    setEstimatedDeliveryEndDate(null);
    setUpdateStartDate(null);
    setUpdateEndDate(null);
    setDownloadLoading(false);
  } catch (error) {
    console.error("Failed to download CSV:", error);
    setDownloadLoading(false);
  }
}, [
  startDate, endDate, 
  estimatedClosingStartDate, estimatedClosingEndDate,
  estimatedDeliveryStartDate, estimatedDeliveryEndDate, 
  updateStartDate, updateEndDate, selectedProbability, 
  fiscalPeriodCode, dateRange, selectedPipelines, selectedPipelineStages, 
  selectedAssignedUsers, selectedOpportunityOwners, selectedOpportunitySources
]);



  const handleSegmentClick = async (index, label) => {
    const probabilityValue = label.split(' ')[0]; // "25%"
    setSelectedProbability(probabilityValue);
    setModalTitle(`Opportunities with ${label} - ${periodLabel}`);
    setIsModalOpen(true);
    
    // Fetch the first page of opportunities with this probability
    fetchFilteredOpportunities(probabilityValue, 1);
  };

   // Reset all filter states when modal is closed
    const handleModalClose = () => {
      setIsModalOpen(false);
      setSelectedProbability(null);
      setStartDate(null);
      setEndDate(null);
      setEstimatedClosingStartDate(null);
      setEstimatedClosingEndDate(null);
      setEstimatedDeliveryStartDate(null);
      setEstimatedDeliveryEndDate(null);
      setUpdateStartDate(null);
      setUpdateEndDate(null);
      setCurrentPage(1);
      setSelectedOpportunities([]);
      setTotalCount(0);
    };

  const handlePageChange = (page) => {
    if (selectedProbability) {
      fetchFilteredOpportunities(selectedProbability, page);
    }
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-12 lg:col-span-4 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl" > 
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Deal Closing Probability</h2>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
          <span className="ml-2">{totalOpportunities} Open Opportunities</span>
          <span className="ml-2">• {periodLabel}</span>
        </div>
      </header>

      {loading && !isModalOpen && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading data...</div>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!loading && !error && chartData.labels.length > 0 && (
        <PieChart 
          data={chartData} 
          width={389} 
          height={260} 
          onSegmentClick={handleSegmentClick}
          customTooltip={(tooltipItem, data) => {
            const index = tooltipItem[0].dataIndex;
            const dataset = data.datasets[0];
            const original = dataset.tooltipData?.[index];
            return `${original.label}: ${original.count}`;
          }}
        />
      )}
      
      <CardDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={modalTitle}
      >
        <OpportunityTable
          opportunities={selectedOpportunities}
          currentPage={currentPage}  
          totalCount={totalCount}
          onPageChange={handlePageChange}
          loading={loading}
          downloadLoading={downloadLoading}
          onDateFilterChange={handleDateFilterChange}
          onEstimatedClosingDateFilterChange={handleEstimatedClosingDateFilterChange}
          onEstimatedDeliveryDateFilterChange={handleEstimatedDeliveryDateFilterChange}
          onUpdateFilterChange={handleUpdateDateFilterChange}
          onDownloadCSV={handleDownloadCSV}
        />
      </CardDetailModal>
    </div>
  );
}

export default DashboardCard06;