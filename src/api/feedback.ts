import apiClient from './apiClient.js';

export interface CommentPayload {
  userId: string;
  entityId: string;
  entityType: string;
  commentText: string;
}

export interface ReviewPayload {
  userId: string;
  entityId: string;
  entityType: string;
  rating: number;
}

export const postComment = async (payload: CommentPayload) => {
  const { data } = await apiClient.post('/api/comments', payload);
  return data;
};

export const deleteComment = async (id: string) => {
  const { data } = await apiClient.delete(`/api/comments/${id}`);
  return data;
};

export const getComments = async (entityId: string) => {
  const { data } = await apiClient.get('/api/comments', {
    params: { productId: entityId },
  });
  return data;
};

export const postReview = async (payload: ReviewPayload) => {
  const { entityId } = payload;
  const { data } = await apiClient.post(
    `/api/products/${entityId}/engagement`,
    payload
  );
  return data;
};

export const getReviewSummary = async (entityId: string) => {
  const { data } = await apiClient.get(
    `/api/products/${entityId}/engagement`
  );
  return data;
};
