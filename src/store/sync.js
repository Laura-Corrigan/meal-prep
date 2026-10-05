// Optional cloud sync so both phones share one plan. The database only exposes
// two functions (see supabase/migrations) keyed by a secret household id; the
// table itself is not readable with the public key.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

export const syncEnabled = !!client

const withTimeout = (p, ms = 6000) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Sync timed out')), ms))])

export async function pull(householdId) {
  if (!client) return null
  const { data, error } = await withTimeout(client.rpc('mp_load', { p_id: householdId }))
  if (error) throw error
  return data?.[0]?.data || null
}

export async function push(householdId, state) {
  if (!client) return
  const { error } = await withTimeout(client.rpc('mp_save', { p_id: householdId, p_data: state }))
  if (error) throw error
}
