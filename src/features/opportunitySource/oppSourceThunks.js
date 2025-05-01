import { createAsyncThunk } from "@reduxjs/toolkit";
import { oppSourceAPI } from "./oppSourceAPI";

export const fetchOppSources = createAsyncThunk(
  "oppSources/fetchOppSources",
  async (_, { rejectWithValue }) => {
    try {
      const response = await oppSourceAPI.getAllOppSources();
      // Make sure we're returning the array from opp_source
      return response.data.opp_source || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);