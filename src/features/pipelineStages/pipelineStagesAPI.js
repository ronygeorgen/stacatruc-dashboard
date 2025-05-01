import { axiosInstance } from "../../services/api";

export const pipelineStagesAPI = {
  getAllPipelineStages: () => axiosInstance.get("/api2/pipeline-stages/"), 
};