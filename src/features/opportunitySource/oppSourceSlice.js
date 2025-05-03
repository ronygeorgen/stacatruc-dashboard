// src/store/opportunities/opportunitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchOppSources, fetchOppSourcesByPipelines } from "./oppSourceThunks";

const oppSourceSlice = createSlice({
  name: "oppSources",
  initialState: {
    sources: [],
    filteredSources: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOppSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOppSources.fulfilled, (state, action) => {
        state.loading = false;
        state.sources = action.payload;
        state.filteredSources = action.payload;

      })
      .addCase(fetchOppSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOppSourcesByPipelines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOppSourcesByPipelines.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredSources = action.payload;
      })
      .addCase(fetchOppSourcesByPipelines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default oppSourceSlice.reducer;
