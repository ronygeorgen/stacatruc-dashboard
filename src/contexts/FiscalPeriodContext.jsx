// src/contexts/FiscalPeriodContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks, subMonths, subYears 
} from 'date-fns';

// Create the context
const FiscalPeriodContext = createContext();

// Define the provider component
export function FiscalPeriodProvider({ children }) {
  // Default period is "This Month"
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(3);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfMonth(now)
    };
  });

  // Predefined fiscal periods
  const fiscalPeriods = [
    { 
      label: "Custom Range",
      getValue: (customRange) => customRange || dateRange
    },
    { 
      label: "This Week", 
      getValue: () => {
        const now = new Date();
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 })
        };
      }
    },
    { 
      label: "Last Week", 
      getValue: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      } 
    },
    { 
      label: "This Month", 
      getValue: () => {
        const now = new Date();
        return {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
      } 
    },
    { 
      label: "Last Month", 
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      } 
    },
    { 
      label: "Last 6 Months", 
      getValue: () => {
        const now = new Date();
        return {
          from: startOfMonth(subMonths(now, 6)),
          to: endOfMonth(now)
        };
      } 
    },
    { 
      label: "This Year", 
      getValue: () => {
        const now = new Date();
        return {
          from: startOfYear(now),
          to: endOfYear(now)
        };
      } 
    },
    { 
      label: "Last Year", 
      getValue: () => {
        const lastYear = subYears(new Date(), 1);
        return {
          from: startOfYear(lastYear),
          to: endOfYear(lastYear)
        };
      } 
    }
  ];

  // Update the date range when period changes
  useEffect(() => {
    const newDateRange = fiscalPeriods[selectedPeriodIndex].getValue();
    setDateRange(newDateRange);
  }, [selectedPeriodIndex]);

  // Function to change the fiscal period
  const changePeriod = (index, customRange = null) => {
    setSelectedPeriodIndex(index);
    if (index === 0 && customRange) {
      setDateRange(customRange);
    }
  };

  return (
    <FiscalPeriodContext.Provider 
      value={{
        selectedPeriodIndex,
        dateRange,
        fiscalPeriods,
        changePeriod,
        periodLabel: fiscalPeriods[selectedPeriodIndex].label
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