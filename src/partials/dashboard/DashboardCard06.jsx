import React, { useEffect, useState, useMemo } from 'react';
import PieChart from '../../charts/PieChart';
import ChartModal from '../../components/ChartModal';
import { axiosInstance } from "../../services/api";
import OpportunityTable from '../../components/OpportunityTable';
import CardDetailModal from '../../components/CardDetailModal';

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

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('api2/opportunity_dash');
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

    fetchOpportunityData();
  }, []);

  const processedChancesData = useMemo(() => {
    const result = [];

    dashboardData?.chances?.forEach(item => {
      if (item.chances_value && item.chances_value !== "Unknown") {
        const percentageMatch = item.chances_value.match(/(\d+)%/);
        if (percentageMatch && percentageMatch[1]) {
          const percentage = percentageMatch[1] + '%';
          const count = item.count || 0;

          result.push({
            probability: percentage,
            label: `${percentage} Probability`,
            count: count
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

  const fetchFilteredOpportunities = async (probability, page = 1) => {
    setLoading(true);
    const chancesParam = encodeURIComponent(`${probability} chances of closing the deal`);
    
    try {
      const response = await axiosInstance.get(`/api2/opportunities/?chances=${chancesParam}&page=${page}`);
      setSelectedOpportunities(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch filtered opportunities:", error);
      setSelectedOpportunities([]);
      setLoading(false);
    }
  };

  const handleSegmentClick = async (index, label) => {
    const probabilityValue = label.split(' ')[0]; // "25%"
    setSelectedProbability(probabilityValue);
    setModalTitle(`Opportunities with ${label}`);
    setIsModalOpen(true);
    
    // Fetch the first page of opportunities with this probability
    fetchFilteredOpportunities(probabilityValue, 1);
  };

  const handlePageChange = (page) => {
    if (selectedProbability) {
      fetchFilteredOpportunities(selectedProbability, page);
    }
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-4 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl" > 
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Deal Closing Probability</h2>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
          <span className="ml-2">{totalOpportunities} Open Opportunities</span>
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
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <OpportunityTable
          opportunities={selectedOpportunities}
          currentPage={currentPage}  
          totalCount={totalCount}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </CardDetailModal>
    </div>
  );
}

export default DashboardCard06;