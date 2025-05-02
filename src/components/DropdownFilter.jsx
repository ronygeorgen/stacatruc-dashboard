import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../features/users/usersThunks";
import SingleDropdownFilter from "./SingleDropdownFilter";
import { fetchOpportunityOwners } from "../features/contacts/contactsThunks";
import { fetchPipelines } from "../features/Pipeline/pipelineThunks";
import { fetchPipelineStages, fetchPipelineStagesByPipelines } from "../features/pipelineStages/pipelineStagesThunks";
import { fetchOppSources } from "../features/opportunitySource/oppSourceThunks";
import { 
  setPipelineFilters, 
  setPipelineStageFilters,
  setAssignedUserFilters,
  setOpportunityOwnerFilters,
  setOpportunitySourceFilters,
  setProductSalesFilters
} from '../features/globalFilter/filterSlice'

function DropdownFilters() {
  const { assignedUserOptions, status, error } = useSelector((state) => state.users);
  const { opportunityOwnerOptions } = useSelector(state => state.contacts);
  const { items: pipelines } = useSelector(state => state.pipelines);
  const { stages: pipelineStages, filteredStages } = useSelector(state => state.pipelineStages);
  const { sources: oppSourcesList } = useSelector(state => state.oppSources);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchUsers());
    dispatch(fetchOpportunityOwners()); // initial fetch with no query
    dispatch(fetchPipelineStages());
    dispatch(fetchOppSources());
  }, [dispatch]);

  const pipelineOptions = pipelines.map(p => ({
    id: p.ghl_id,
    label: `${p.name}`
  }));

  // Create pipeline stage options based on the filtered stages or all stages if no filter is applied
  const stagesToUse = filteredStages && filteredStages.length > 0 ? filteredStages : pipelineStages;
  
  // Filter unique pipeline stages by normalized name (keeping the first occurrence)
  const uniquePipelineStagesMap = new Map();
  
  // Function to normalize stage names - removes extra spaces and standardizes spacing around special chars
  const normalizeStageNameForComparison = (name) => {
    if (!name) return '';
    
    // Trim the name first
    let normalized = name.trim();
    
    // Replace multiple spaces with a single space
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Standardize spacing around special characters like '/' by removing spaces before/after them
    normalized = normalized.replace(/\s*\/\s*/g, '/');
    
    // Could add more replacements for other special characters if needed
    // normalized = normalized.replace(/\s*-\s*/g, '-');
    // normalized = normalized.replace(/\s*\.\s*/g, '.');
    
    return normalized;
  };
  
  // First ensure stages have valid name properties before processing
  stagesToUse
    .filter(stage => stage && stage.name) // Make sure stage and stage.name exist
    .forEach(stage => {
      // Get displayable name (trimmed but preserving original spacing)
      const displayName = stage.name.trim();
      
      // Get normalized name for comparison/deduplication
      const normalizedName = normalizeStageNameForComparison(stage.name);
      
      if (!uniquePipelineStagesMap.has(normalizedName)) {
        uniquePipelineStagesMap.set(normalizedName, {
          id: stage.ghl_id,
          label: displayName // Use display name as the visible label
        });
      }
    });
  
  // Convert Map to array and sort alphabetically by stage name
  const pipelineStagesOptions = Array.from(uniquePipelineStagesMap.values())
    .sort((a, b) => a.label.localeCompare(b.label));

  // Make sure oppSourcesList is an array and each item is a string before trying to map over it
  const opportunitySourceOptions = Array.isArray(oppSourcesList) 
    ? oppSourcesList
        .filter(source => source && typeof source.source === 'string') // Filter out non-objects and objects without string source
        .map(source => ({
          id: source.source.replace(/\s+/g, '-'), // No need for toLowerCase, just replace spaces
          label: source.source
        }))
    : [];

  const handleSearchOpportunityOwner = (query) => {
    dispatch(fetchOpportunityOwners(query));
  };

   // Handler for pipeline filter changes - now updates both pipeline stages and Redux filter store
   const handlePipelineFilterApply = (selectedPipelineIds) => {
    // Update pipeline filter state in Redux
    dispatch(setPipelineFilters(selectedPipelineIds));
    
    // If no pipelines selected or empty array (cleared), fetch all stages
    if (!selectedPipelineIds || selectedPipelineIds.length === 0) {
      // Fetch all pipeline stages to reset the filter
      dispatch(fetchPipelineStages());
    } else {
      // Fetch stages filtered by the selected pipelines
      dispatch(fetchPipelineStagesByPipelines(selectedPipelineIds));
    }
  };

  // Handler for pipeline stage filter changes
  const handlePipelineStageFilterApply = (selectedStageIds) => {
    dispatch(setPipelineStageFilters(selectedStageIds));
  };

  // Handler for assigned user filter changes
  const handleAssignedUserFilterApply = (selectedUserIds) => {
    dispatch(setAssignedUserFilters(selectedUserIds));
  };

  // Handler for opportunity owner filter changes
  const handleOpportunityOwnerFilterApply = (selectedOwnerIds) => {
    dispatch(setOpportunityOwnerFilters(selectedOwnerIds));
  };

  // Handler for opportunity source filter changes
  const handleOpportunitySourceFilterApply = (selectedSourceIds) => {
    dispatch(setOpportunitySourceFilters(selectedSourceIds));
  };

  // Handler for product sales filter changes
  const handleProductSalesFilterApply = (selectedProductIds) => {
    dispatch(setProductSalesFilters(selectedProductIds));
  };

  // Product Sales options
  const productSalesOptions = [
    { id: "fuel", label: "Fuel" },
    { id: "truck-insurance", label: "Cover Truck Insurance" },
    { id: "davis-derby", label: "Davis Derby" },
    { id: "plant-insurance", label: "Hire in Plant Insurance" },
    { id: "hpt-ppt", label: "HPT and PPT" },
    { id: "vaps", label: "VAPS" },
    { id: "racking", label: "Racking" },
    { id: "roller-doors", label: "Roller Shutter Doors" }
  ];

  return (
    <div className="flex flex-wrap items-center space-x-2">
      <SingleDropdownFilter 
        title="Pipeline" 
        filterOptions={pipelineOptions}
        onApplyFilters={handlePipelineFilterApply}
      />
      <SingleDropdownFilter 
        title="Pipeline stages" 
        filterOptions={pipelineStagesOptions}
        onApplyFilters={handlePipelineStageFilterApply}
      />
      <SingleDropdownFilter 
        title="Owner - Assigned User" 
        filterOptions={assignedUserOptions}
        onApplyFilters={handleAssignedUserFilterApply}
      />
      <SingleDropdownFilter 
        title="Opportunity Owner" 
        filterOptions={opportunityOwnerOptions} 
        searchable
        onSearch={handleSearchOpportunityOwner}
        onApplyFilters={handleOpportunityOwnerFilterApply}
        align="right"
      />
      <SingleDropdownFilter 
        title="Opportunity Source" 
        filterOptions={opportunitySourceOptions}
        onApplyFilters={handleOpportunitySourceFilterApply}
      />
      <SingleDropdownFilter 
        title="Product Sales" 
        filterOptions={productSalesOptions}
        onApplyFilters={handleProductSalesFilterApply}
        align="right"
      />
    </div>
  );
}

export default DropdownFilters;