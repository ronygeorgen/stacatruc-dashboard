import { axiosInstance } from "../../services/api";

export const oppSourceAPI = {
  getAllOppSources: () => axiosInstance.get("/api2/opportunity_dash"), 
};