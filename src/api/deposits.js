import apiClient from './apiClient.js';

const normalizeDeposit = (data) => ({
  ...data,
  id: data.id || data._id,
});

export const fetchDeposits = async () => {
  const { data } = await apiClient.get('/api/deposits');
  return data.map(normalizeDeposit);
};

export const fetchDeposit = async (id) => {
  const { data } = await apiClient.get(`/api/deposits/${id}`);
  return normalizeDeposit(data);
};
