import React, { useState, useMemo } from 'react';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';
import OpportunityTable from '../components/OpportunityTable';

// Source Detail Modal Component
function SourceDetailModal({ isOpen, onClose, source, opportunities }) {
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
  
  if (!isOpen || !source) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Modal container */}
      <div 
        ref={modalRef} 
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${getSourceColor(source.name)} flex items-center justify-center text-white font-medium text-lg`}>
              {source.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {source.name} Opportunities
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {source.deals} deals · {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(source.value)} total value
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

// Function to get a color based on the source type
const getSourceColor = (sourceName) => {
  const colorMap = {
    'In Bound Call': 'bg-blue-500',
    'In Bound Email': 'bg-green-500',
    'Best Quote': 'bg-yellow-500',
    'Cold Call': 'bg-red-500',
    'Referral': 'bg-purple-500',
    'Engineer Lead': 'bg-indigo-500',
    'Existing Customer': 'bg-teal-500'
  };
  
  return colorMap[sourceName] || 'bg-gray-500';
};

// Generate a random date within recent months
const getRandomDate = () => {
  const start = new Date(2024, 3, 1);
  const end = new Date(2024, 8, 30);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Calculate age in days
const calculateAge = (dateString) => {
  const createDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - createDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Example dummy data for sources
const dummySourceData = [
  {
    id: 1,
    name: 'In Bound Call',
    value: 285000,
    deals: 42,
    opportunities: Array(12).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `ABC Company ${i+1}`,
        customerName: `Customer ${i+1}`,
        opportunityName: `Call Lead - New Equipment ${i+1}`,
        contact: `John Doe ${i+1} (555-123-${1000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Follow-up call', 'Send proposal', 'Schedule meeting', 'Finalize contract'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 20000) + 5000
      };
    })
  },
  {
    id: 2,
    name: 'In Bound Email',
    value: 218000,
    deals: 36,
    opportunities: Array(10).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `XYZ Industries ${i+1}`,
        customerName: `Email Lead ${i+1}`,
        opportunityName: `Email Inquiry - Service ${i+1}`,
        contact: `Jane Smith ${i+1} (555-234-${2000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Follow-up email', 'Provide more info', 'Schedule demo', 'Send contract'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 18000) + 3000
      };
    })
  },
  {
    id: 3,
    name: 'Best Quote',
    value: 310000,
    deals: 28,
    opportunities: Array(8).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `Best Buy Co. ${i+1}`,
        customerName: `Quote Request ${i+1}`,
        opportunityName: `Competitive Quote ${i+1}`,
        contact: `Robert Johnson ${i+1} (555-345-${3000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Adjust pricing', 'Review with manager', 'Add incentives', 'Send final quote'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 25000) + 5000
      };
    })
  },
  {
    id: 4,
    name: 'Cold Call',
    value: 175000,
    deals: 32,
    opportunities: Array(9).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `Global Systems ${i+1}`,
        customerName: `Cold Prospect ${i+1}`,
        opportunityName: `Cold Outreach - Initial ${i+1}`,
        contact: `Michael Brown ${i+1} (555-456-${4000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Follow-up call', 'Research needs', 'Schedule first meeting', 'Send catalog'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 15000) + 2000
      };
    })
  },
  {
    id: 5,
    name: 'Referral',
    value: 425000,
    deals: 22,
    opportunities: Array(7).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `Referred Partner ${i+1}`,
        customerName: `Referral Lead ${i+1}`,
        opportunityName: `Referral - Premium Service ${i+1}`,
        contact: `Lisa Davis ${i+1} (555-567-${5000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Thank referrer', 'Intro call', 'Show premium options', 'Finalize deal'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 30000) + 10000
      };
    })
  },
  {
    id: 6,
    name: 'Engineer Lead',
    value: 198000,
    deals: 18,
    opportunities: Array(6).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `Tech Solutions ${i+1}`,
        customerName: `Engineer Lead ${i+1}`,
        opportunityName: `Technical Referral ${i+1}`,
        contact: `Andrew Wilson ${i+1} (555-678-${6000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Technical assessment', 'System demo', 'Compatibility check', 'Engineering review'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 22000) + 5000
      };
    })
  },
  {
    id: 7,
    name: 'Existing Customer',
    value: 520000,
    deals: 46,
    opportunities: Array(15).fill().map((_, i) => {
      const createdDate = getRandomDate();
      return {
        accountName: `Loyal Customer Inc. ${i+1}`,
        customerName: `Existing Client ${i+1}`,
        opportunityName: `Expansion Opportunity ${i+1}`,
        contact: `Sarah Miller ${i+1} (555-789-${7000+i})`,
        stage: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
        nextStep: ['Account review', 'Upsell discussion', 'Renewal planning', 'Add-on services'][Math.floor(Math.random() * 4)],
        probability: ['25%', '50%', '75%', '90%'][Math.floor(Math.random() * 4)],
        age: calculateAge(createdDate),
        createdDate: formatDate(createdDate),
        closingDate: formatDate(getRandomDate()),
        amount: Math.floor(Math.random() * 25000) + 5000
      };
    })
  }
];

function SourceCard() {
  // Get fiscal period context
  const { periodLabel, periodStart, periodEnd } = useFiscalPeriod();
  const [selectedSource, setSelectedSource] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate total value
  const totalValue = useMemo(() => {
    return dummySourceData.reduce((sum, source) => sum + source.value, 0);
  }, []);

  // Filter opportunities for the selected source
  const sourceOpportunities = useMemo(() => {
    if (!selectedSource) return [];
    return selectedSource.opportunities || [];
  }, [selectedSource]);

  // Handle source row click
  const handleSourceClick = (source) => {
    setSelectedSource(source);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col col-span-full sm:col-span-12 lg:col-span-6 xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Opportunity Sources</h2>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
            <span className="mr-1">{periodLabel || "All Time"}</span>
            <span className="ml-2">Total: {formatCurrency(totalValue)}</span>
          </div>
        </header>
        
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Source</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-right">Total Value</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">Deals</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-right">Avg. Deal Size</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                {dummySourceData.map((source) => {
                  const bgColorClass = getSourceColor(source.name);
                  const avgDealSize = source.value / source.deals;
                  
                  return (
                    <tr 
                      key={source.id} 
                      onClick={() => handleSourceClick(source)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 mr-2 flex-shrink-0 rounded-full ${bgColorClass} flex items-center justify-center text-white font-medium`}>
                            {source.name.charAt(0)}
                          </div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">{source.name}</div>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-right font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(source.value)}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center font-medium text-gray-800 dark:text-gray-200">{source.deals}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-right font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(avgDealSize)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for source details */}
      <SourceDetailModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        source={selectedSource}
        opportunities={sourceOpportunities}
      />
    </>
  );
}

export default SourceCard;