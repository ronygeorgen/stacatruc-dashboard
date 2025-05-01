// /features/pipelines/pipelineSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchPipelineStages } from "./pipelineStagesThunks";

const pipelineStagesSlice = createSlice({
  name: "pipelineStages",
  initialState: {
    stages: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelineStages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPipelineStages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stages = action.payload;
      })
      .addCase(fetchPipelineStages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default pipelineStagesSlice.reducer;
