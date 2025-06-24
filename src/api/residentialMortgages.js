import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const normalizeMortgage = (data) => ({
  ...data,
  id: data.id || data._id,
});

export const fetchMortgages = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/residential-mortgages`, { params });
    return response.data.map(normalizeMortgage);
  } catch (err) {
    console.error('Error fetching mortgages:', err);
    throw err;
  }
};
