import React, { useState, useEffect, useCallback } from 'react';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';
import OpportunityTable from '../components/OpportunityTable';
import CardDetailModal from '../components/CardDetailModal';
import { axiosInstance } from "../services/api";
import { format } from 'date-fns';

// Function to get a color based on the first letter of the name
const getColorForLetter = (letter) => {
  const colors = [
    "bg-blue-500",    // A
    "bg-red-500",     // B
    "bg-green-500",   // C
    "bg-yellow-500",  // D
    "bg-purple-500",  // E
    "bg-pink-500",    // F
    "bg-indigo-500",  // G
    "bg-teal-500",    // H
    "bg-orange-500",  // I
    "bg-cyan-500",    // J
    "bg-amber-500",   // K
    "bg-lime-500",    // L
    "bg-emerald-500", // M
    "bg-violet-500",  // N
    "bg-fuchsia-500", // O
    "bg-rose-500",    // P
    "bg-sky-500",     // Q
    "bg-blue-600",    // R
    "bg-red-600",     // S
    "bg-green-600",   // T
    "bg-yellow-600",  // U
    "bg-purple-600",  // V
    "bg-pink-600",    // W
    "bg-indigo-600",  // X
    "bg-teal-600",    // Y
    "bg-orange-600",  // Z
  ];
  
  if (!letter) return "bg-gray-500";
  
  // Convert letter to uppercase and get ASCII code
  const upperLetter = letter.toUpperCase();
  const asciiCode = upperLetter.charCodeAt(0);
  
  // A is ASCII 65, so we subtract 65 to get index 0-25
  if (asciiCode >= 65 && asciiCode <= 90) {
    return colors[asciiCode - 65];
  }
  
  // Default color if not A-Z
  return "bg-gray-500";
};

