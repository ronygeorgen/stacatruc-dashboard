"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from "date-fns"

import { cn } from "../lib/utils"
import { Calendar } from "./ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

export default function DatePicker({
  className,
}) {
  const [date, setDate] = React.useState({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })
  
  const [isOpen, setIsOpen] = React.useState(false)

  // Predefined fiscal periods
  const fiscalPeriods = [
    { 
      label: "Custom Range",
      getValue: () => date
    },
    { 
      label: "This Week", 
      getValue: () => {
        const now = new Date()
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 })
        }
      }
    },
    { 
      label: "Last Week", 
      getValue: () => {
        const lastWeek = subWeeks(new Date(), 1)
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        }
      } 
    },
    { 
      label: "This Month", 
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(now),
          to: endOfMonth(now)
        }
      } 
    },
    { 
      label: "Last Month", 
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1)
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        }
      } 
    },
    { 
      label: "Last 6 Months", 
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(subMonths(now, 6)),
          to: endOfMonth(now)
        }
      } 
    },
    { 
      label: "This Year", 
      getValue: () => {
        const now = new Date()
        return {
          from: startOfYear(now),
          to: endOfYear(now)
        }
      } 
    },
    { 
      label: "Last Year", 
      getValue: () => {
        const lastYear = subYears(new Date(), 1)
        return {
          from: startOfYear(lastYear),
          to: endOfYear(lastYear)
        }
      } 
    }
  ]

  const [selectedPeriod, setSelectedPeriod] = React.useState(0)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  // Handle outside clicks for the dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Select fiscal period
  const selectFiscalPeriod = (index) => {
    setSelectedPeriod(index)
    const newDate = fiscalPeriods[index].getValue()
    setDate(newDate)
    setDropdownOpen(false)
    
    // If selecting a predefined period, close the calendar popover
    if (index > 0) {
      setIsOpen(false)
    }
  }

  // Format date range for display
  const formatDateRange = () => {
    if (!date?.from) return "Pick a date"
    
    if (date.to) {
      return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
    }
    
    return format(date.from, "LLL dd, y")
  }

  // Update the selected period when date changes manually
  const handleCalendarSelect = (newDate) => {
    setDate(newDate)
    setSelectedPeriod(0) // Set to "Custom Range" when manually selecting
  }

  return (
    <div className={cn("grid gap-2 relative", className)}>
      {/* Fiscal Period Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="btn px-2.5 min-w-[15.5rem] bg-white border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-left justify-between"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="flex items-center">
            <svg className="fill-current text-gray-400 dark:text-gray-500 mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
              <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
            </svg>
            <span>{fiscalPeriods[selectedPeriod].label}</span>
          </div>
          <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
            <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
          </svg>
        </button>
        
        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-lg py-1.5">
            <div className="font-medium text-sm text-gray-600 dark:text-gray-300">
              {fiscalPeriods.map((period, index) => (
                <button
                  key={index}
                  className={`flex items-center w-full hover:bg-gray-50 dark:hover:bg-gray-700/20 py-1 px-3 cursor-pointer ${index === selectedPeriod ? 'text-violet-500' : ''}`}
                  onClick={() => selectFiscalPeriod(index)}
                >
                  <svg 
                    className={`shrink-0 mr-2 fill-current text-violet-500 ${index !== selectedPeriod && 'invisible'}`} 
                    width="12" 
                    height="9" 
                    viewBox="0 0 12 9"
                  >
                    <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                  </svg>
                  <span>{period.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date Range Display and Calendar Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "btn px-2.5 min-w-[15.5rem] bg-white border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-left justify-start",
              !date && "text-muted-foreground"
            )}
          >
            <svg className="fill-current text-gray-400 dark:text-gray-500 ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"></path>
              <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"></path>
            </svg>
            {formatDateRange()}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}