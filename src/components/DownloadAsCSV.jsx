export const downloadAsCSV = async (opportunities, selectedProbability, axiosInstance, filters) => {
  // Define CSV headers based on your table columns
  const headers = [
    'Company Name',
    'Customer Name',
    'Opportunity Name',
    'Contact Email',
    'Contact Phone',
    'Pipeline',
    'Next Step',
    'Closing Probability',
    'Stage',
    'Status',
    'Age (days)',
    'Expected Closing Date',
    'Expected Delivary Date',
    'Created Date',
    'Updated Date',
    'Amount'
  ];
  
  // If opportunities are directly provided, use them
  let allOpportunities = opportunities;
  
  // If we need to fetch all data (when opportunities array might be limited)
  if (filters) {
    try {
      // Fetch all opportunities using paginated requests
      allOpportunities = await fetchAllOpportunities(axiosInstance, filters);
      console.log(`Total opportunities fetched for CSV: ${allOpportunities.length}`);
    } catch (error) {
      console.error("Error fetching all opportunities for CSV:", error);
      // Fall back to using whatever opportunities were provided
    }
  }
  
  // Convert data to CSV rows
  const csvRows = allOpportunities.map(opp => {
    return [
      opp.assigned_to?.first_name + ' ' + (opp.assigned_to?.last_name || ''),
      opp.contact ? `${opp.contact.first_name || ''} ${opp.contact.last_name || ''}`.trim() : 'N/A',
      opp.name || 'N/A',
      opp.contact?.email || 'N/A',
      opp.contact?.phone || 'N/A',
      opp.pipeline?.name || 'N/A',
      opp.next_step?.name || 'N/A',
      opp.custom_fields?.chances_of_closing_the_deal || 'N/A',
      opp.stage?.name || 'N/A',
      opp.status || 'N/A',
      calculateAge(opp.created_at),
      opp.custom_fields.estimated_closing_date ? new Date(opp.custom_fields.estimated_closing_date).toLocaleDateString() : 'N/A',
      opp.custom_fields.estimated_delivery_date ? new Date(opp.custom_fields.estimated_delivery_date).toLocaleDateString() : 'N/A',
      opp.created_at ? new Date(opp.created_at).toLocaleDateString() : 'N/A',
      opp.updated_at ? new Date(opp.updated_at).toLocaleDateString() : 'N/A',
      opp.opp_value || '£0.00'
    ].join(',');
  });
  
  // Helper function to calculate age
  function calculateAge(createdDate) {
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
  }
  
  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `opportunities_${selectedProbability}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to fetch all opportunities via pagination
async function fetchAllOpportunities(axiosInstance, filters) {
  const { chancesParam, startDate, endDate, estimatedClosingStartDate, estimatedClosingEndDate, updateStartDate, updateEndDate,
          estimatedDeliveryStartDate, estimatedDeliveryEndDate, fiscalPeriodCode, dateRange, 
          selectedPipelines, selectedPipelineStages, selectedAssignedUsers, 
          selectedOpportunityOwners, selectedOpportunitySources, format } = filters;
  
  let allResults = [];
  let page = 1;
  const PAGE_SIZE = 50; // Match whatever your backend uses
  let hasMoreData = true;
  
  while (hasMoreData) {
    try {
      // Build URL with all the filters for current page
      let url = `/opportunities/?chances=${encodeURIComponent(chancesParam)}&page=${page}&page_size=${PAGE_SIZE}`;
      
      // Add filter parameters
      if (startDate && endDate) {
        url += `&created_at_min=${startDate}&created_at_max=${endDate}`;
      } else if (fiscalPeriodCode) {
        url += `&fiscal_period=${encodeURIComponent(fiscalPeriodCode)}`;
      } else if (dateRange && dateRange.from) {
        url += `&created_at_min=${format(dateRange.from, 'yyyy-MM-dd')}`;
        if (dateRange.to) {
          url += `&created_at_max=${format(dateRange.to, 'yyyy-MM-dd')}`;
        }
      }

      // Add estimated closing date filters
      if (estimatedClosingStartDate && estimatedClosingEndDate) {
        url += `&estimated_closing_date_min=${estimatedClosingStartDate}&estimated_closing_date_max=${estimatedClosingEndDate}`;
      }

      // Add estimated delivery date filters
      if (estimatedDeliveryStartDate && estimatedDeliveryEndDate) {
        url += `&estimated_delivery_date_min=${estimatedDeliveryStartDate}&estimated_delivery_date_max=${estimatedDeliveryEndDate}`;
      }

      // Add estimated delivery date filters
      if (updateStartDate && updateEndDate) {
        url += `&updated_at_min=${updateStartDate}&updated_at_max=${updateEndDate}`;
      }

      // Add pipeline filters if available
      if (selectedPipelines && selectedPipelines.length > 0) {
        selectedPipelines.forEach(pipeline => {
          url += `&pipeline=${encodeURIComponent(pipeline)}`;
        });
      }
      
      if (selectedPipelineStages && selectedPipelineStages.length > 0) {
        selectedPipelineStages.forEach(stage_name => {
          url += `&stage_name=${encodeURIComponent(stage_name)}`;
        });
      }
      
      if (selectedAssignedUsers && selectedAssignedUsers.length > 0) {
        selectedAssignedUsers.forEach(assigned_to => {
          url += `&assigned_to=${encodeURIComponent(assigned_to)}`;
        });
      }
      
      if (selectedOpportunityOwners && selectedOpportunityOwners.length > 0) {
        selectedOpportunityOwners.forEach(contact => {
          url += `&contact=${encodeURIComponent(contact)}`;
        });
      }
      
      if (selectedOpportunitySources && selectedOpportunitySources.length > 0) {
        selectedOpportunitySources.forEach(opportunity_source => {
          url += `&opportunity_source=${encodeURIComponent(opportunity_source)}`;
        });
      }
      
      console.log(`Fetching page ${page} of opportunities for CSV...`);
      const response = await axiosInstance.get(url);
      
      const results = response.data.results || [];
      allResults = [...allResults, ...results];
      
      // Check if there are more pages
      const totalCount = response.data.count || 0;
      const fetchedSoFar = page * PAGE_SIZE;
      hasMoreData = fetchedSoFar < totalCount && results.length > 0;
      
      // Increment page for next iteration
      page++;
      
      // Add safety limit to prevent infinite loops
      if (page > 100) {
        console.warn("Reached safety limit of 100 pages when fetching opportunities");
        break;
      }
    } catch (error) {
      console.error(`Error fetching page ${page} of opportunities:`, error);
      break;
    }
  }
  
  return allResults;
}