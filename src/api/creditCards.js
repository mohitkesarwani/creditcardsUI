import axios from 'axios';

export const fetchCreditCards = async () => {
  const response = await axios.get('/api/credit-cards');
  return response.data;
};
