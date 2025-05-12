  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import axios from 'axios';

  export const fetchCampaigns = createAsyncThunk(
    'campaigns/fetchAll',
    async () => {
      const response = await axios.get('https://convergeb.onrender.com/api/campaigns');
      console.log(response.data)
      return response.data;
    }
  );

  const campaignSlice = createSlice({
    name: 'campaigns',
    initialState: {
      items: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchCampaigns.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchCampaigns.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(fetchCampaigns.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    },
  });

  export default campaignSlice.reducer;