import { axiosInstance } from "../../services/api";

// API methods for contacts feature
export const contactsAPI = {
    getContacts: (searchQuery = "") => axiosInstance.get(`/contacts/?search=${searchQuery}`),

    getContactsByPipelines: (pipelineIds) => {
      // If no pipeline IDs are selected, return all pipeline stages
      if (!pipelineIds || pipelineIds.length === 0) {
        return axiosInstance.get("/contacts/");
      }
      
      // Create URL with multiple pipeline parameters
      let url = "/contacts/?";
      pipelineIds.forEach((id, index) => {
        // Add & between parameters, but not for the first one
        if (index > 0) url += "&";
        url += `pipeline=${id}`;
      });
      
      return axiosInstance.get(url);

    }
  };