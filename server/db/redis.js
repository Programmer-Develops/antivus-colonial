// ─── Redis client (Upstash via ioredis) ──────────────────────────────────────
import Redis from 'ioredis'

let redis = null

if (process.env.REDIS_URL && process.env.REDIS_URL !== 'placeholder') {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined
  })
  redis.on('connect', () => console.log('[redis] connected'))
  redis.on('error',  (e) => console.error('[redis] error:', e.message))
} else {
  console.warn('[redis] no REDIS_URL set — caching disabled')
}

export async function cacheGameState(roomId, state) {
  if (!redis) return
  await redis.setex(`game:${roomId}`, 7200, JSON.stringify(state))
}

export async function getGameState(roomId) {
  if (!redis) return null
  const raw = await redis.get(`game:${roomId}`)
  return raw ? JSON.parse(raw) : null
}

export async function deleteGameState(roomId) {
  if (!redis) return
  await redis.del(`game:${roomId}`)
}

export { redis }