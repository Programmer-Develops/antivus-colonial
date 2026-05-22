// ─── Core game state + logic (server-authoritative) ──────────────────────────
import { v4 as uuid } from 'uuid'

const COLONY_COLORS = ['#4ade80','#f87171','#60a5fa','#facc15','#a78bfa','#fb923c','#34d399','#f472b6']
const SPAWN_POSITIONS = [ {x:200,y:200}, {x:1800,y:200}, {x:200,y:1800}, {x:1800,y:1800},
                          {x:1000,y:200}, {x:1000,y:1800}, {x:200,y:1000}, {x:1800,y:1000} ]
const TICK_RATE = 50  // ms, set in handlers

const CASTE_STATS = {
  queen:      { hp: 500, speed: 0,   damage: 5,  range: 30 },
  worker:     { hp: 30,  speed: 2.5, damage: 3,  range: 15 },
  soldier:    { hp: 80,  speed: 1.8, damage: 12, range: 20 },
  scout:      { hp: 20,  speed: 4.5, damage: 2,  range: 15 },
  builder:    { hp: 35,  speed: 2,   damage: 3,  range: 15 },
  ranger:     { hp: 20,  speed: 2,   damage: 8,  range: 80 },
  farmer:     { hp: 25,  speed: 1.5, damage: 2,  range: 15 },
  bombardier: { hp: 60,  speed: 1.5, damage: 80, range: 25 }
}

export class ColonyGame {
  constructor(map) {
    this.map       = map
    this.colonies  = new Map()   // playerId -> ColonyState
    this.dayTimer  = 240         // seconds
    this.dayPhase  = 'day'
    this._colorIdx = 0
  }

  addColony(playerId) {
    const pos   = SPAWN_POSITIONS[this.colonies.size % SPAWN_POSITIONS.length]
    const color = COLONY_COLORS[this._colorIdx++ % COLONY_COLORS.length]
    const queenId = uuid()
    this.colonies.set(playerId, {
      color,
      morale: 100,
      resources: { leaf: 20, fungus: 0, honeydew: 0, carapace: 0 },
      chambers: {},
      ants: {
        [queenId]: {
          id: queenId, caste: 'queen',
          position: { ...pos },
          target: null,
          hp: CASTE_STATS.queen.hp,
          maxHp: CASTE_STATS.queen.hp,
          attackCooldown: 0
        }
      }
    })

    // Spawn 4 starter workers
    for (let i = 0; i < 4; i++) {
      this._spawnAnt(playerId, 'worker', {
        x: pos.x + (Math.random() - 0.5) * 60,
        y: pos.y + (Math.random() - 0.5) * 60
      })
    }
  }

  removeColony(playerId) { this.colonies.delete(playerId) }

  _spawnAnt(playerId, caste, position) {
    const colony = this.colonies.get(playerId)
    if (!colony) return
    const id = uuid()
    const stats = CASTE_STATS[caste]
    colony.ants[id] = { id, caste, position: { ...position }, target: null,
                        hp: stats.hp, maxHp: stats.hp, attackCooldown: 0 }
    return id
  }

  moveAnt(playerId, antId, target) {
    const colony = this.colonies.get(playerId)
    if (!colony || !colony.ants[antId]) return
    colony.ants[antId].target = target
  }

  attack(playerId, antId, targetId) {
    const attColony = this.colonies.get(playerId)
    if (!attColony || !attColony.ants[antId]) return null

    // Find target colony
    for (const [defId, defColony] of this.colonies) {
      if (defId === playerId) continue
      if (!defColony.ants[targetId]) continue

      const att = attColony.ants[antId]
      const def = defColony.ants[targetId]
      const stats = CASTE_STATS[att.caste]
      if (att.attackCooldown > 0) return null

      // Range check
      const dx = att.position.x - def.position.x
      const dy = att.position.y - def.position.y
      if (Math.sqrt(dx*dx + dy*dy) > stats.range) return null

      def.hp -= stats.damage
      att.attackCooldown = 30   // ticks

      if (def.hp <= 0) {
        const killText = `${att.caste} killed ${def.caste}`
        delete defColony.ants[targetId]
        if (def.caste === 'queen') defColony.morale = Math.max(0, defColony.morale - 40)
        return { text: killText, attacker: playerId, victim: defId }
      }
      return null
    }
    return null
  }

  buildChamber(playerId, type, position) {
    const colony = this.colonies.get(playerId)
    if (!colony) return
    const COSTS = { nursery: 30, granary: 20, barracks: 40, tunnel: 15 }
    const cost = COSTS[type] || 999
    if (colony.resources.leaf < cost) return
    colony.resources.leaf -= cost
    const id = uuid()
    colony.chambers[id] = { id, type, position, hp: 100, maxHp: 100 }
  }

  // Called every 50ms tick
  tick() {
    const changes = {}

    for (const [playerId, colony] of this.colonies) {
      const stats = CASTE_STATS
      for (const ant of Object.values(colony.ants)) {
        // Move toward target
        if (ant.target && ant.caste !== 'queen') {
          const speed = stats[ant.caste].speed
          const dx = ant.target.x - ant.position.x
          const dy = ant.target.y - ant.position.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist > speed) {
            ant.position.x += (dx / dist) * speed
            ant.position.y += (dy / dist) * speed
          } else {
            ant.position = { ...ant.target }
            ant.target = null
          }
        }
        // Cool down attack
        if (ant.attackCooldown > 0) ant.attackCooldown--
      }

      // Passive food income from farmers
      const farmers = Object.values(colony.ants).filter(a => a.caste === 'farmer').length
      colony.resources.leaf += farmers * 0.05   // 1 leaf per 20 ticks per farmer

      changes[playerId] = {
        ants: colony.ants,
        resources: colony.resources,
        morale: colony.morale
      }
    }
    return changes
  }

  tickDayCycle() {
    this.dayTimer--
    if (this.dayTimer <= 0) {
      this.dayPhase = this.dayPhase === 'day' ? 'night' : 'day'
      this.dayTimer = 240
      return this.dayPhase
    }
    return null
  }

  checkWinner() {
    const alive = [...this.colonies.entries()].filter(([, c]) => {
      const queen = Object.values(c.ants).find(a => a.caste === 'queen')
      return !!queen
    })
    if (alive.length === 1) return alive[0][0]
    return null
  }

  getColonies() {
    const out = {}
    for (const [id, colony] of this.colonies) out[id] = colony
    return out
  }
}