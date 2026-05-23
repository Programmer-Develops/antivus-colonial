import { v4 as uuid }  from 'uuid'
import { ColonyGame }  from './colonyGame.js'
import { generateMap } from '../map/generator.js'

const MAX_PLAYERS_DEFAULT = 6

export class RoomManager {
  constructor() { this._rooms = new Map() }

  create(hostId, opts = {}) {
    const id         = uuid()
    const mapSeed    = Math.random() * 999999 | 0
    const map        = generateMap(mapSeed)
    const game       = new ColonyGame(map)
    const maxPlayers = Math.min(opts.maxPlayers || MAX_PLAYERS_DEFAULT, 8)

    const room = {
      id, mapSeed, map, game,
      players:    [hostId],
      maxPlayers,
      hostName:   opts.name || 'Unknown',
      playing:    true,
      createdAt:  Date.now(),
      getColonies: () => game.getColonies(),
      removePlayer: (pid) => {
        room.players = room.players.filter(p => p !== pid)
        game.removeColony(pid)
      },
      isEmpty:   () => room.players.length === 0,
      isFull:    () => room.players.length >= room.maxPlayers,
      isPlaying: () => room.playing,
      getSummary: () => ({
        id, mapSeed,
        players:  room.players,
        duration: Date.now() - room.createdAt
      })
    }

    game.addColony(hostId)
    this._rooms.set(id, room)
    return room
  }

  join(roomId, playerId) {
    const room = this._rooms.get(roomId)
    if (!room || room.isFull()) return null
    room.players.push(playerId)
    room.game.addColony(playerId)
    return room
  }

  getByPlayer(pid) {
    for (const room of this._rooms.values()) {
      if (room.players.includes(pid)) return room
    }
    return null
  }

  delete(roomId) { this._rooms.delete(roomId) }
  all()          { return this._rooms.values() }
}