import { v4 as uuid } from 'uuid'

const COLONY_COLORS   = ['#4ade80','#f87171','#60a5fa','#facc15','#a78bfa','#fb923c','#34d399','#f472b6']
const SPAWN_POSITIONS = [
  {x:200,y:200},{x:1800,y:200},{x:200,y:1800},{x:1800,y:1800},
  {x:1000,y:200},{x:1000,y:1800},{x:200,y:1000},{x:1800,y:1000}
]
const TERRITORY_RADIUS  = 180   // px — colony's claimed zone radius
const CHAMBER_RADIUS    = 60    // must be inside territory to build
const FOOD_INCOME       = 0.08
const TILE              = 32

const CASTE_STATS = {
  queen:      { hp:500, speed:0,   damage:5,  range:35,  cost:0,  attackRate:40 },
  worker:     { hp:30,  speed:2.5, damage:3,  range:18,  cost:10, attackRate:25 },
  soldier:    { hp:80,  speed:1.8, damage:12, range:22,  cost:25, attackRate:20 },
  scout:      { hp:20,  speed:4.5, damage:2,  range:18,  cost:15, attackRate:30 },
  builder:    { hp:35,  speed:2,   damage:3,  range:18,  cost:20, attackRate:25 },
  ranger:     { hp:20,  speed:2,   damage:8,  range:100, cost:30, attackRate:35 },
  farmer:     { hp:25,  speed:1.5, damage:2,  range:18,  cost:20, attackRate:30 },
  bombardier: { hp:60,  speed:1.5, damage:80, range:28,  cost:60, attackRate:60 }
}

