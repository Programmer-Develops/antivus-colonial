// ─── Redis client (Upstash via ioredis) ──────────────────────────────────────
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true
})

redis.on('connect',      () => console.log('[redis] connected'))
redis.on('error', (err) => console.error('[redis] error:', err.message))

// Helper: store live game state (expires after 2h if game crashes)
export async function cacheGameState(roomId, state) {
  await redis.setex(`game:${roomId}`, 7200, JSON.stringify(state))
}

export async function getGameState(roomId) {
  const raw = await redis.get(`game:${roomId}`)
  return raw ? JSON.parse(raw) : null
}

export async function deleteGameState(roomId) {
  await redis.del(`game:${roomId}`)
}

export { redis }