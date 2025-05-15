import React, { useState } from 'react';
import BarChart04 from '../../charts/BarChart04';
import Modal from '../../components/ChartModal';
import { getCssVariable } from '../../utils/Utils';

function DashboardCard014( { 
  title,
  labels,
  totalOpenCounts,
  totalClosedCounts,
  openOpsCount,
  closedOpsCount
} ) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  
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

  const handleBarClick = ({ datasetIndex, index }) => {
    console.log(`Clicked dataset ${datasetIndex}, index ${index}`);
    // Get additional data for the modal
    const dataset = chartData.datasets[datasetIndex];
    const label = chartData.labels[index];
    const value = dataset.data[index];
    
    setModalData({ 
      datasetIndex, 
      index,
      label,
      value,
      datasetLabel: dataset.label
    });
    setShowModal(true);
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
      <Modal isOpen={showModal} onClose={closeModal} data={modalData} />
    </div>
  );
}

export default DashboardCard014;