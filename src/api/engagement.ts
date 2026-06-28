import supabase from '../supabaseClient.js';
import { normalizeEngagement } from './normalizeCard.js';
import { Review } from '../types';

// Legacy "products" API kept the entity type implicit (everything was a credit
// card). The Supabase schema is generic, so the new functions take an entity
// type explicitly; the product-flavoured wrappers default to 'credit-cards'.

const DEFAULT_TYPE = 'credit-cards';

const fetchSummary = async (id: string, entityType: string) => {
  const { data, error } = await supabase
    .from('engagement_summary')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', id)
    .maybeSingle();
  if (error) {
    console.warn('[engagement] summary fetch failed:', error.message);
    return normalizeEngagement(null);
  }
  return normalizeEngagement(data);
};

const bumpLike = async (id: string, entityType: string) => {
  const { data, error } = await supabase.rpc('increment_like', {
    p_type: entityType,
    p_id: id,
  });
  if (error) throw error;
  return normalizeEngagement(data);
};

const bumpShare = async (id: string, entityType: string) => {
  const { data, error } = await supabase.rpc('increment_share', {
    p_type: entityType,
    p_id: id,
  });
  if (error) throw error;
  return normalizeEngagement(data);
};

const submitReview = async (
  id: string,
  entityType: string,
  rating: number,
  userId = 'anon'
) => {
  const { data, error } = await supabase.rpc('apply_review', {
    p_user_id: userId,
    p_entity_type: entityType,
    p_entity_id: id,
    p_rating: rating,
  });
  if (error) throw error;
  return normalizeEngagement(data);
};

// --- product-flavoured API (used by useEngagement.ts) -----------------------
export const getEngagement = (productId: string) =>
  fetchSummary(productId, DEFAULT_TYPE);
export const likeProduct = (productId: string) => bumpLike(productId, DEFAULT_TYPE);
export const shareProduct = (productId: string) => bumpShare(productId, DEFAULT_TYPE);
export const addReview = (productId: string, review: Review) =>
  submitReview(productId, DEFAULT_TYPE, review.stars);

// --- generic entity API (used by useEntityEngagement.ts) --------------------
export const getEngagementForEntity = (id: string, entityType: string) =>
  fetchSummary(id, entityType);
export const likeEntity = (id: string, entityType: string) => bumpLike(id, entityType);
export const shareEntity = (id: string, entityType: string) => bumpShare(id, entityType);
export const addEntityReview = (id: string, entityType: string, review: Review) =>
  submitReview(id, entityType, review.stars);
