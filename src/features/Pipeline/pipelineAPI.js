import { axiosInstance } from "../../services/api";

export const pipelineAPI = {
  getAllPipelines: () => axiosInstance.get("/pipelines/"), // no pagination needed
};