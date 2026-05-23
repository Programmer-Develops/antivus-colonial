import { v4 as uuid }  from 'uuid'
import { ColonyGame }  from './colonyGame.js'
import { generateMap } from '../map/generator.js'

export class RoomManager {
  constructor() { this._rooms = new Map() }

  create(hostId, opts = {}) {
    const id      = uuid()
    const mapSeed = Math.random() * 999999 | 0
    const map     = generateMap(mapSeed)
    const game    = new ColonyGame(map)
    const room    = {
      id, mapSeed, map, game,
      players: [hostId],
      maxPlayers: opts.maxPlayers || 6,
      playing: true,          // ← start immediately, no need to wait for 2 players
      createdAt: Date.now(),
      getColonies: () => game.getColonies(),
      removePlayer: (pid) => {
        room.players = room.players.filter(p => p !== pid)
        game.removeColony(pid)
      },
      isEmpty:    () => room.players.length === 0,
      isPlaying:  () => room.playing,
      getSummary: () => ({
        id, mapSeed,
        players: room.players,
        duration: Date.now() - room.createdAt
      })
    }
    game.addColony(hostId)
    this._rooms.set(id, room)
    return room
  }

  join(roomId, playerId) {
    const room = this._rooms.get(roomId)
    if (!room || room.players.length >= room.maxPlayers) return null
    room.players.push(playerId)
    room.game.addColony(playerId)
    return room
  }

  getByPlayer(playerId) {
    for (const room of this._rooms.values()) {
      if (room.players.includes(playerId)) return room
    }
    return null
  }

  delete(roomId) { this._rooms.delete(roomId) }
  all()          { return this._rooms.values() }
}