import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { registerSocketHandlers } from './socket/handlers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app  = express()
const http = createServer(app)
const io   = new Server(http, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
  transports: ['websocket']
})

// Serve built client in production
app.use(express.static(join(__dirname, 'public')))
app.use(express.json())

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }))

// Socket.io
registerSocketHandlers(io)

const PORT = process.env.PORT || 3000
http.listen(PORT, () => console.log(`[server] listening on :${PORT}`))