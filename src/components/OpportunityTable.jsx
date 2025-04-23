import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function OpportunityTable({ opportunities }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const tableContainerRef = useRef(null);

  // Update scroll metrics when component mounts or window resizes
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const updateScrollMetrics = () => {
      setMaxScroll(container.scrollWidth - container.clientWidth);
    };

    // Initial calculation
    updateScrollMetrics();
    
    // Listen for resize events
    window.addEventListener('resize', updateScrollMetrics);
    
    return () => window.removeEventListener('resize', updateScrollMetrics);
  }, [opportunities]);

  // Track scroll position
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition(container.scrollLeft);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Calculate if we can scroll in either direction
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = maxScroll > 0 && scrollPosition < maxScroll;

  return (
    <div className="relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg ">
      {/* Professional scroll indicator bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Opportunities ({opportunities.length})
        </div>
        
        {/* Scroll controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`p-1 rounded ${
              canScrollLeft 
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' 
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ArrowLeft size={16} />
          </button>
          
          {/* Visual scroll indicator */}
          <div className="w-32 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            {maxScroll > 0 && (
              <div 
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                style={{ 
                  width: `${(scrollPosition / maxScroll) * 100}%`,
                  minWidth: '10%'
                }}
              />
            )}
          </div>
          
          <button 
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`p-1 rounded ${
              canScrollRight 
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' 
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Table container with both horizontal and vertical scrolling */}
      <div 
        ref={tableContainerRef} 
        className="overflow-x-auto overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        {/* Main table container with fixed header */}
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Sticky header that scrolls horizontally but stays fixed vertically */}
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-20">
            <tr>
              {/* Fixed columns with separate design */}
              <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                Account Name
              </th>
              <th className="sticky left-40 z-30 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                Customer Name
              </th>

              {/* Scrollable columns */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opportunity Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Probability</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age (days)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Closing Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Steps</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {opportunities.map((opportunity, index) => {
              const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
              const fixedBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';

              return (
                <tr key={index} className={rowBg}>
                  {/* Fixed cells with distinct design */}
                  <td className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${fixedBg} border-r border-gray-200 dark:border-gray-700`}>
                    {opportunity.accountName}
                  </td>
                  <td className={`sticky left-40 z-10 px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${fixedBg} border-r border-gray-200 dark:border-gray-700`}>
                    {opportunity.customerName}
                  </td>

                  {/* Scrollable cells */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.contact}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.opportunityName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.stage}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        opportunity.probability === '90%' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                        opportunity.probability === '75%' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                        opportunity.probability === '50%' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {opportunity.probability}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.age}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.closingDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{opportunity.createdDate}</td>
                  <td className="px-4 py-3 whitespace-wrap text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                    <div className="flex items-center">
                      <span className="mr-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                        {opportunity.nextStep}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Floating scroll indicator for mobile/smaller screens */}
      <div className="lg:hidden fixed bottom-4 right-4 flex space-x-2 bg-gray-800/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg">
        <button 
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`p-1 rounded-full ${!canScrollLeft ? 'opacity-50' : 'hover:bg-gray-700'}`}
        >
          <ArrowLeft size={16} />
        </button>
        <button 
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`p-1 rounded-full ${!canScrollRight ? 'opacity-50' : 'hover:bg-gray-700'}`}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default OpportunityTable;