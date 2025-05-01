// src/contexts/FiscalPeriodContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks, subMonths, subYears,
  setMonth, setDate
} from 'date-fns';

// Create the context
const FiscalPeriodContext = createContext();

// Define the provider component
export function FiscalPeriodProvider({ children }) {
  // Default period is "All Opportunities" (index 0)
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [dateRange, setDateRange] = useState(null);
  
  // Track the selected fiscal period code for API calls
  const [fiscalPeriodCode, setFiscalPeriodCode] = useState(null);

  // Function to get current fiscal year
  const getCurrentFiscalYear = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based (January is 0)
    
    // If we're in Nov-Jan (months 10-0), we're in the next fiscal year
    if (currentMonth >= 10 || currentMonth === 0) {
      return currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    }
    
    return now.getFullYear() - 1;
  };

  // Get fiscal year for display
  const fiscalYear = getCurrentFiscalYear();
  const nextFiscalYear = fiscalYear + 1;

  // Predefined fiscal periods
  const fiscalPeriods = [
    { 
      label: "All Opportunities",
      getValue: () => null,
      code: null
    },
    // Fiscal Quarters
    { 
      label: `Q1 (Feb - Apr)`, 
      getValue: () => {
        const year = fiscalYear + 1;
        return {
          from: new Date(year, 1, 1), // Feb 1st
          to: new Date(year, 3, 30)   // Apr 30th
        };
      },
      code: "Q1"
    },
    { 
      label: `Q2 (May - Jul)`, 
      getValue: () => {
        const year = fiscalYear + 1;
        return {
          from: new Date(year, 4, 1),  // May 1st
          to: new Date(year, 6, 31)    // Jul 31st
        };
      },
      code: "Q2"
    },
    { 
      label: `Q3 (Aug - Oct)`, 
      getValue: () => {
        const year = fiscalYear + 1;
        return {
          from: new Date(year, 7, 1),  // Aug 1st
          to: new Date(year, 9, 31)    // Oct 31st
        };
      },
      code: "Q3"
    },
    { 
      label: `Q4 (Nov - Jan)`, 
      getValue: () => {
        return {
          from: new Date(fiscalYear, 10, 1),     // Nov 1st of fiscal year
          to: new Date(fiscalYear + 1, 0, 31)    // Jan 31st of next calendar year
        };
      },
      code: "Q4"
    },
    
  ];

  // Update the date range when period changes
  useEffect(() => {
    const period = fiscalPeriods[selectedPeriodIndex];
    const newDateRange = period.getValue();
    setDateRange(newDateRange);
    setFiscalPeriodCode(period.code);
  }, [selectedPeriodIndex]);

  // Function to change the fiscal period
  const changePeriod = (index, customRange = null) => {
    setSelectedPeriodIndex(index);
    if (index === 0 && customRange) {
      setDateRange(customRange);
      setFiscalPeriodCode(null);
    }
  };

  return (
    <FiscalPeriodContext.Provider 
      value={{
        selectedPeriodIndex,
        dateRange,
        fiscalPeriods,
        changePeriod,
        periodLabel: fiscalPeriods[selectedPeriodIndex].label,
        fiscalPeriodCode
      }}
    >
      {children}
    </FiscalPeriodContext.Provider>
  );
}

// Custom hook to use the fiscal period context
export function useFiscalPeriod() {
  const context = useContext(FiscalPeriodContext);
  if (context === undefined) {
    throw new Error('useFiscalPeriod must be used within a FiscalPeriodProvider');
  }
  return context;
}