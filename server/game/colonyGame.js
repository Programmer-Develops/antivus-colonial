import { v4 as uuid } from 'uuid'

const COLONY_COLORS  = ['#4ade80','#f87171','#60a5fa','#facc15','#a78bfa','#fb923c','#34d399','#f472b6']
const SPAWN_POSITIONS = [
  {x:200,y:200},{x:1800,y:200},{x:200,y:1800},{x:1800,y:1800},
  {x:1000,y:200},{x:1000,y:1800},{x:200,y:1000},{x:1800,y:1000}
]

const CASTE_STATS = {
  queen:      { hp:500, speed:0,   damage:5,  range:30,  cost:0   },
  worker:     { hp:30,  speed:2.5, damage:3,  range:15,  cost:10  },
  soldier:    { hp:80,  speed:1.8, damage:12, range:20,  cost:25  },
  scout:      { hp:20,  speed:4.5, damage:2,  range:15,  cost:15  },
  builder:    { hp:35,  speed:2,   damage:3,  range:15,  cost:20  },
  ranger:     { hp:20,  speed:2,   damage:8,  range:80,  cost:30  },
  farmer:     { hp:25,  speed:1.5, damage:2,  range:15,  cost:20  },
  bombardier: { hp:60,  speed:1.5, damage:80, range:25,  cost:60  }
}

const CHAMBER_COSTS    = { nursery:30, granary:20, barracks:40, tunnel:15 }
const CHAMBER_EFFECTS  = {
  nursery:  { spawnBonus: 0.3  },   // +30% spawn rate
  granary:  { storageBonus: 50 },   // +50 max leaf storage
  barracks: { armyCap: 5       },   // +5 military ant cap
  tunnel:   { speedBonus: 0.2  }    // +20% speed in tunnel zone
}

const FOOD_TILE_INCOME = 0.08   // leaf per worker per tick near food
const TILE             = 32
const FOOD_NOISE_THRESHOLD = 0.70

export class ColonyGame {
  constructor(map) {
    this.map         = map
    this.colonies    = new Map()
    this.dayTimer    = 240
    this.dayPhase    = 'day'
    this._colorIdx   = 0
    this._maxPlayers = 0
    this._foodTiles  = this._buildFoodIndex(map)
  }

  // Pre-compute set of food tile world coords for fast lookup
  _buildFoodIndex(map) {
    const set = []
    if (!map?.tiles) return set
    for (const tile of map.tiles) {
      if (tile.biome === 'food') {
        set.push({ x: tile.x * TILE + 16, y: tile.y * TILE + 16 })
      }
    }
    return set
  }

  addColony(playerId) {
    const idx   = this.colonies.size
    const pos   = SPAWN_POSITIONS[idx % SPAWN_POSITIONS.length]
    const color = COLONY_COLORS[this._colorIdx++ % COLONY_COLORS.length]
    const qid   = uuid()

    this.colonies.set(playerId, {
      color, morale: 100,
      resources: { leaf: 50, fungus: 0, honeydew: 0, carapace: 0 },
      chambers:  {},
      ants: {
        [qid]: {
          id: qid, caste: 'queen',
          position: { ...pos }, target: null,
          hp: CASTE_STATS.queen.hp, maxHp: CASTE_STATS.queen.hp,
          attackCooldown: 0
        }
      },
      spawnTimer: 0,
      // Chamber effect accumulators
      effects: { spawnBonus:0, storageBonus:0, armyCap:10, speedBonus:0 }
    })

    if (this.colonies.size > this._maxPlayers) this._maxPlayers = this.colonies.size

    for (let i = 0; i < 4; i++) {
      this._spawnAnt(playerId, 'worker', {
        x: pos.x + (Math.random()-0.5)*80,
        y: pos.y + (Math.random()-0.5)*80
      })
    }
  }

  removeColony(pid) { this.colonies.delete(pid) }

  _spawnAnt(pid, caste, position) {
    const colony = this.colonies.get(pid)
    if (!colony) return
    const id    = uuid()
    const stats = CASTE_STATS[caste]
    colony.ants[id] = {
      id, caste,
      position: { ...position }, target: null,
      hp: stats.hp, maxHp: stats.hp, attackCooldown: 0
    }
    return id
  }

  // ── Public commands ────────────────────────────────────────────────────────
  moveAnt(pid, antId, target) {
    const c = this.colonies.get(pid)
    if (c?.ants[antId]) c.ants[antId].target = target
  }

