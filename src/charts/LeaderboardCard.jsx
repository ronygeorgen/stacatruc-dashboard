import React, { useMemo } from 'react';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';

// Dummy data for the leaderboard
const leaderboardData = [
  { id: 1, name: "Alex Johnson", closedValue: 845000, deals: 12 },
  { id: 2, name: "Sarah Williams", closedValue: 675000, deals: 9 },
  { id: 3, name: "Miguel Hernandez", closedValue: 590000, deals: 8 },
  { id: 4, name: "Priya Patel", closedValue: 520000, deals: 7 },
  { id: 5, name: "David Chen", closedValue: 480000, deals: 6 },
  { id: 6, name: "Emma Clarke", closedValue: 420000, deals: 5 },
  { id: 7, name: "James Wilson", closedValue: 380000, deals: 4 },
  { id: 8, name: "Zoe Rodriguez", closedValue: 340000, deals: 4 },
  { id: 9, name: "Michael Thompson", closedValue: 290000, deals: 3 },
  { id: 10, name: "Olivia Taylor", closedValue: 210000, deals: 2 }
];

// Period-specific data
const weeklyLeaderboard = [
  { id: 1, name: "Sarah Williams", closedValue: 175000, deals: 3 },
  { id: 2, name: "Alex Johnson", closedValue: 145000, deals: 2 },
  { id: 3, name: "Priya Patel", closedValue: 120000, deals: 2 },
  { id: 4, name: "David Chen", closedValue: 95000, deals: 1 },
  { id: 5, name: "Miguel Hernandez", closedValue: 90000, deals: 1 }
];

const monthlyLeaderboard = [
  { id: 1, name: "Alex Johnson", closedValue: 315000, deals: 4 },
  { id: 2, name: "Sarah Williams", closedValue: 280000, deals: 3 },
  { id: 3, name: "Miguel Hernandez", closedValue: 245000, deals: 3 },
  { id: 4, name: "Priya Patel", closedValue: 210000, deals: 2 },
  { id: 5, name: "Emma Clarke", closedValue: 185000, deals: 2 }
];

const sixMonthLeaderboard = [
  { id: 1, name: "Alex Johnson", closedValue: 620000, deals: 9 },
  { id: 2, name: "Miguel Hernandez", closedValue: 540000, deals: 7 },
  { id: 3, name: "Sarah Williams", closedValue: 495000, deals: 6 },
  { id: 4, name: "Priya Patel", closedValue: 410000, deals: 5 },
  { id: 5, name: "David Chen", closedValue: 380000, deals: 5 }
];

const thisYearLeaderboard = [
  { id: 1, name: "Alex Johnson", closedValue: 845000, deals: 12 },
  { id: 2, name: "Sarah Williams", closedValue: 675000, deals: 9 },
  { id: 3, name: "Miguel Hernandez", closedValue: 590000, deals: 8 },
  { id: 4, name: "Priya Patel", closedValue: 520000, deals: 7 },
  { id: 5, name: "David Chen", closedValue: 480000, deals: 6 }
];

const lastYearLeaderboard = [
  { id: 1, name: "Sarah Williams", closedValue: 780000, deals: 10 },
  { id: 2, name: "Alex Johnson", closedValue: 720000, deals: 9 },
  { id: 3, name: "Miguel Hernandez", closedValue: 605000, deals: 8 },
  { id: 4, name: "David Chen", closedValue: 520000, deals: 6 },
  { id: 5, name: "Priya Patel", closedValue: 475000, deals: 5 }
];

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

function LeaderboardCard() {
  // Get fiscal period context
  const { periodLabel } = useFiscalPeriod();

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get leaderboard data based on selected period
  const displayData = useMemo(() => {
    if (periodLabel?.includes("Week")) {
      return weeklyLeaderboard;
    } else if (periodLabel?.includes("Month")) {
      return monthlyLeaderboard;
    } else if (periodLabel?.includes("6 Months")) {
      return sixMonthLeaderboard;
    } else if (periodLabel === "This Year") {
      return thisYearLeaderboard;
    } else if (periodLabel === "Last Year") {
      return lastYearLeaderboard;
    }
    return leaderboardData;
  }, [periodLabel]);

  // Calculate total closed value for the period
  const totalClosedValue = useMemo(() => {
    return displayData.reduce((sum, person) => sum + person.closedValue, 0);
  }, [displayData]);

  // Function to get the first initial from a person's name
  const getFirstInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-8 lg:col-span-8 xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Leaderboard</h2>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
          <span className="mr-1">{periodLabel || "All Time"}</span>
          <span className="ml-2">Total: {formatCurrency(totalClosedValue)}</span>
        </div>
      </header>
      
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
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
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
              {displayData.map((person, index) => {
                // Generate a class based on ranking
                let rankClass = "";
                if (index === 0) rankClass = "text-yellow-500 font-bold";
                else if (index === 1) rankClass = "text-gray-400 font-semibold";
                else if (index === 2) rankClass = "text-amber-700 font-semibold";
                
                // Get first initial and color for avatar
                const firstInitial = getFirstInitial(person.name);
                const bgColorClass = getColorForLetter(firstInitial);
                
                return (
                  <tr key={person.id}>
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
      </div>
    </div>
  );
}

export default LeaderboardCard;