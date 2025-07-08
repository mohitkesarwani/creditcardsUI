import apiClient from './apiClient.js';

const normalizeDeposit = (data) => ({
  ...data,
  id: data.id || data.productId || data._id,
});

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.deposits)) return payload.deposits;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const extractItem = (payload) => {
  if (!payload) return payload;
  return payload.deposit || payload.data || payload;
};

export const fetchDeposits = async () => {
  const { data } = await apiClient.get('/api/deposits');
  const list = extractList(data);
  return list.map(normalizeDeposit);
};

export const fetchDeposit = async (id) => {
  const { data } = await apiClient.get(`/api/deposits/${id}`);
  return normalizeDeposit(extractItem(data));
};
