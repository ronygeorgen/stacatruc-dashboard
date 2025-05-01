import { axiosInstance } from "../../services/api";

export const oppSourceAPI = {
  getAllOppSources: () => axiosInstance.get("/opportunity_dash"), 
};