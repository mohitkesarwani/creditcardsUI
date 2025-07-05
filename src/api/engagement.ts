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
