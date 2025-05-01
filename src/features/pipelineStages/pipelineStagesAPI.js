import { axiosInstance } from "../../services/api";

export const pipelineStagesAPI = {
  getAllPipelineStages: () => axiosInstance.get("/pipeline-stages/"), 
};