const CHAMBER_COSTS   = { nursery:30, granary:20, barracks:40, tunnel:15 }
const CHAMBER_EFFECTS = {
  nursery:  { spawnBonus:0.3  },
  granary:  { storageBonus:50 },
  barracks: { armyCap:5       },
  tunnel:   { speedBonus:0.2  }
}
const CHAMBER_HP = { nursery:120, granary:80, barracks:150, tunnel:60 }

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

  _buildFoodIndex(map) {
    if (!map?.tiles) return []
    return map.tiles
      .filter(t => t.biome === 'food')
      .map(t => ({ x: t.x*TILE+16, y: t.y*TILE+16 }))
  }

  // ── Colony setup ───────────────────────────────────────────────────────────
  addColony(playerId) {
    const idx   = this.colonies.size
    const pos   = SPAWN_POSITIONS[idx % SPAWN_POSITIONS.length]
    const color = COLONY_COLORS[this._colorIdx++ % COLONY_COLORS.length]
    const qid   = uuid()

    this.colonies.set(playerId, {
      color, morale: 100,
      name: 'Colony',
      resources:   { leaf:50, fungus:0, honeydew:0, carapace:0 },
      chambers:    {},
      territory:   { center: { ...pos }, radius: TERRITORY_RADIUS },
      ants:        {
        [qid]: {
          id:qid, caste:'queen',
          position:{ ...pos }, target:null,
          hp: CASTE_STATS.queen.hp, maxHp: CASTE_STATS.queen.hp,
          attackCooldown:0, autoAttack:true
        }
      },
      spawnTimer:  0,
      effects:     { spawnBonus:0, storageBonus:0, armyCap:10, speedBonus:0 }
    })

    if (this.colonies.size > this._maxPlayers) this._maxPlayers = this.colonies.size

    for (let i = 0; i < 4; i++) {
      this._spawnAnt(playerId, 'worker', {
        x: pos.x + (Math.random()-0.5)*80,
        y: pos.y + (Math.random()-0.5)*80
      })
    }
  }

  setColonyName(playerId, name) {
    const c = this.colonies.get(playerId)
    if (c) c.name = name
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
      hp: stats.hp, maxHp: stats.hp,
      attackCooldown: 0, autoAttack: true
    }
    return id
  }

  // ── Commands ───────────────────────────────────────────────────────────────
  moveAnt(pid, antId, target) {
    const c = this.colonies.get(pid)
    if (c?.ants[antId]) c.ants[antId].target = target
  }

  recruitAnt(pid, caste) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok:false, msg:'No colony' }
    const stats = CASTE_STATS[caste]
    if (!stats || stats.cost === 0) return { ok:false, msg:'Cannot recruit this caste' }
    if (colony.resources.leaf < stats.cost)
      return { ok:false, msg:`Need ${stats.cost} leaf (have ${Math.floor(colony.resources.leaf)})` }
    const total = Object.keys(colony.ants).length
    const max   = 20 + colony.effects.armyCap
    if (total >= max) return { ok:false, msg:`Colony full (max ${max} ants)` }

    colony.resources.leaf -= stats.cost
    const queen = Object.values(colony.ants).find(a => a.caste === 'queen')
    const base  = queen?.position || colony.territory.center
    this._spawnAnt(pid, caste, {
      x: base.x + (Math.random()-0.5)*80,
      y: base.y + (Math.random()-0.5)*80
    })
    return { ok:true }
  }

  buildChamber(pid, type, position) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok:false, msg:'No colony' }

    // Must be inside own territory
    const tc = colony.territory.center
    const dx = position.x - tc.x
    const dy = position.y - tc.y
    if (Math.sqrt(dx*dx+dy*dy) > colony.territory.radius)
      return { ok:false, msg:'Must build inside your territory' }

    const cost = CHAMBER_COSTS[type]
    if (!cost) return { ok:false, msg:'Unknown chamber type' }
    if (colony.resources.leaf < cost)
      return { ok:false, msg:`Need ${cost} leaf` }

    colony.resources.leaf -= cost
    const id   = uuid()
    const maxHp = CHAMBER_HP[type] || 100
    colony.chambers[id] = { id, type, position, hp:maxHp, maxHp, active:true }
    this._recomputeEffects(colony)
    return { ok:true, chamberId:id }
  }

  // ── Auto-attack logic ──────────────────────────────────────────────────────
  _autoAttackTick(pid, colony) {
    const kills = []
    for (const [antId, ant] of Object.entries(colony.ants)) {
      if (ant.attackCooldown > 0) continue
      const stats = CASTE_STATS[ant.caste]

      // Find nearest enemy ant within range
      for (const [defId, defColony] of this.colonies) {
        if (defId === pid) continue

        // Check enemy ants
        for (const [defAntId, defAnt] of Object.entries(defColony.ants)) {
          const dx   = ant.position.x - defAnt.position.x
          const dy   = ant.position.y - defAnt.position.y
          const dist = Math.sqrt(dx*dx+dy*dy)
          if (dist <= stats.range) {
            defAnt.hp -= stats.damage
            ant.attackCooldown = stats.attackRate
            if (defAnt.hp <= 0) {
              kills.push({
                text: `${colony.name || 'Colony'}'s ${ant.caste} killed ${defColony.name || 'Enemy'}'s ${defAnt.caste}`,
                attacker: pid, victim: defId
              })
              delete defColony.ants[defAntId]
              if (defAnt.caste === 'queen') defColony.morale = Math.max(0, defColony.morale - 50)
            }
            break  // one target per tick per ant
          }
        }

        if (ant.attackCooldown > 0) continue  // already attacked

        // Check enemy chambers (if ant is inside enemy territory)
        for (const [chId, ch] of Object.entries(defColony.chambers)) {
          if (!ch.active) continue
          const dx   = ant.position.x - ch.position.x
          const dy   = ant.position.y - ch.position.y
          const dist = Math.sqrt(dx*dx+dy*dy)
          if (dist <= stats.range + 20) {  // chambers are bigger targets
            ch.hp -= stats.damage * 0.5   // half damage to structures
            ant.attackCooldown = stats.attackRate
            if (ch.hp <= 0) {
              ch.active = false
              ch.hp     = 0
              this._recomputeEffects(defColony)
              kills.push({
                text: `${colony.name || 'Colony'} destroyed a ${ch.type}!`,
                attacker: pid, victim: defId
              })
            }
            break
          }
        }
      }
    }
    return kills
  }

  // ── Main tick ──────────────────────────────────────────────────────────────
  tick() {
    const changes = {}
    const allKills = []

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

      // Auto-attack
      const kills = this._autoAttackTick(pid, colony)
      allKills.push(...kills)

      // Workers near food tiles gather resources
      for (const ant of Object.values(colony.ants)) {
        if (ant.caste !== 'worker' && ant.caste !== 'farmer') continue
        for (const ft of this._foodTiles) {
          const dx = ant.position.x - ft.x
          const dy = ant.position.y - ft.y
          if (Math.sqrt(dx*dx+dy*dy) < 48) {
            colony.resources.leaf += FOOD_INCOME
            break
          }
        }
      }

      // Passive farmer bonus
      const farmers = Object.values(colony.ants).filter(a => a.caste === 'farmer').length
      colony.resources.leaf += farmers * 0.02

      // Storage cap
      colony.resources.leaf = Math.min(colony.resources.leaf, 200 + colony.effects.storageBonus)

      // Territory expands slightly with more chambers
      const chamberCount = Object.values(colony.chambers).filter(c => c.active).length
      colony.territory.radius = TERRITORY_RADIUS + chamberCount * 15

      // Auto-spawn worker from nursery effect
      colony.spawnTimer = (colony.spawnTimer||0) + 1
      const interval = Math.max(80, Math.floor(250 * (1 - colony.effects.spawnBonus)))
      if (colony.spawnTimer >= interval && Object.keys(colony.ants).length < 20 + colony.effects.armyCap) {
        colony.spawnTimer = 0
        if (colony.resources.leaf >= 5) {
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
        effects:   colony.effects,
        territory: colony.territory,
        name:      colony.name,
        color:     colony.color
      }
    }

    return { changes, kills: allKills }
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