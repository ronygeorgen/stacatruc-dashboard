import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers } from './usersThunks';

const initialState = {
    assignedUserOptions: [],
    status: 'idle',
    error: null,
  };

  const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
      clearAssignedUserOptions: (state) => {
        state.assignedUserOptions = [];
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchUsers.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.status = 'succeeded';
            // Transform the data to match the expected format
            state.assignedUserOptions = action.payload.map(user => ({
              id: user.id, // Changed from value to id to match your component
              label: `${user.first_name} ${user.last_name}`,
            }));
          })
        .addCase(fetchUsers.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    },
  });
  
  // Export actions
  export const { clearAssignedUserOptions } = usersSlice.actions;
  
  // Export reducer
  export default usersSlice.reducer;