import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/hotels`,
});

const hotelApi = {
  getHotels: async ({ page = 1, limit = 6, minPrice = '', maxPrice = '' } = {}) => {
    const params = { offset: Math.max(0, (page - 1) * limit), limit };
    if (minPrice !== '' && minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== '' && maxPrice !== undefined) params.maxPrice = maxPrice;

    const response = await api.get('', { params });
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  createHotel: async (formData) => {
    const response = await api.post('', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateHotel: async (id, formData) => {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default hotelApi;
