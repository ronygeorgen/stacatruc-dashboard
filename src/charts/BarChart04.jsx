import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const getMonthRange = (label) => {
  const [year, month] = label.split('-').map(Number); // e.g., "2024-05" -> 2024, 5

  // Use UTC to prevent timezone shift
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));

  const formatDate = (date) => date.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return {
    created_at_min: formatDate(firstDay),
    created_at_max: formatDate(lastDay),
  };
};

const BarChart04 = ({ 
  title, 
  labels,
  totalOpenCounts,
  totalClosedCounts, 
  openOpsCount,
  closedOpsCount,
  onBarClick
}) => {
  const [viewMode, setViewMode] = useState('both'); // 'both', 'open', 'closed'
  

  // Format data for the chart
  const data = labels.map((label, index) => {
    const { created_at_min, created_at_max } = getMonthRange(label);

    return {
      name: label,
      Open: totalOpenCounts[index],
      Closed: totalClosedCounts[index],
      created_at_min,
      created_at_max,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md rounded border border-gray-200">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Toggle buttons for view modes
  const ViewToggle = () => (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => setViewMode('both')}
        className={`px-3 py-1 rounded text-sm ${
          viewMode === 'both' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        Both
      </button>
      <button
        onClick={() => setViewMode('open')}
        className={`px-3 py-1 rounded text-sm ${
          viewMode === 'open' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        Open
      </button>
      <button
        onClick={() => setViewMode('closed')}
        className={`px-3 py-1 rounded text-sm ${
          viewMode === 'closed' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        Closed
      </button>
    </div>
  );

  // Legend with total amounts
  const CustomLegend = () => (
    <div className="flex justify-center mt-2 space-x-6">
      {(viewMode === 'both' || viewMode === 'open') && (
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
          <span className="text-gray-600 mr-1">Open</span>
          <span className="font-semibold">{openOpsCount}</span>
        </div>
      )}
      {(viewMode === 'both' || viewMode === 'closed') && (
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-2 bg-green-600 rounded-full"></span>
          <span className="text-gray-600 mr-1">Closed</span>
          <span className="font-semibold">{closedOpsCount}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        <ViewToggle />
      </div>
      
      <CustomLegend />
      
      <div className="mt-4" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              // Changed from formatCurrency to display integer counts
              tickFormatter={(value) => Math.round(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {(viewMode === 'both' || viewMode === 'open') && (
              <Bar 
                dataKey="Open" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                barSize={viewMode === 'both' ? 20 : 30}
                onClick={(data, index) => onBarClick({ datasetIndex: 0, index, payload: data.payload })}
              />
            )}
            {(viewMode === 'both' || viewMode === 'closed') && (
              <Bar 
                dataKey="Closed" 
                fill="#16A34A" 
                radius={[4, 4, 0, 0]} 
                barSize={viewMode === 'both' ? 20 : 30}
                onClick={(data, index) => onBarClick({ datasetIndex: 1, index, payload: data.payload })}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart04;