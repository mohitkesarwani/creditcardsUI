import axios from 'axios';

export const fetchCreditCards = async () => {
  try {
    const response = await axios.get('/api/credit-cards');
    console.log('Fetched credit cards:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    throw err;
  }
};