  recruitAnt(pid, caste) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok: false, msg: 'No colony' }
    const stats = CASTE_STATS[caste]
    if (!stats) return { ok: false, msg: 'Unknown caste' }
    if (colony.resources.leaf < stats.cost) {
      return { ok: false, msg: `Need ${stats.cost} leaf (have ${Math.floor(colony.resources.leaf)})` }
    }
    const totalAnts = Object.keys(colony.ants).length
    const maxAnts   = 20 + colony.effects.armyCap
    if (totalAnts >= maxAnts) return { ok: false, msg: `Colony full (max ${maxAnts})` }

    colony.resources.leaf -= stats.cost
    const queen = Object.values(colony.ants).find(a => a.caste === 'queen')
    const pos   = queen
      ? { x: queen.position.x + (Math.random()-0.5)*80, y: queen.position.y + (Math.random()-0.5)*80 }
      : { x: 200, y: 200 }
    this._spawnAnt(pid, caste, pos)
    return { ok: true }
  }

  buildChamber(pid, type, position) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok: false, msg: 'No colony' }
    const cost = CHAMBER_COSTS[type]
    if (!cost) return { ok: false, msg: 'Unknown chamber' }
    if (colony.resources.leaf < cost) {
      return { ok: false, msg: `Need ${cost} leaf` }
    }
    colony.resources.leaf -= cost
    const id = uuid()
    colony.chambers[id] = { id, type, position, hp:100, maxHp:100, active:true }
    this._recomputeEffects(colony)
    return { ok: true }
  }

  attack(pid, antId, targetId) {
    const attC = this.colonies.get(pid)
    if (!attC?.ants[antId]) return null
    for (const [defId, defC] of this.colonies) {
      if (defId === pid || !defC.ants[targetId]) continue
      const att = attC.ants[antId], def = defC.ants[targetId]
      if (att.attackCooldown > 0) return null
      const dx = att.position.x - def.position.x
      const dy = att.position.y - def.position.y
      if (Math.sqrt(dx*dx+dy*dy) > CASTE_STATS[att.caste].range) return null
      def.hp -= CASTE_STATS[att.caste].damage
      att.attackCooldown = 30
      if (def.hp <= 0) {
        const txt = `${att.caste} killed ${def.caste}`
        delete defC.ants[targetId]
        if (def.caste === 'queen') defC.morale = Math.max(0, defC.morale - 40)
        return { text: txt, attacker: pid, victim: defId }
      }
      return null
    }
    return null
  }

  // ── Per-tick simulation ────────────────────────────────────────────────────
  tick() {
    const changes = {}

    for (const [pid, colony] of this.colonies) {
      // Move ants
      for (const ant of Object.values(colony.ants)) {
        if (ant.target && ant.caste !== 'queen') {
          const spd = CASTE_STATS[ant.caste].speed * (1 + colony.effects.speedBonus)
          const dx  = ant.target.x - ant.position.x
          const dy  = ant.target.y - ant.position.y
          const d   = Math.sqrt(dx*dx+dy*dy)
          if (d > spd) {
            ant.position.x += (dx/d)*spd
            ant.position.y += (dy/d)*spd
          } else {
            ant.position = { ...ant.target }
            ant.target   = null
          }
        }
        if (ant.attackCooldown > 0) ant.attackCooldown--
      }

      // Workers near food tiles gather resources
      for (const ant of Object.values(colony.ants)) {
        if (ant.caste !== 'worker' && ant.caste !== 'farmer') continue
        for (const ft of this._foodTiles) {
          const dx = ant.position.x - ft.x
          const dy = ant.position.y - ft.y
          if (Math.sqrt(dx*dx+dy*dy) < 48) {
            colony.resources.leaf += FOOD_TILE_INCOME
            break
          }
        }
      }

      // Passive farmer income
      const farmers = Object.values(colony.ants).filter(a => a.caste === 'farmer').length
      colony.resources.leaf += farmers * 0.03

      // Cap storage
      const maxStorage = 200 + colony.effects.storageBonus
      colony.resources.leaf = Math.min(colony.resources.leaf, maxStorage)

      // Auto-spawn from nursery effect every N ticks
      colony.spawnTimer = (colony.spawnTimer || 0) + 1
      const spawnInterval = Math.max(100, Math.floor(300 * (1 - colony.effects.spawnBonus)))
      if (colony.spawnTimer >= spawnInterval) {
        colony.spawnTimer = 0
        const totalAnts = Object.keys(colony.ants).length
        if (totalAnts < 20 + colony.effects.armyCap && colony.resources.leaf >= 5) {
          colony.resources.leaf -= 5
          const queen = Object.values(colony.ants).find(a => a.caste === 'queen')
          if (queen) this._spawnAnt(pid, 'worker', {
            x: queen.position.x + (Math.random()-0.5)*60,
            y: queen.position.y + (Math.random()-0.5)*60
          })
        }
      }

      changes[pid] = {
        ants:      colony.ants,
        resources: colony.resources,
        morale:    colony.morale,
        chambers:  colony.chambers,
        effects:   colony.effects
      }
    }
    return changes
  }

  _recomputeEffects(colony) {
    const e = { spawnBonus:0, storageBonus:0, armyCap:10, speedBonus:0 }
    for (const ch of Object.values(colony.chambers)) {
      if (!ch.active) continue
      const fx = CHAMBER_EFFECTS[ch.type]
      if (!fx) continue
      if (fx.spawnBonus)   e.spawnBonus   += fx.spawnBonus
      if (fx.storageBonus) e.storageBonus += fx.storageBonus
      if (fx.armyCap)      e.armyCap      += fx.armyCap
      if (fx.speedBonus)   e.speedBonus   += fx.speedBonus
    }
    colony.effects = e
  }

  tickDayCycle() {
    if (--this.dayTimer <= 0) {
      this.dayPhase = this.dayPhase === 'day' ? 'night' : 'day'
      this.dayTimer = 240
      return this.dayPhase
    }
    return null
  }

  checkWinner() {
    if (this._maxPlayers < 2) return null
    if (this.colonies.size === 0) return null
    const alive = [...this.colonies.entries()].filter(([,c]) =>
      Object.values(c.ants).some(a => a.caste === 'queen'))
    return alive.length === 1 ? alive[0][0] : null
  }

  getColonies() {
    const out = {}
    for (const [id, c] of this.colonies) out[id] = c
    return out
  }
}