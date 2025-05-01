import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../features/users/usersThunks";
import SingleDropdownFilter from "./SingleDropdownFilter";
import { fetchOpportunityOwners } from "../features/contacts/contactsThunks";
import { fetchPipelines } from "../features/Pipeline/pipelineThunks";
import { fetchPipelineStages } from "../features/pipelineStages/pipelineStagesThunks";
import { fetchOppSources } from "../features/opportunitySource/oppSourceThunks";

function DropdownFilters() {
  const { assignedUserOptions, status, error } = useSelector((state) => state.users);
  const { opportunityOwnerOptions } = useSelector(state => state.contacts);
  const { items: pipelines } = useSelector(state => state.pipelines);
  const { stages: pipelineStages } = useSelector(state => state.pipelineStages);
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

   // Filter unique pipeline stages by name (keeping the first occurrence)
   const uniquePipelineStagesMap = new Map();
  
   pipelineStages.forEach(stage => {
     if (!uniquePipelineStagesMap.has(stage.name)) {
       uniquePipelineStagesMap.set(stage.name, {
         id: stage.ghl_id,
         label: stage.name
       });
     }
   });
   
   const pipelineStagesOptions = Array.from(uniquePipelineStagesMap.values());

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
      />
      <SingleDropdownFilter 
        title="Pipeline stages" 
        filterOptions={pipelineStagesOptions} 
      />
      <SingleDropdownFilter 
        title="Owner - Assigned User" 
        filterOptions={assignedUserOptions} 
      />
      <SingleDropdownFilter 
        title="Opportunity Owner" 
        filterOptions={opportunityOwnerOptions} 
        searchable
        onSearch={handleSearchOpportunityOwner}
        align="right"
      />
      <SingleDropdownFilter 
        title="Opportunity Source" 
        filterOptions={opportunitySourceOptions} 
      />
      <SingleDropdownFilter 
        title="Product Sales" 
        filterOptions={productSalesOptions} 
        align="right"
      />
    </div>
  );
}

export default DropdownFilters;