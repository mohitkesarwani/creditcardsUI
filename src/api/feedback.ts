import supabase from '../supabaseClient.js';
import { normalizeEngagement } from './normalizeCard.js';

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
  commentText?: string;
}

export const postComment = async (payload: CommentPayload) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: payload.userId,
      entity_id: payload.entityId,
      entity_type: payload.entityType,
      comment_text: payload.commentText,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// Maps snake_case Postgres columns to the camelCase fields the UI reads.
const camelComment = (row: any) =>
  row && {
    ...row,
    userId: row.user_id,
    entityId: row.entity_id,
    entityType: row.entity_type,
    commentText: row.comment_text,
    createdAt: row.created_at,
  };

export const getComments = async (entityId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(camelComment);
};

export const postReview = async (payload: ReviewPayload) => {
  // Funnel through the apply_review RPC so engagement aggregates stay in sync.
  const { data, error } = await supabase.rpc('apply_review', {
    p_user_id: payload.userId,
    p_entity_type: payload.entityType,
    p_entity_id: payload.entityId,
    p_rating: payload.rating,
  });
  if (error) throw error;

  // The old REST endpoint silently accepted a comment alongside a review.
  // Preserve that: if the caller passed commentText, also write a comment row.
  if (payload.commentText && payload.commentText.trim()) {
    await postComment({
      userId: payload.userId,
      entityId: payload.entityId,
      entityType: payload.entityType,
      commentText: payload.commentText.trim(),
    });
  }

  return normalizeEngagement(data);
};

export const getReviewSummary = async (entityId: string, entityType = 'credit-cards') => {
  const { data, error } = await supabase
    .from('engagement_summary')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();
  if (error) throw error;
  return normalizeEngagement(data);
};
