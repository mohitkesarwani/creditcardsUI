import supabase from '../supabaseClient.js';

// There's no `deposits` table yet — the legacy server returned an empty list
// as a placeholder. Until the schema is added, degrade gracefully so the UI
// renders its empty state without throwing.

const normalize = (row) => (row ? { ...row, id: row.id || row._id } : row);

export const fetchDeposits = async () => {
  const { data, error } = await supabase.from('deposits').select('*');
  if (error) {
    console.warn('[deposits] returning empty list:', error.message);
    return [];
  }
  return (data || []).map(normalize);
};

export const fetchDeposit = async (id) => {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.warn('[deposits] fetch by id failed:', error.message);
    return null;
  }
  return normalize(data);
};
