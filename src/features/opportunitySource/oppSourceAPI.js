import { axiosInstance } from "../../services/api";

export const oppSourceAPI = {
  getAllOppSources: () => axiosInstance.get("/opportunity_dash"), 

  getOppSourcesByPipelines: (pipelineIds) => {
    // If no pipeline IDs are selected, return all pipeline stages
    if (!pipelineIds || pipelineIds.length === 0) {
      return axiosInstance.get("/opportunity_dash");
    }
    
    // Create URL with multiple pipeline parameters
    let url = "/opportunity_dash?";
    pipelineIds.forEach((id, index) => {
      // Add & between parameters, but not for the first one
      if (index > 0) url += "&";
      url += `pipeline=${id}`;
    });
    
    return axiosInstance.get(url);

  }
};