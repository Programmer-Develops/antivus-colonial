// ─── Supabase client for persistent data ─────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // server-side uses service role, never anon
)

export async function saveGameResult(summary) {
  try {
    const { error } = await supabase
      .from('game_sessions')
      .insert({
        room_id:    summary.id,
        map_seed:   summary.mapSeed,
        player_ids: summary.players,
        duration_ms: summary.duration,
        ended_at:   new Date().toISOString()
      })
    if (error) console.error('[db] saveGameResult error:', error.message)
  } catch (e) {
    console.error('[db] saveGameResult exception:', e)
  }
}

export async function getLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from('scores')
    .select('player_id, username, kills, score')
    .order('score', { ascending: false })
    .limit(limit)
  if (error) console.error('[db] getLeaderboard error:', error.message)
  return data || []
}

export async function upsertPlayer(playerId, username) {
  const { error } = await supabase
    .from('players')
    .upsert({ id: playerId, username, last_seen: new Date().toISOString() })
  if (error) console.error('[db] upsertPlayer error:', error.message)
}

export { supabase }