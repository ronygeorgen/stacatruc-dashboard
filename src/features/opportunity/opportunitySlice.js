// src/store/opportunities/opportunitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchOpportunities } from "./opportunityThunks";

const opportunitySlice = createSlice({
  name: "opportunities",
  initialState: {
    data: [],
    aggregations: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.results;
        state.aggregations = action.payload.aggregations;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default opportunitySlice.reducer;
