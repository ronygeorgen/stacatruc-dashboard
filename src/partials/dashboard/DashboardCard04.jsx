import React, { useState } from 'react';
import BarChart01 from '../../charts/BarChart01';
import Modal from '../../components/ChartModal';
import { getCssVariable } from '../../utils/Utils';

function DashboardCard04({ 
  title,
  labels,
  dataOpen,
  dataClosed,
  amountOpen,
  amountClosed
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

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

  const handleBarClick = ({ datasetIndex, index }) => {
    console.log(`Clicked dataset ${datasetIndex}, index ${index}`);
    // Get additional data for the modal
    const dataset = chartData.datasets[datasetIndex];
    const label = chartData.labels[index];
    const value = dataset.data[index];
    
    // You could set modal data and open the modal here if needed
    setModalData({
      datasetLabel: dataset.label,
      label,
      value,
    });
    setShowModal(true);
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
      
      {showModal && modalData && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={modalData}
        />
      )}
    </div>
  );
}

export default DashboardCard04;