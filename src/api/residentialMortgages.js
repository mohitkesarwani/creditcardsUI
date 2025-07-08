import apiClient from './apiClient.js';

const normalizeMortgage = (data) => ({
  ...data,
  id: data.id || data._id,
});

export const fetchMortgages = async (page = 1, limit = 20, params = {}) => {
  try {
    const response = await apiClient.get('/api/residential-mortgages', {
      params: { page, limit, ...params },
    });
    const data = response.data || {};
    const list = Array.isArray(data.mortgages)
      ? data.mortgages
      : Array.isArray(data)
      ? data
      : data.items || [];
    const total = data.total ?? list.length;
    return { mortgages: list.map(normalizeMortgage), total };
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
    try {
      const fallback = await apiClient.get(`/api/home-loans/${id}`);
      return normalizeMortgage(fallback.data);
    } catch (e) {
      console.error('Error fetching mortgage:', e);
      throw e;
    }
  }
};
