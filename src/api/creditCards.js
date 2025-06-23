import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const normalizeCard = (card) => {
  if (!card) return card;
  return {
    ...card,
    id: card.id || card._id,
  };
};

export const fetchCreditCards = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/credit-cards`);
    console.log('Fetched credit cards:', response.data);
    return response.data.map(normalizeCard);
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    throw err;
  }
};

export const fetchCreditCard = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/credit-cards/${id}`);
    return normalizeCard(response.data);
  } catch (err) {
    console.error('Error fetching credit card:', err);
    throw err;
  }
};
