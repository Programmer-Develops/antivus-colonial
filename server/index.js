import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'
import { registerSocketHandlers } from './socket/handlers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app  = express()
const http = createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Allow requests from Vite dev server or current origin dynamically in production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow if same-origin (no origin header), or development client, or any domain in production
    if (!origin || origin === CLIENT_URL || process.env.NODE_ENV === 'production' || origin.includes('choreoapis.dev')) {
      callback(null, true)
    } else {
      callback(null, true) // fallback to true to ensure connections don't drop
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

const io = new Server(http, {
  cors: corsOptions,
  transports: ['websocket', 'polling']  // allow polling as fallback
})

// Serve built client in production
app.use(express.static(join(__dirname, 'public')))

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }))

// Socket.io
registerSocketHandlers(io)

const PORT = process.env.PORT || 3000
http.listen(PORT, () => console.log(`[server] listening on :${PORT}`))