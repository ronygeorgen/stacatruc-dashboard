import { axiosInstance } from "../../services/api";

export const pipelineStagesAPI = {
  getAllPipelineStages: () => axiosInstance.get("/pipeline-stages/"),
  
  // Add a new function to get pipeline stages by pipeline IDs
  getPipelineStagesByPipelines: (pipelineIds) => {
    // If no pipeline IDs are selected, return all pipeline stages
    if (!pipelineIds || pipelineIds.length === 0) {
      return axiosInstance.get("/pipeline-stages/");
    }
    
    // Create URL with multiple pipeline parameters
    let url = "/pipeline-stages/?";
    pipelineIds.forEach((id, index) => {
      // Add & between parameters, but not for the first one
      if (index > 0) url += "&";
      url += `pipeline=${id}`;
    });
    
    return axiosInstance.get(url);
  }
};