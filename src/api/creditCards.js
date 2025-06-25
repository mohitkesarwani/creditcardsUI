import apiClient from './apiClient.js';

const normalizeCard = (card) => {
  if (!card) return card;
  return {
    ...card,
    id: card.id || card._id,
  };
};

export const fetchCreditCards = async () => {
  try {
    const response = await apiClient.get('/api/credit-cards');
    return response.data.map(normalizeCard);
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    throw err;
  }
};

export const fetchCreditCard = async (id) => {
  try {
    const response = await apiClient.get(`/api/credit-cards/${id}`);
    return normalizeCard(response.data);
  } catch (err) {
    console.error('Error fetching credit card:', err);
    throw err;
  }
};
