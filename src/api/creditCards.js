import supabase from '../supabaseClient.js';
import { normalizeCard } from './normalizeCard.js';

export const fetchCreditCards = async () => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('is_sponsored', { ascending: false })
    .order('sponsor_rank', { ascending: true });
  if (error) {
    console.error('Error fetching credit cards:', error.message);
    throw error;
  }
  return (data || []).map(normalizeCard);
};

export const fetchCreditCard = async (id) => {
  // id can be the Postgres UUID or the original CDR productId. Try both.
  const looksLikeUuid = /^[0-9a-f-]{36}$/i.test(id);

  const primary = await supabase
    .from('credit_cards')
    .select('*')
    .eq(looksLikeUuid ? 'id' : 'product_id', id)
    .maybeSingle();

  if (primary.error) {
    console.error('Error fetching credit card:', primary.error.message);
    throw primary.error;
  }
  if (primary.data) return normalizeCard(primary.data);

  // Fall back to the other lookup style.
  const fallback = await supabase
    .from('credit_cards')
    .select('*')
    .eq(looksLikeUuid ? 'product_id' : 'id', id)
    .maybeSingle();

  if (fallback.error) throw fallback.error;
  return fallback.data ? normalizeCard(fallback.data) : null;
};
