import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hotelApi from '../api/hotelApi';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (params, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getHotels(params);
      return response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch hotels'
      );
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getHotelById(id);
      return response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch hotel details'
      );
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await hotelApi.createHotel(formData);
      return response;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to create hotel',
        errors: err.response?.data?.errors || null,
      });
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await hotelApi.updateHotel(id, formData);
      return response;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to update hotel',
        errors: err.response?.data?.errors || null,
      });
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelApi.deleteHotel(id);
      return { id, message: response.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to delete hotel'
      );
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 6,
  totalPages: 1,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
  },
  currentHotel: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
  validationErrors: null,
  deleteSuccessPopup: {
    show: false,
    hotelTitle: '',
  },
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: '',
        maxPrice: '',
      };
      state.page = 1;
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    closeDeleteSuccessPopup: (state) => {
      state.deleteSuccessPopup = { show: false, hotelTitle: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        const { hotels = [], total = 0, limit = state.limit } = action.payload || {};
        state.loading = false;
        state.items = hotels;
        state.total = total;
        state.limit = limit;
        state.totalPages = Math.max(1, Math.ceil(total / limit));
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      .addCase(createHotel.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.submitting = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Create failed';
        state.validationErrors = action.payload?.errors || null;
      })

      .addCase(updateHotel.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.items.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentHotel = action.payload;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Update failed';
        state.validationErrors = action.payload?.errors || null;
      })

      .addCase(deleteHotel.fulfilled, (state, action) => {
        const deletedId = action.payload.id;
        const deletedHotel = state.items.find((h) => h.id === deletedId);
        const title = deletedHotel?.title || action.payload.data?.title || 'Hotel';
        state.items = state.items.filter((h) => h.id !== deletedId);
        state.total = Math.max(0, state.total - 1);
        state.deleteSuccessPopup = {
          show: true,
          hotelTitle: title,
        };
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setPage,
  setFilters,
  resetFilters,
  clearCurrentHotel,
  closeDeleteSuccessPopup,
} = hotelSlice.actions;

export default hotelSlice.reducer;
