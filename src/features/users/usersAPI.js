import { axiosInstance } from "../../services/api";

// API methods for users feature
export const usersAPI = {
    getUsers: () => axiosInstance.get('/ghlusers/'),

    getUsersByPipelines: (pipelineIds) => {
      // If no pipeline IDs are selected, return all pipeline stages
      if (!pipelineIds || pipelineIds.length === 0) {
        return axiosInstance.get("/ghlusers/");
      }
      
      // Create URL with multiple pipeline parameters
      let url = "/ghlusers/?";
      pipelineIds.forEach((id, index) => {
        // Add & between parameters, but not for the first one
        if (index > 0) url += "&";
        url += `pipeline=${id}`;
      });
      
      return axiosInstance.get(url);

    }
  };