function LeaderboardCard() {
  // Get fiscal period context
  const { periodLabel, dateRange, fiscalPeriodCode } = useFiscalPeriod();
  
  // State for leaderboard data
  const [allLeaderboardData, setAllLeaderboardData] = useState([]); // Store all data
  const [leaderboardData, setLeaderboardData] = useState([]); // Store paginated data
  const [loading, setLoading] = useState(true);
  const [totalClosedValue, setTotalClosedValue] = useState(0);
  
  // State for leaderboard pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  
  // State for modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // State for modal pagination and data
  const [modalOpportunities, setModalOpportunities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalTotalCount, setModalTotalCount] = useState(0);
  const [modalPageSize] = useState(10);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Fetch dashboard data from the API
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = '/opportunity_dash';
      let params = {};
      
      // Apply fiscal period filter if available, otherwise use date range if available
      if (fiscalPeriodCode) {
        params.fiscal_period = fiscalPeriodCode;
      } else if (dateRange && dateRange.from) {
        params.from_date = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange.to) {
          params.to_date = format(dateRange.to, 'yyyy-MM-dd');
        }
      }
      
      const response = await axiosInstance.get(url, { params });
      
      if (response.data && response.data.assigned_user_stats) {
        // Transform and sort the data by total_value in descending order
        const transformedData = response.data.assigned_user_stats
          .sort((a, b) => b.total_value - a.total_value)
          .map((user, index) => ({
            id: user.user_id || `user-${index}`,
            name: user.user_name || 'Unknown User',
            closedValue: user.total_value || 0,
            deals: user.total_opps || 0,
            rank: index + 1 // Add ranking
          }));
        
        // Store all data
        setAllLeaderboardData(transformedData);
        
        // Calculate total value from all users
        const total = transformedData.reduce((sum, user) => sum + user.closedValue, 0);
        setTotalClosedValue(total);
        
        // Apply initial pagination
        updatePageData(transformedData, 1);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setAllLeaderboardData([]);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, fiscalPeriodCode]);

  // Function to update the paginated data
  const updatePageData = (data, page) => {
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);
    setLeaderboardData(paginatedData);
    setCurrentPage(page);
  };

  // Handle pagination in the leaderboard
  const handlePageChange = (page) => {
    updatePageData(allLeaderboardData, page);
  };

  // Fetch opportunities for a specific user
  const fetchUserOpportunities = useCallback(async (user, page = 1) => {
    if (!user) return;
    
    try {
      setModalLoading(true);
      
      let url = '/opportunities/';
      let params = {
        assigned_to: user.id,
        page: page,
        page_size: modalPageSize
      };
      
      // Apply fiscal period filter if available, otherwise use date range if available
      if (fiscalPeriodCode) {
        params.fiscal_period = fiscalPeriodCode;
      } else if (dateRange && dateRange.from) {
        params.from_date = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange.to) {
          params.to_date = format(dateRange.to, 'yyyy-MM-dd');
        }
      }
      
      const response = await axiosInstance.get(url, { params });
      
      setModalOpportunities(response.data.results || []);
      setModalTotalCount(response.data.count || 0);
      setModalCurrentPage(page);
    } catch (error) {
      console.error('Error fetching user opportunities:', error);
      setModalOpportunities([]);
      setModalTotalCount(0);
    } finally {
      setModalLoading(false);
    }
  }, [dateRange, fiscalPeriodCode, modalPageSize]);

  // Initial data fetch
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Handle user row click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    fetchUserOpportunities(user, 1); // Reset to first page when opening modal
  };

  // Handle pagination in the modal
  const handleModalPageChange = (page) => {
    fetchUserOpportunities(selectedUser, page);
  };

  // Calculate total number of pages for pagination
  const totalPages = Math.ceil(allLeaderboardData.length / pageSize);

  return (
    <>
      <div className="flex flex-col col-span-full sm:col-span-8 lg:col-span-8 xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Leaderboard</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
            <span className="mr-1">{periodLabel || "All Time"}</span>
            <span className="ml-2">Total: {formatCurrency(totalClosedValue)}</span>
          </div>
        </header>
        
        <div className="p-3">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
              No closed opportunities for this period
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">#</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Sales Rep</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-right">Closed Value</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-center">Deals</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboardData.map((person) => {
                      // Generate a class based on ranking
                      let rankClass = "";
                      if (person.rank === 1) rankClass = "text-yellow-500 font-bold";
                      else if (person.rank === 2) rankClass = "text-gray-400 font-semibold";
                      else if (person.rank === 3) rankClass = "text-amber-700 font-semibold";
                      
                      // Get first initial for avatar
                      const firstInitial = person.name ? person.name.charAt(0) : '?';
                      const bgColorClass = getColorForLetter(firstInitial);
                      
                      return (
                        <tr 
                          key={person.id} 
                          onClick={() => handleUserClick(person)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <td className="p-2 whitespace-nowrap">
                            <div className={`text-center ${rankClass}`}>{person.rank}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              {/* First initial avatar */}
                              <div className={`w-8 h-8 mr-2 flex-shrink-0 rounded-full ${bgColorClass} flex items-center justify-center text-white font-medium`}>
                                {firstInitial}
                              </div>
                              <div className="font-medium text-gray-800 dark:text-gray-100">{person.name}</div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-right font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(person.closedValue)}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-center font-medium text-gray-800 dark:text-gray-200">{person.deals}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination for Leaderboard */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-1">
                  {/* First page button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    &laquo;
                  </button>
                  
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    &lsaquo;
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Calculate page number based on current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    // Only render if pageNum is valid
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    &rsaquo;
                  </button>
                  
                  {/* Last page button */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for user details */}
      <CardDetailModal
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={selectedUser ? `${selectedUser.name} Opportunities - ${periodLabel}` : ''}
      >
        <OpportunityTable
          opportunities={modalOpportunities}
          currentPage={modalCurrentPage}
          totalCount={modalTotalCount}
          onPageChange={handleModalPageChange}
          loading={modalLoading}
        />
      </CardDetailModal>
    </>
  );
}

export default LeaderboardCard;