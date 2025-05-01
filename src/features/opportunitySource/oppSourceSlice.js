// src/store/opportunities/opportunitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchOppSources } from "./oppSourceThunks";

const oppSourceSlice = createSlice({
  name: "oppSources",
  initialState: {
    sources: [],
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
      })
      .addCase(fetchOppSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default oppSourceSlice.reducer;
