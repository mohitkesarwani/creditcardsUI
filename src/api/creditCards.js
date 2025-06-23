import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchCreditCards = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/credit-cards`);
    console.log('Fetched credit cards:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    throw err;
  }
};
