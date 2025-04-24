import React from 'react';
import { X } from 'lucide-react';
import OpportunityTable from './OpportunityTable';

function ChartModal({ isOpen, onClose, title, opportunities }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose} >
      {/* Modal panel */}
      <div 
        className="bg-white dark:bg-gray-800 shadow-lg  w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="flex-1 overflow-hidden p-6">
          {opportunities && opportunities.length > 0 ? (
            <OpportunityTable opportunities={opportunities} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">No opportunities found for this probability.</p>
            </div>
          )}
        </div>
        
        
      </div>
      </div>
    </div>
  );
}

export default ChartModal;