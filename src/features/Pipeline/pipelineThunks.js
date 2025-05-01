import { createAsyncThunk } from "@reduxjs/toolkit";
import { pipelineAPI } from "./pipelineAPI";

export const fetchPipelines = createAsyncThunk(
  "pipelines/fetchAll",
  async () => {
    const response = await pipelineAPI.getAllPipelines();
    return response.data;
  }
);