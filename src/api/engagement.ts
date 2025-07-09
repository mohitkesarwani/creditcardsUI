import apiClient from './apiClient.js';
import { Review } from '../types';

export const getEngagement = async (productId: string) => {
  const { data } = await apiClient.get(`/api/products/${productId}/engagement`);
  return data;
};

export const likeProduct = async (productId: string) => {
  const { data } = await apiClient.post(`/api/products/${productId}/like`);
  return data;
};

export const shareProduct = async (productId: string) => {
  const { data } = await apiClient.post(`/api/products/${productId}/share`);
  return data;
};

export const addReview = async (productId: string, review: Review) => {
  const payload = {
    name: review.name,
    comment: review.comment,
    stars: review.stars,
    timestamp: review.timestamp,
  };
  const { data } = await apiClient.post(
    `/api/products/${productId}/review`,
    payload
  );
  return data;
};
export const getEngagementForEntity = async (id: string, entityType: string) => {
  const { data } = await apiClient.get(`/api/engagement/${id}`, {
    params: { entityType },
  });
  return data;
};

export const likeEntity = async (id: string, entityType: string) => {
  const { data } = await apiClient.post('/api/likes', { entityId: id, entityType });
  return data;
};

export const shareEntity = async (id: string, entityType: string) => {
  const { data } = await apiClient.post('/api/shares', { entityId: id, entityType });
  return data;
};

export const addEntityReview = async (
  id: string,
  entityType: string,
  review: Review
) => {
  const payload = {
    userId: 'anon',
    entityId: id,
    entityType,
    rating: review.stars,
  };
  const { data } = await apiClient.post('/api/reviews', payload);
  return data;
};
