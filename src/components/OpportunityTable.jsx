import React, { useState, useEffect, useRef } from 'react';

function OpportunityTable({ opportunities }) {
  const fixedTableRef = useRef(null);
  const scrollableTableRef = useRef(null);
  const [rowHeights, setRowHeights] = useState([]);

  // Synchronize vertical scroll between tables
  useEffect(() => {
    const fixedTable = fixedTableRef.current;
    const scrollableTable = scrollableTableRef.current;
    
    if (!fixedTable || !scrollableTable) return;

    const handleFixedTableScroll = () => {
      // Sync scrollable table with fixed table's vertical scroll
      scrollableTable.scrollTop = fixedTable.scrollTop;
    };
    
    const handleScrollableTableScroll = () => {
      // Sync fixed table with scrollable table's vertical scroll
      fixedTable.scrollTop = scrollableTable.scrollTop;
    };
    
    fixedTable.addEventListener('scroll', handleFixedTableScroll);
    scrollableTable.addEventListener('scroll', handleScrollableTableScroll);
    
    return () => {
      fixedTable.removeEventListener('scroll', handleFixedTableScroll);
      scrollableTable.removeEventListener('scroll', handleScrollableTableScroll);
    };
  }, []);

  // Synchronize row heights between tables
  useEffect(() => {
    const syncRowHeights = () => {
      const fixedRows = fixedTableRef.current?.querySelectorAll('tbody tr');
      const scrollableRows = scrollableTableRef.current?.querySelectorAll('tbody tr');
      
      if (!fixedRows || !scrollableRows || fixedRows.length !== scrollableRows.length) return;
      
      const newRowHeights = [];
      
      // Calculate heights for each row
      for (let i = 0; i < fixedRows.length; i++) {
        const fixedRowHeight = fixedRows[i].offsetHeight;
        const scrollableRowHeight = scrollableRows[i].offsetHeight;
        const maxHeight = Math.max(fixedRowHeight, scrollableRowHeight);
        newRowHeights.push(maxHeight);
      }
      
      setRowHeights(newRowHeights);
    };
    
    syncRowHeights();
    
    // Re-sync on window resize
    window.addEventListener('resize', syncRowHeights);
    return () => window.removeEventListener('resize', syncRowHeights);
  }, [opportunities]);

  return (
    <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Opportunities ({opportunities.length})
        </div>
      </div>

      {/* Tables container with a flexbox layout */}
      <div className="flex max-h-[70vh]">
        {/* Left fixed table */}
        <div 
          ref={fixedTableRef}
          className="overflow-y-scroll scrollbar-none border-r border-gray-200 dark:border-gray-700"
          style={{ width: '500px', flexShrink: 0 }}
        >
          <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            {/* Fixed table header */}
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[160px] whitespace-nowrap">
                  Account Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[160px] whitespace-nowrap">
                  Customer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[180px] whitespace-nowrap">
                  Opportunity Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {opportunities.map((opportunity, index) => {
                const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
                
                return (
                  <tr 
                    key={`fixed-${index}`} 
                    className={rowBg}
                    style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
                  >
                    <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[160px]`}>
                      {opportunity.accountName}
                    </td>
                    <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[160px]`}>
                      {opportunity.customerName}
                    </td>
                    <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[180px]`}>
                      {opportunity.opportunityName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Right table */}
        <div 
          ref={scrollableTableRef}
          className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            {/* Right table header */}
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[250px] whitespace-nowrap">Contact Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px] whitespace-nowrap">Next Steps</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px] whitespace-nowrap">Probability</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px] whitespace-nowrap">Age (days)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Closing Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {opportunities.map((opportunity, index) => {
                const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
                
                return (
                  <tr 
                    key={`scrollable-${index}`} 
                    className={rowBg}
                    style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[180px]">
                      {opportunity.contact}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                      {opportunity.stage}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[150px]">
                      <div className="flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                          {opportunity.nextStep}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-[100px]">
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
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[100px]">
                      {opportunity.age}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                      {opportunity.createdDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                      {opportunity.closingDate}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400 w-[120px]">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(opportunity.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OpportunityTable;