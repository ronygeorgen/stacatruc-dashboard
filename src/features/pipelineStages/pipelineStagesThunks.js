import { createAsyncThunk } from "@reduxjs/toolkit";
import { pipelineStagesAPI } from "./pipelineStagesAPI";

export const fetchPipelineStages = createAsyncThunk(
  "pipelineStages/fetchAll",
  async () => {
    const response = await pipelineStagesAPI.getAllPipelineStages();
    return response.data;
  }
);