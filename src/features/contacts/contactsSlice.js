import { createSlice } from "@reduxjs/toolkit";
import { fetchOpportunityOwners } from "./contactsThunks";

const contactsSlice = createSlice({
    name: "contacts",
    initialState: {
      opportunityOwnerOptions: [],
      status: "idle",
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchOpportunityOwners.pending, (state) => {
          state.status = "loading";
        })
        .addCase(fetchOpportunityOwners.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.opportunityOwnerOptions = action.payload;
        })
        .addCase(fetchOpportunityOwners.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    },
  });
  
  export default contactsSlice.reducer;