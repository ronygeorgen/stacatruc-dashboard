import { axiosInstance } from "../../services/api";

export const pipelineAPI = {
  getAllPipelines: () => axiosInstance.get("/api2/pipelines/"), // no pagination needed
};