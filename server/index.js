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

// Allow requests from Vite dev server
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

const io = new Server(http, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
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