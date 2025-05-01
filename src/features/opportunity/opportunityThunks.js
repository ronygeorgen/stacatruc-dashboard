import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';

export const fetchOpportunities = createAsyncThunk(
  'opportunities/fetchOpportunities',
  async (filters, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        fiscalPeriod = null,
        fromDate = null,
        toDate = null,
        ...otherFilters 
      } = filters || {};

      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page);
      params.append('page_size', pageSize);
      
      // Add fiscal period if provided
      if (fiscalPeriod) {
        params.append('fiscal_period', fiscalPeriod);
      } 
      // Otherwise use date range if provided
      else if (fromDate) {
        params.append('created_at_min', fromDate);
        if (toDate) {
          params.append('created_at_max', toDate);
        }
      }
      
      // Add any other filters
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/api2/opportunities/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to fetch opportunities' });
    }
  }
);