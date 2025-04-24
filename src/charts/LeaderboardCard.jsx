import React, { useState, useMemo } from 'react';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';
import OpportunityTable from '../components/OpportunityTable';
import { closedOpportunities } from '../utils/DummyData';

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

// User Detail Modal Component
function UserDetailModal({ isOpen, onClose, user, opportunities }) {
  const modalRef = React.useRef(null);
  
  // Close modal when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !user) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm "></div>
      
      {/* Modal container */}
      <div 
        ref={modalRef} 
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${getColorForLetter(user.name[0])} flex items-center justify-center text-white font-medium text-lg`}>
              {user.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {user.name}'s Opportunities
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.deals} deals · {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(user.closedValue)} closed
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Modal body with scrolling */}
        <div className="flex-1 overflow-y-auto p-4">
          <OpportunityTable opportunities={opportunities} />
        </div>
      </div>
    </div>
  );
}

function LeaderboardCard() {
  // Get fiscal period context
  const { periodLabel, periodStart, periodEnd } = useFiscalPeriod();
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Helper function to extract amount from opportunity
  const extractAmount = (opportunity) => {
    // Check different possible property names for the amount
    let amount = 0;
    
    try {
      // Try different potential field names for the amount
      if (opportunity.amount) {
        if (typeof opportunity.amount === 'string') {
          // Remove $ and , characters and convert to number
          amount = parseFloat(opportunity.amount.replace(/[$,]/g, ''));
        } else if (typeof opportunity.amount === 'number') {
          amount = opportunity.amount;
        }
      } else if (opportunity.value) {
        if (typeof opportunity.value === 'string') {
          amount = parseFloat(opportunity.value.replace(/[$,]/g, ''));
        } else if (typeof opportunity.value === 'number') {
          amount = opportunity.value;
        }
      } else if (opportunity.opportunityValue) {
        if (typeof opportunity.opportunityValue === 'string') {
          amount = parseFloat(opportunity.opportunityValue.replace(/[$,]/g, ''));
        } else if (typeof opportunity.opportunityValue === 'number') {
          amount = opportunity.opportunityValue;
        }
      }
      
      // If amount could not be parsed, return 0
      if (isNaN(amount)) {
        console.warn('Could not parse amount for opportunity:', opportunity);
        return 0;
      }
      
      return amount;
    } catch (error) {
      console.error('Error extracting amount from opportunity:', error);
      return 0;
    }
  };
  
  // Helper function to extract rep name from opportunity
  const extractRepName = (opportunity) => {
    try {
      // If there's a dedicated sales rep field, use that
      if (opportunity.salesRep) {
        return opportunity.salesRep;
      }
      
      // Otherwise try to extract from customer name (assuming format like "Rep Name - Company")
      if (opportunity.customerName) {
        // Check if it contains a hyphen
        if (opportunity.customerName.includes(' - ')) {
          const parts = opportunity.customerName.split(' - ');
          return parts[0].trim();
        }
        
        // If no hyphen, just use the full customer name
        return opportunity.customerName;
      }
      
      // If no customer name, try account name
      if (opportunity.accountName) {
        return opportunity.accountName;
      }
      
      // Default fallback
      return "Unknown Rep";
    } catch (error) {
      console.error('Error extracting rep name:', error);
      return "Unknown Rep";
    }
  };
  
  // Process closed opportunities to create leaderboard data
  const processedData = useMemo(() => {
    if (!closedOpportunities || !Array.isArray(closedOpportunities)) {
      console.error('closedOpportunities is not an array:', closedOpportunities);
      return [];
    }
    
    try {
      // Step 1: Filter opportunities by date range based on fiscal period
      let filteredOpportunities = [...closedOpportunities];
      
      if (periodStart && periodEnd) {
        filteredOpportunities = closedOpportunities.filter(opp => {
          try {
            if (!opp.closingDate) return false;
            const closingDate = new Date(opp.closingDate);
            return closingDate >= periodStart && closingDate <= periodEnd;
          } catch (error) {
            console.warn('Error filtering by date:', error);
            return false;
          }
        });
      }
      
      // Step 2: Group opportunities by sales rep
      const salesRepMap = new Map();
      
      filteredOpportunities.forEach(opp => {
        if (!opp) return;
        
        // Extract sales rep name
        const repName = extractRepName(opp);
        
        // Extract amount
        const amount = extractAmount(opp);
        
        if (salesRepMap.has(repName)) {
          const existing = salesRepMap.get(repName);
          salesRepMap.set(repName, {
            name: repName,
            closedValue: existing.closedValue + amount,
            deals: existing.deals + 1,
            opportunities: [...existing.opportunities, opp]
          });
        } else {
          salesRepMap.set(repName, {
            name: repName,
            closedValue: amount,
            deals: 1,
            opportunities: [opp]
          });
        }
      });
      
      // Step 3: Convert map to array and sort by closed value
      return Array.from(salesRepMap.values())
        .sort((a, b) => b.closedValue - a.closedValue)
        .map((item, index) => ({
          id: index + 1,
          ...item
        }));
    } catch (error) {
      console.error('Error processing leaderboard data:', error);
      return [];
    }
  }, [periodStart, periodEnd]);
  
  // Calculate total closed value
  const totalClosedValue = useMemo(() => {
    return processedData.reduce((sum, person) => sum + person.closedValue, 0);
  }, [processedData]);

  // Filter opportunities for the selected user
  const userOpportunities = useMemo(() => {
    if (!selectedUser) return [];
    return selectedUser.opportunities || [];
  }, [selectedUser]);

  // Handle user row click
  const handleUserClick = (person) => {
    setSelectedUser(person);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col col-span-full sm:col-span-8 lg:col-span-8 xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs  rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Leaderboard</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
            <span className="mr-1">{periodLabel || "All Time"}</span>
            <span className="ml-2">Total: {formatCurrency(totalClosedValue)}</span>
          </div>
        </header>
        
        <div className="p-3">
          {processedData.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
              No closed opportunities for this period
            </div>
          ) : (
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
                  {processedData.map((person, index) => {
                    // Generate a class based on ranking
                    let rankClass = "";
                    if (index === 0) rankClass = "text-yellow-500 font-bold";
                    else if (index === 1) rankClass = "text-gray-400 font-semibold";
                    else if (index === 2) rankClass = "text-amber-700 font-semibold";
                    
                    // Get first initial for avatar
                    const firstInitial = person.name.charAt(0).toUpperCase();
                    const bgColorClass = getColorForLetter(firstInitial);
                    
                    return (
                      <tr 
                        key={person.id} 
                        onClick={() => handleUserClick(person)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <td className="p-2 whitespace-nowrap">
                          <div className={`text-center ${rankClass}`}>{index + 1}</div>
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
          )}
        </div>
      </div>

      {/* Modal for user details */}
      <UserDetailModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        opportunities={userOpportunities}
      />
    </>
  );
}

export default LeaderboardCard;