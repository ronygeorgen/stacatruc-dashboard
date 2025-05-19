import React, { useState, useEffect, useRef } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function OpportunityTable({ 
  opportunities, 
  totalCount, 
  currentPage, 
  onPageChange, 
  loading, 
  onDateFilterChange, 
  onEstimatedClosingDateFilterChange,
  onEstimatedDeliveryDateFilterChange,
  onUpdateFilterChange,
  onDownloadCSV,
}) {
  const fixedTableRef = useRef(null);
  const scrollableTableRef = useRef(null);
  const [rowHeights, setRowHeights] = useState([]);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [estimatedClosingStartDate, setEstimatedClosingStartDate] = useState(null);
  const [estimatedClosingEndDate, setEstimatedClosingEndDate] = useState(null);
  const [estimatedDeliveryStartDate, setEstimatedDeliveryStartDate] = useState(null);
  const [estimatedDeliveryEndDate, setEstimatedDeliveryEndDate] = useState(null);
  const [updateStartDate, setUpdateStartDate] = useState(null);
  const [updateEndDate, setUpdateEndDate] = useState(null);
  const [showUpdateDatePicker, setShowUpdateDatePicker] = useState(false);
  const [showEstimatedClosingDatePicker, setShowEstimatedClosingDatePicker] = useState(false);
  const [showEstimatedDeliveryDatePicker, setShowEstimatedDeliveryDatePicker] = useState(false);

  // Stacatruc color palette
  const stacatrucColors = {
    green: '#36A501',
    darkGrey: '#474747',
    lightGrey: '#E4E4E4',
    medGrey: '#707070',
    clarkGreen: '#BCD230',
    blue: '#3985AE',
  };
  
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

 // Handle date filter changes
const handleDateChange = (dates) => {
  const [start, end] = dates;
  setStartDate(start);
  setEndDate(end);
  
  if (start && end) {
    // Format dates for API
    const formattedStartDate = format(start, 'yyyy-MM-dd');
    const formattedEndDate = format(end, 'yyyy-MM-dd');
    
    // Call parent component's filter handler
    onDateFilterChange(formattedStartDate, formattedEndDate);
    setShowDatePicker(false);
  }
};

// Add these new handler functions:
const handleEstimatedClosingDateChange = (dates) => {
  const [start, end] = dates;
  setEstimatedClosingStartDate(start);
  setEstimatedClosingEndDate(end);
  
  if (start && end) {
    const formattedStartDate = format(start, 'yyyy-MM-dd');
    const formattedEndDate = format(end, 'yyyy-MM-dd');
    
    onEstimatedClosingDateFilterChange(formattedStartDate, formattedEndDate);
    setShowEstimatedClosingDatePicker(false);
  }
};

const handleEstimatedDeliveryDateChange = (dates) => {
  const [start, end] = dates;
  setEstimatedDeliveryStartDate(start);
  setEstimatedDeliveryEndDate(end);
  
  if (start && end) {
    const formattedStartDate = format(start, 'yyyy-MM-dd');
    const formattedEndDate = format(end, 'yyyy-MM-dd');
    
    onEstimatedDeliveryDateFilterChange(formattedStartDate, formattedEndDate);
    setShowEstimatedDeliveryDatePicker(false);
  }
};


const handleUpdateChange = (dates) => {
  const [start, end] = dates;
  setUpdateStartDate(start);
  setUpdateEndDate(end);
  
  if (start && end) {
    const formattedStartDate = format(start, 'yyyy-MM-dd');
    const formattedEndDate = format(end, 'yyyy-MM-dd');
    
    onUpdateFilterChange(formattedStartDate, formattedEndDate);
    setShowUpdateDatePicker(false);
  }
};


  // Toggle date picker visibility
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

   // Add toggle functions:
  const toggleEstimatedClosingDatePicker = () => {
    setShowEstimatedClosingDatePicker(!showEstimatedClosingDatePicker);
  };

  const toggleEstimatedDeliveryDatePicker = () => {
    setShowEstimatedDeliveryDatePicker(!showEstimatedDeliveryDatePicker);
  };
  
  const toggleUpdateDatePicker = () => {
    setShowUpdateDatePicker(!showUpdateDatePicker);
  };

  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Calculate age in days
  const calculateAge = (createdDate) => {
    if (!createdDate) return 'N/A';
    try {
      const created = new Date(createdDate);
      const today = new Date();
      const diffTime = Math.abs(today - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    } catch (error) {
      return 'N/A';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '£0.00';
    try {
      const numValue = parseFloat(value);
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numValue);
    } catch (error) {
      return '£0.00';
    }
  };
  
  // Extract name from nested object
  const getFullName = (contact) => {
    if (!contact) return 'N/A';
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'N/A';
  };

  // Get email and phone from contact
  const getContactDetails = (contact) => {
    if (!contact) return { email: 'N/A', phone: 'N/A' };
    return {
      email: contact.email || 'N/A',
      phone: contact.phone || 'N/A'
    };
  };

  // Modified getProbabilityBgColor function
  const getProbabilityBgColor = (probabilityStr) => {
    // Extract just the percentage value
    const cleanPercentage = probabilityStr?.trim()?.match(/(\d+)%/)?.[1];
    
    if (!cleanPercentage) return darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700';
    
    // Map percentage to appropriate Tailwind color classes
    switch (cleanPercentage) {
      case '25':
        return darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'; // Dark Grey
      case '50':
        return darkMode ? 'bg-orange-200 text-green-800' : 'bg-orange-200 text-green-800'; // Clark Green 
      case '75':
        return darkMode ? 'bg-blue-200 text-blue-800' : 'bg-blue-200 text-blue-800'; // Blue
      case '90':
        return darkMode ? 'bg-green-500 text-white' : 'bg-green-500 text-white'; // Green
      default:
        return darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700';
    }
  };

  // Format probability display
  const formatProbability = (probabilityStr) => {
    // Extract just the percentage value
    const cleanPercentage = probabilityStr?.trim()?.match(/(\d+)%/)?.[1];
    
    if (!cleanPercentage) return 'N/A';
    return `${cleanPercentage}%`;
  };



// Update the getActiveFilterClasses function to handle multiple date filters:
  const getActiveFilterClasses = (dateType) => {
    switch(dateType) {
      case 'created':
        return startDate && endDate ? 
          'text-blue-500 dark:text-blue-400 font-semibold' : 
          'text-gray-500 dark:text-gray-400';
      case 'estimatedClosing':
        return estimatedClosingStartDate && estimatedClosingEndDate ? 
          'text-blue-500 dark:text-blue-400 font-semibold' : 
          'text-gray-500 dark:text-gray-400';
      case 'estimatedDelivery':
        return estimatedDeliveryStartDate && estimatedDeliveryEndDate ? 
          'text-blue-500 dark:text-blue-400 font-semibold' : 
          'text-gray-500 dark:text-gray-400';
      case 'updated-date':
        return updateStartDate && updateEndDate ? 
          'text-blue-500 dark:text-blue-400 font-semibold' : 
          'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header with Pagination */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Opportunities ({totalCount || opportunities.length})
        </div>
        <div className="flex items-center space-x-4">
          {/* Download button */}
          <button
            onClick={onDownloadCSV}
            disabled={loading || opportunities.length === 0}
            className="inline-flex items-center justify-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </div>
        {/* Pagination controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            aria-label="First page"
          >
            <span className="sr-only">First page</span>
            <span className="text-xs">«</span>
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            aria-label="Previous page"
          >
            <span className="sr-only">Previous page</span>
            <span className="text-xs">&lt;</span>
          </button>
          
          {/* Page numbers - dynamic based on current page */}
          {Array.from({ length: 5 }, (_, i) => {
            // Calculate page numbers to display (center current page when possible)
            const totalPages = Math.ceil(totalCount / 10);
            let startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(startPage + 4, totalPages);
            
            if (endPage - startPage < 4) {
              startPage = Math.max(1, endPage - 4);
            }
            
            const pageNum = startPage + i;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className={`inline-flex items-center justify-center w-8 h-8 rounded border ${
                  pageNum === currentPage
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          }).filter(Boolean)}
          
          {/* More indicator if needed */}
          {Math.ceil(totalCount / 10) > 5 && currentPage < Math.ceil(totalCount / 10) - 2 && (
            <span className="inline-flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400">
              ...
            </span>
          )}
          
          {/* Last page number if not shown in the sequence */}
          {Math.ceil(totalCount / 10) > 5 && currentPage < Math.ceil(totalCount / 10) - 2 && (
            <button
              onClick={() => onPageChange(Math.ceil(totalCount / 10))}
              disabled={loading}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              aria-label={`Page ${Math.ceil(totalCount / 10)}`}
            >
              {Math.ceil(totalCount / 10)}
            </button>
          )}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalCount / 10) || loading}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            aria-label="Next page"
          >
            <span className="sr-only">Next page</span>
            <span className="text-xs">&gt;</span>
          </button>
          <button
            onClick={() => onPageChange(Math.ceil(totalCount / 10))}
            disabled={currentPage === Math.ceil(totalCount / 10) || loading}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            aria-label="Last page"
          >
            <span className="sr-only">Last page</span>
            <span className="text-xs">»</span>
          </button>
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
                  Company Name
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
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                    No opportunities found
                  </td>
                </tr>
              ) : (
                opportunities.map((opportunity, index) => {
                  const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
                  
                  return (
                    <tr 
                      key={`fixed-${opportunity.ghl_id}`} 
                      className={rowBg}
                      style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
                    >
                      <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[160px]`}>
                        {opportunity.assigned_to?.first_name || 'N/A'} {opportunity.assigned_to?.last_name || ''}
                      </td>
                      <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[160px]`}>
                        {getFullName(opportunity.contact)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[180px]`}>
                        {opportunity.name || 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[200px] whitespace-nowrap">Pipeline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[200px] whitespace-nowrap">Next Step</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[200px] whitespace-nowrap">Closing Probability</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px] whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px] whitespace-nowrap">Age (days)</th>
                <th className="relative px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-[200px] whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`cursor-pointer ${getActiveFilterClasses('estimatedClosing')}`} onClick={toggleEstimatedClosingDatePicker}>
                      Estimated Closing Date {estimatedClosingStartDate && estimatedClosingEndDate && '🔍'}
                    </span>
                  </div>
                  {showEstimatedClosingDatePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                      <DatePicker
                        selected={estimatedClosingStartDate}
                        onChange={handleEstimatedClosingDateChange}
                        startDate={estimatedClosingStartDate}
                        endDate={estimatedClosingEndDate}
                        selectsRange
                        inline
                        className="bg-white dark:bg-gray-800 border-none"
                      />
                      <div className="flex justify-between mt-2">
                        <button 
                          className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          onClick={() => {
                            setEstimatedClosingStartDate(null);
                            setEstimatedClosingEndDate(null);
                            onEstimatedClosingDateFilterChange(null, null);
                            setShowEstimatedClosingDatePicker(false);
                          }}
                        >
                          Clear
                        </button>
                        <button 
                          className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => setShowEstimatedClosingDatePicker(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </th>
                <th className="relative px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-[200px] whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`cursor-pointer ${getActiveFilterClasses('estimatedDelivery')}`} onClick={toggleEstimatedDeliveryDatePicker}>
                        Estimated Delivery Date {estimatedDeliveryStartDate && estimatedDeliveryEndDate && '🔍'}
                      </span>
                    </div>
                    {showEstimatedDeliveryDatePicker && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                        <DatePicker
                          selected={estimatedDeliveryStartDate}
                          onChange={handleEstimatedDeliveryDateChange}
                          startDate={estimatedDeliveryStartDate}
                          endDate={estimatedDeliveryEndDate}
                          selectsRange
                          inline
                          className="bg-white dark:bg-gray-800 border-none"
                        />
                        <div className="flex justify-between mt-2">
                          <button 
                            className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={() => {
                              setEstimatedDeliveryStartDate(null);
                              setEstimatedDeliveryEndDate(null);
                              onEstimatedDeliveryDateFilterChange(null, null);
                              setShowEstimatedDeliveryDatePicker(false);
                            }}
                          >
                            Clear
                          </button>
                          <button 
                            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => setShowEstimatedDeliveryDatePicker(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </th>
                <th className="relative px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-[120px] whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`cursor-pointer ${getActiveFilterClasses('created')}`} onClick={toggleDatePicker}>
                      Created Date {startDate && endDate && '🔍'}
                    </span>
                  </div>
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        className="bg-white dark:bg-gray-800 border-none"
                      />
                      <div className="flex justify-between mt-2">
                        <button 
                          className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          onClick={() => {
                            setStartDate(null);
                            setEndDate(null);
                            onDateFilterChange(null, null);
                            setShowDatePicker(false);
                          }}
                        >
                          Clear
                        </button>
                        <button 
                          className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => setShowDatePicker(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </th>
                <th className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">
                  <div className="flex items-center">
                      <span className={`cursor-pointer ${getActiveFilterClasses('updated-date')}`} onClick={toggleUpdateDatePicker}>
                        Updated Date {updateStartDate && updateEndDate && '🔍'}
                      </span>
                    </div>
                    {showUpdateDatePicker  && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                        <DatePicker
                          selected={updateStartDate}
                          onChange={handleUpdateChange}
                          startDate={updateStartDate}
                          endDate={updateEndDate}
                          selectsRange
                          inline
                          className="bg-white dark:bg-gray-800 border-none"
                        />
                        <div className="flex justify-between mt-2">
                          <button 
                            className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={() => {
                              setUpdateStartDate(null);
                              setUpdateEndDate(null);
                              onUpdateFilterChange(null, null);
                              setShowUpdateDatePicker(false);
                            }}
                          >
                            Clear
                          </button>
                          <button 
                            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => setShowUpdateDatePicker(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                    No opportunities found
                  </td>
                </tr>
              ) : (
                opportunities.map((opportunity, index) => {
                  const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
                  const contactDetails = getContactDetails(opportunity.contact);
                  
                  return (
                    <tr 
                      key={`scrollable-${opportunity.ghl_id}`} 
                      className={rowBg}
                      style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[180px]">
                        <div>
                          <div>{contactDetails.email}</div>
                          <div>{contactDetails.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-[100px]">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-700 dark:text-green-300">
                          {opportunity.pipeline?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-[100px]">
                        <span className="px-2 py-1 text-xs font-medium rounded-full  text-gray-900 dark:text-gray-100">
                          {opportunity.next_step?.name || 'N/A'}
                        </span>
                      </td> 
                      <td className="px-4 py-3 w-[100px]">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProbabilityBgColor(opportunity.custom_fields?.chances_of_closing_the_deal)}`}>
                          {formatProbability(opportunity.custom_fields?.chances_of_closing_the_deal) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                        {opportunity.stage.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[150px]">
                        <div className="flex items-center">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                            {opportunity.status || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[100px]">
                        {calculateAge(opportunity.created_at)}
                      </td>

                      {/* new columns */}
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                        {formatDate(opportunity.custom_fields.estimated_closing_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                        {formatDate(opportunity.custom_fields.estimated_delivery_date)}
                      </td>

                      
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                        {formatDate(opportunity.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 w-[120px]">
                        {formatDate(opportunity.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400 w-[120px]">
                        {formatCurrency(opportunity.opp_value)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OpportunityTable;