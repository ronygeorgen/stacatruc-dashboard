import { createAsyncThunk } from "@reduxjs/toolkit";
import { contactsAPI } from "./contactsAPI";

export const fetchOpportunityOwners = createAsyncThunk(
    "contacts/fetchOpportunityOwners",
    async (searchQuery = "", { rejectWithValue }) => {
      try {
        const response = await contactsAPI.getContacts(searchQuery);
        
        return response.data.results.map(contact => ({
          id: contact.id,
          label: `${contact.first_name} ${contact.last_name}`,
        }));
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
  