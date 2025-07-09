import apiClient from './apiClient.js';

const normalizeMortgage = (data) => ({
  ...data,
  id: data.id || data._id,
});

export const fetchMortgages = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/residential-mortgages', { params });
    return response.data.map(normalizeMortgage);
  } catch (err) {
    console.error('Error fetching mortgages:', err);
    throw err;
  }
};

export const fetchMortgage = async (id) => {
  try {
    const response = await apiClient.get(`/api/residential-mortgages/${id}`);
    return normalizeMortgage(response.data);
  } catch (err) {
    console.error('Error fetching mortgage:', err);
    throw err;
  }
};
