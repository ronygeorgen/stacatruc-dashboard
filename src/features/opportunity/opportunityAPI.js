import { axiosInstance } from "../../services/api";

export const opportunityAPI = {
  async getOpportunities(
    searchQuery = "", 
    page = 1, 
    pageSize = 10, 
    fiscalPeriod = null,
    fromDate = null,
    toDate = null,
    state = null,
    pipeline = null // Add pipeline parameter
  ) {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add search query if provided
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    
    // Add pagination parameters
    params.append("page", page);
    params.append("page_size", pageSize);
    
    // Add state filter if provided (open, closed, etc.)
    if (state) {
      params.append("state", state);
    }
    
    // Add fiscal period if provided (takes precedence over date range)
    if (fiscalPeriod) {
      params.append("fiscal_period", fiscalPeriod);
    } 
    // Otherwise use date range if provided
    else {
      if (fromDate) {
        params.append("created_at_min", fromDate);
      }
      if (toDate) {
        params.append("created_at_max", toDate);
      }
    }
    
    // Add pipeline filters if provided
    if (pipeline) {
      // If pipeline is an array, add each pipeline ID separately
      if (Array.isArray(pipeline)) {
        pipeline.forEach(p => {
          params.append("pipeline", p);
        });
      } 
      // If it's a single value, add it directly
      else {
        params.append("pipeline", pipeline);
      }
    }
    
    // Make the API request
    const response = await axiosInstance.get(`/opportunities/?${params.toString()}`);
    return response.data;
  },
  
  // Keep other methods...
};