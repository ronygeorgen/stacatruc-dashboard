import React, { useState } from 'react';
import BarChart04 from '../../charts/BarChart04';
import Modal from '../../components/ChartModal';
import { getCssVariable } from '../../utils/Utils';
import { opportunityAPI } from '../../features/opportunity/opportunityAPI';
import CardDetailModal from '../../components/CardDetailModal';
import OpportunityTable from '../../components/OpportunityTable';
import { useFiscalPeriod } from '../../contexts/FiscalPeriodContext';

function DashboardCard014( { 
  title,
  labels,
  totalOpenCounts,
  totalClosedCounts,
  openOpsCount,
  closedOpsCount
} ) {
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalOpportunities, setModalOpportunities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [values, setValues] = useState({created_at_min:'', created_at_max:'', valueState:''})

  const { dateRange, periodLabel, fiscalPeriodCode } = useFiscalPeriod();
  
  const chartData = {
    labels: [
      '12-01-2022', '01-01-2023', '02-01-2023',
      '03-01-2023', '04-01-2023', '05-01-2023',
    ],
    datasets: [
      {
        label: 'Open',
        data: [
          800, 1600, 900, 1300, 1950, 1700,
        ],
        backgroundColor: getCssVariable('--secondary'),
        hoverBackgroundColor: getCssVariable('--secondary-dark'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Close',
        data: [
          4900, 2600, 5350, 4800, 5200, 4800,
        ],
        backgroundColor: getCssVariable('--primary'),
        hoverBackgroundColor: getCssVariable('--primary-dark'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  const fetchOpenOpportunities = React.useCallback(async (page = 1, created_at_min, created_at_max, valueState) => {
    try {
      // setLoading(true);
      
      const params = {
        searchQuery: "",
        page: page,
        state: valueState
      };
      
      // Apply fiscal period filter if available, otherwise use date range if available

        params.created_at_min = created_at_min
        params.created_at_max = created_at_max

      
      const data = await opportunityAPI.getOpportunities(
        params.searchQuery,
        params.page,
        params.pageSize,
        params.fiscal_period,
        params.created_at_min,
        params.created_at_max,
        params.state,
        params.pipeline,
        params.stage_name,
        params.assigned_to,
        params.contact,
        params.opportunity_source,
      );
      
      setModalOpportunities(data.results || []);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching open opportunities:', error);
    }
  }, []);

  const handleBarClick = ({ datasetIndex, index, payload }) => {
    const { created_at_min, created_at_max } = payload;
    console.log(`Clicked dataset ${datasetIndex}, index ${index}`);
 
    const valueState = datasetIndex == 0 ? 'open' : 'close'
    setIsModalOpen(true);
    setValues({created_at_min, created_at_max, valueState})
    fetchOpenOpportunities(1, created_at_min, created_at_max, valueState);
    setShowModal(true);
  };

  const handlePageChange = (page) => {
    fetchOpenOpportunities(page, values.created_at_min, values.created_at_max, values.valueState );
  };

  const closeModal = () => {
    setShowModal(false);
    // Use a short timeout to avoid UI flicker
    setTimeout(() => setModalData(null), 200);
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-full md:col-span-6 lg:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <BarChart04 title={title} labels={labels} totalOpenCounts={totalOpenCounts} totalClosedCounts={totalClosedCounts} openOpsCount={openOpsCount} closedOpsCount={closedOpsCount} width={795} height={248} onBarClick={handleBarClick} />
      
      {/* Modal component */}
      {/* <Modal isOpen={showModal} onClose={closeModal} data={modalData} /> */}
      {showModal && modalOpportunities && (
        <CardDetailModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            title={`${values.valueState=='open'? 'Open' : 'Closed'} Opportunities - ${periodLabel}`}
          >
            <OpportunityTable 
              opportunities={modalOpportunities} 
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          </CardDetailModal>
      )}
    </div>
  );
}

export default DashboardCard014;