import { RoomManager }    from '../game/roomManager.js'
import { saveGameResult } from '../db/supabase.js'

const rooms = new RoomManager()

function getRoomList() {
  return [...rooms.all()]
    .filter(r => !r.isFull())
    .map(r => ({ id:r.id, playerCount:r.players.length, maxPlayers:r.maxPlayers, hostName:r.hostName }))
}

export function registerSocketHandlers(io) {

  io.on('connection', (socket) => {
    console.log('[socket] connect:', socket.id)
    socket.emit('rooms:list', getRoomList())

    socket.on('room:create', (opts) => {
      const room = rooms.create(socket.id, opts)
      socket.join(room.id)
      // Set colony name from opts
      room.game.setColonyName(socket.id, opts.name || 'Colony')
      socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
      socket.emit('state:full',  { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('room:join', ({ roomId, name }) => {
      const room = rooms.join(roomId, socket.id)
      if (!room) return socket.emit('error', { msg:'Room not found or full' })
      room.game.setColonyName(socket.id, name || 'Colony')
      socket.join(roomId)
      socket.emit('room:joined', { roomId, players:room.players, mapSeed:room.mapSeed })
      io.to(roomId).emit('room:players', room.players)
      socket.emit('state:full', { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('room:quickjoin', ({ name }) => {
      const open = [...rooms.all()].find(r => !r.isFull() && r.players.length > 0)
      if (open) {
        const room = rooms.join(open.id, socket.id)
        if (room) {
          room.game.setColonyName(socket.id, name || 'Colony')
          socket.join(room.id)
          socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
          io.to(room.id).emit('room:players', room.players)
          socket.emit('state:full', { colonies:room.getColonies() })
          io.emit('rooms:list', getRoomList())
          return
        }
      }
      const room = rooms.create(socket.id, { name, maxPlayers:6 })
      room.game.setColonyName(socket.id, name || 'Colony')
      socket.join(room.id)
      socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
      socket.emit('state:full',  { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('rooms:refresh', () => {
      socket.emit('rooms:list', getRoomList())
    })

    let cmdCount = 0
    setInterval(() => { cmdCount = 0 }, 1000)

    socket.on('ants:move', ({ antIds, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const id of antIds) room.game.moveAnt(socket.id, id, target)
    })

    socket.on('ant:move', ({ antId, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.moveAnt(socket.id, antId, target)
    })

    socket.on('ant:recruit', ({ caste }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const r = room.game.recruitAnt(socket.id, caste)
      if (!r.ok) socket.emit('error', { msg:r.msg })
    })

    socket.on('chamber:build', ({ type, position }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const r = room.game.buildChamber(socket.id, type, position)
      if (!r.ok) socket.emit('error', { msg:r.msg })
    })

    socket.on('ants:attack', ({ antIds, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const id of antIds) {
        const kill = room.game.attack?.(socket.id, id, targetId)
        if (kill) io.to(room.id).emit('kill:feed', kill)
      }
    })

    socket.on('disconnect', async () => {
      console.log('[socket] disconnect:', socket.id)
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.removePlayer(socket.id)
      io.to(room.id).emit('room:players', room.players)
      if (room.isEmpty()) {
        await saveGameResult(room.getSummary())
        rooms.delete(room.id)
      }
      io.emit('rooms:list', getRoomList())
    })
  })

  // Game tick 20Hz
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const result = room.game.tick()
      if (result?.changes) io.to(room.id).emit('state:delta', result.changes)
      if (result?.kills?.length) {
        for (const kill of result.kills) io.to(room.id).emit('kill:feed', kill)
      }
      const winner = room.game.checkWinner()
      if (winner) {
        const winnerColony = room.game.getColonies()[winner]
        io.to(room.id).emit('game:over', { winner, winnerName: winnerColony?.name || 'Unknown' })
        saveGameResult(room.getSummary())
        rooms.delete(room.id)
      }
    }
  }, 50)

  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const phase = room.game.tickDayCycle()
      if (phase) io.to(room.id).emit('day:cycle', { phase })
    }
  }, 1000)
}