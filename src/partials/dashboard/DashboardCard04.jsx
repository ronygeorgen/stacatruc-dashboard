import React, { useState } from 'react';
import BarChart01 from '../../charts/BarChart01';
import Modal from '../../components/ChartModal';
import { getCssVariable } from '../../utils/Utils';
import CardDetailModal from '../../components/CardDetailModal';
import OpportunityTable from '../../components/OpportunityTable';
import { opportunityAPI } from '../../features/opportunity/opportunityAPI';
import { useFiscalPeriod } from '../../contexts/FiscalPeriodContext';

function DashboardCard04({ 
  title,
  labels,
  dataOpen,
  dataClosed,
  amountOpen,
  amountClosed
}) {
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalOpportunities, setModalOpportunities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [values, setValues] = useState({created_at_min:'', created_at_max:'', valueState:''})

  const { dateRange, periodLabel, fiscalPeriodCode } = useFiscalPeriod();

  // Use the props data to construct the chart data
  const chartData = {
    labels: labels ,
    datasets: [
      {
        label: 'Open',
        data: dataOpen,
        // We'll use secondary color for the Open data (blue bar)
        backgroundColor: getCssVariable('--secondary'),
        hoverBackgroundColor: getCssVariable('--secondary-dark'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
        // Add custom metadata for the legend
        meta: {
          amount: amountOpen
        }
      },
      {
        label: 'Closed',
        data: dataClosed,
        // We'll use primary color for the Closed data (green bar)
        backgroundColor: getCssVariable('--primary'),
        hoverBackgroundColor: getCssVariable('--primary-dark'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
        // Add custom metadata for the legend
        meta: {
          amount: amountClosed
        }
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
    console.log(`Clicked dataset ${datasetIndex}, index ${index}`, created_at_min, created_at_max, 'min');
    // Get additional data for the modal
    
    const valueState = datasetIndex == 0 ? 'open' : 'close'
    setIsModalOpen(true);
    setValues({created_at_min, created_at_max, valueState})
    fetchOpenOpportunities(1, created_at_min, created_at_max, valueState);
    setShowModal(true);
  };

  const handlePageChange = (page) => {
    fetchOpenOpportunities(page, values.created_at_min, values.created_at_max, values.valueState );
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-full md:col-span-6 lg:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <BarChart01 
        title={title}
        labels={labels}
        dataOpen={dataOpen}
        dataClosed={dataClosed}
        amountOpen={amountOpen}
        amountClosed={amountClosed}
        width={795} 
        height={248} 
        onBarClick={handleBarClick}
      />
      
      {showModal && modalOpportunities && (
        // <Modal
        //   isOpen={showModal}
        //   onClose={() => setShowModal(false)}
        //   data={modalData}
        // />
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

export default DashboardCard04;