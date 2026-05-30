// ─── colonyGame.js — Standout Arras.io-Style top-down Shooter Physics & Logic ───
import { v4 as uuid } from 'uuid'

// ── Constants ──────────────────────────────────────────────────────────────────
const MAP_SIZE = 2048 // 64 * 32px tiles
const TILE = 32
const COLONY_COLORS = ['#4ade80','#f87171','#60a5fa','#facc15','#a78bfa','#fb923c','#34d399','#f472b6']

const SPAWN_POSITIONS = [
  {x:200,y:200},{x:1800,y:200},{x:200,y:1800},{x:1800,y:1800},
  {x:1000,y:200},{x:1000,y:1800},{x:200,y:1000},{x:1800,y:1000}
]

// ── Ant Class Attributes ───────────────────────────────────────────────────────
// HP, Max HP, Core Speed, Core Damage, Bullet Speed, Core Reload (ticks), Bullet Lifetime (ticks), Projectile Type
export const CASTE_DEFS = {
  worker:     { hp:100, speed:3.2, damage:12,  bulletSpeed:6,  reload:10, range:60,  type:'acid'      },
  // Tier 2
  soldier:    { hp:180, speed:2.5, damage:24,  bulletSpeed:5,  reload:18, range:45,  type:'heavy'     },
  scout:      { hp:90,  speed:4.5, damage:8,   bulletSpeed:9,  reload:6,  range:80,  type:'needle'    },
  ranger:     { hp:110, speed:3.0, damage:16,  bulletSpeed:7,  reload:11, range:100, type:'acid'      },
  farmer:     { hp:120, speed:2.8, damage:10,  bulletSpeed:5.5,reload:12, range:70,  type:'honeydew'  },
  // Tier 3
  bombardier: { hp:240, speed:2.0, damage:45,  bulletSpeed:4.5,reload:25, range:50,  type:'explosive' },
  weaver:     { hp:200, speed:2.4, damage:18,  bulletSpeed:6,  reload:14, range:60,  type:'silk'      },
  bullet:     { hp:120, speed:5.0, damage:35,  bulletSpeed:12, reload:22, range:120, type:'stinger'   },
  stinkbug:   { hp:160, speed:3.8, damage:14,  bulletSpeed:6.5,reload:9,  range:60,  type:'poison'    },
  acidgunner: { hp:140, speed:3.0, damage:15,  bulletSpeed:7.5,reload:7,  range:95,  type:'triple'    },
  sniper:     { hp:100, speed:2.7, damage:60,  bulletSpeed:15, reload:38, range:180, type:'needle'    },
  cultivator: { hp:150, speed:2.8, damage:12,  bulletSpeed:6,  reload:12, range:75,  type:'spores'    }
}

// ── Deployable Chamber Defs ───────────────────────────────────────────────────
const CHAMBER_DEF = {
  barracks: { cost:40, hp:350, desc:'Shield Wall - deals body acid contact damage' },
  tunnel:   { cost:30, hp:180, desc:'Defensive speed booster and automated turret' },
  nursery:  { cost:50, hp:200, desc:'Larva Swarm Nest - breeds AI follower drones' },
  granary:  { cost:25, hp:150, desc:'Sustenance depot - slowly heals allies in a radius' }
}

export class ColonyGame {
  constructor(map) {
    this.map         = map
    this.colonies    = new Map()
    this.projectiles = []
    this.foodShapes  = []
    this.clouds      = []
    this.predators   = []
    this.dayTimer    = 240
    this.dayPhase    = 'day'
    this._colorIdx   = 0
    this._maxPlayers = 0

    // Pheromone turf grid (64x64 tiles)
    this.turfGrid = Array(64 * 64).fill(null)
  }

  // ── Colony lifecycle ────────────────────────────────────────────────────────
  addColony(playerId) {
    const idx   = this.colonies.size
    const pos   = { ...SPAWN_POSITIONS[idx % SPAWN_POSITIONS.length] }
    const color = COLONY_COLORS[this._colorIdx++ % COLONY_COLORS.length]

    const colony = {
      color,
      name: 'Player',
      xp: 0,
      level: 1,
      upgradePoints: 0,
      class: 'worker',
      stats: {
        regen: 0,       // max 7
        maxHp: 0,       // max 7
        speed: 0,       // max 7
        damage: 0,      // max 7
        bulletSpeed: 0, // max 7
        reload: 0       // max 7
      },
      resources: { leaf: 20, fungus: 0, honeydew: 0, carapace: 0 },
      chambers: {},
      territory: { center: { ...pos }, radius: 180 },
      ants: {}, // ants[pid] is the player, ants[droneId] are friendly swarms
      activeSkillCooldown: 0,
      input: { keys: {}, mx: pos.x, my: pos.y, firing: false }
    }

    // Spawn player ant
    colony.ants[playerId] = this._makePlayerAnt(playerId, 'worker', pos)

    this.colonies.set(playerId, colony)
    if (this.colonies.size > this._maxPlayers) this._maxPlayers = this.colonies.size

    // Initial shape spawn
    this._maintainFoodShapes()
  }

  _makePlayerAnt(id, caste, pos) {
    const def = CASTE_DEFS[caste]
    return {
      id,
      caste,
      position: { x: pos.x, y: pos.y },
      hp: def.hp,
      maxHp: def.hp,
      attackCooldown: 0,
      isPlayer: true
    }
  }

  _makeDroneAnt(id, caste, pos) {
    return {
      id,
      caste,
      position: { x: pos.x, y: pos.y },
      hp: 35,
      maxHp: 35,
      attackCooldown: 0,
      isPlayer: false,
      target: null
    }
  }

  setColonyName(playerId, name) {
    const c = this.colonies.get(playerId)
    if (c) c.name = name || 'Colony'
  }

  removeColony(pid) {
    this.colonies.delete(pid)
    // Clear projectiles belonging to player
    this.projectiles = this.projectiles.filter(p => p.ownerId !== pid)
  }

  // ── Input receiver ──────────────────────────────────────────────────────────
  updatePlayerInput(pid, input) {
    const colony = this.colonies.get(pid)
    if (colony) {
      colony.input = {
        keys: input.keys || {},
        mx: input.mx ?? colony.input.mx,
        my: input.my ?? colony.input.my,
        firing: !!input.firing,
        activeSkill: !!input.activeSkill
      }
    }
  }

  upgradeStat(pid, statName) {
    const colony = this.colonies.get(pid)
    if (!colony || colony.upgradePoints <= 0) return { ok: false }
    if (colony.stats[statName] >= 7) return { ok: false, msg: 'Stat already maxed!' }

    colony.stats[statName]++
    colony.upgradePoints--

    // Reapply max HP changes immediately
    const playerAnt = colony.ants[pid]
    if (playerAnt) {
      const baseHp = CASTE_DEFS[colony.class].hp
      const oldMax = playerAnt.maxHp
      playerAnt.maxHp = baseHp + colony.stats.maxHp * 20
      playerAnt.hp += (playerAnt.maxHp - oldMax) // keep current HP scaling
    }

    return { ok: true }
  }

  evolvePlayer(pid, className) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok: false }

    const curLevel = colony.level
    const curClass = colony.class

    // Evolve validation
    let allowed = false
    if (curLevel >= 5 && curLevel < 15 && curClass === 'worker') {
      allowed = ['soldier', 'scout', 'ranger', 'farmer'].includes(className)
    } else if (curLevel >= 15) {
      if (curClass === 'soldier') allowed = ['bombardier', 'weaver'].includes(className)
      else if (curClass === 'scout') allowed = ['bullet', 'stinkbug'].includes(className)
      else if (curClass === 'ranger') allowed = ['acidgunner', 'sniper'].includes(className)
      else if (curClass === 'farmer') allowed = ['cultivator'].includes(className)
    }

    if (!allowed) return { ok: false, msg: 'Evolve tier not unlocked yet!' }

    colony.class = className
    const playerAnt = colony.ants[pid]
    if (playerAnt) {
      playerAnt.caste = className
      const oldMax = playerAnt.maxHp
      playerAnt.maxHp = CASTE_DEFS[className].hp + colony.stats.maxHp * 20
      playerAnt.hp = Math.min(playerAnt.maxHp, playerAnt.hp + (playerAnt.maxHp - oldMax))
    }

    return { ok: true }
  }

  buildChamber(pid, type, position) {
    const colony = this.colonies.get(pid)
    if (!colony) return { ok: false, msg: 'Colony not found' }

    const def = CHAMBER_DEF[type]
    if (!def) return { ok: false, msg: 'Unknown nest chamber type' }

    // Must be inside own territory
    const tc = colony.territory.center
    const dist = Math.hypot(position.x - tc.x, position.y - tc.y)
    if (dist > colony.territory.radius)
      return { ok: false, msg: 'Must deploy inside your colony ring!' }

    if (colony.resources.leaf < def.cost)
      return { ok: false, msg: `Need ${def.cost}🍃 to deploy ${type}` }

    colony.resources.leaf -= def.cost
    const id = uuid()
    colony.chambers[id] = {
      id,
      type,
      position: { x: position.x, y: position.y },
      hp: def.hp,
      maxHp: def.hp,
      active: true,
      spawnTimer: 0
    }

    // Expand territory a bit on new chamber
    colony.territory.radius = Math.min(320, colony.territory.radius + 15)

    return { ok: true, chamberId: id }
  }

  // ── Unified tick loop (20Hz) ────────────────────────────────────────────────
  tick() {
    const kills = []

    this._tickPlayerWASD()
    this._tickSwarms()
    this._tickProjectiles(kills)
    this._tickPredators(kills)
    this._tickChambers()
    this._tickPheromoneDeposition()
    this._tickRegen()
    this._tickClouds()
    this._maintainFoodShapes()

    // Package the complete room state delta
    const changes = {}
    for (const [pid, colony] of this.colonies) {
      changes[pid] = {
        name: colony.name,
        color: colony.color,
        xp: colony.xp,
        level: colony.level,
        upgradePoints: colony.upgradePoints,
        class: colony.class,
        stats: colony.stats,
        resources: colony.resources,
        chambers: colony.chambers,
        territory: colony.territory,
        ants: colony.ants,
        activeSkillCooldown: colony.activeSkillCooldown
      }
    }

    return {
      changes,
      kills,
      projectiles: this.projectiles,
      foodShapes: this.foodShapes,
      clouds: this.clouds,
      predators: this.predators
    }
  }

  // ── Player direct movement (WASD) ──────────────────────────────────────────
  _tickPlayerWASD() {
    for (const [pid, colony] of this.colonies) {
      const pAnt = colony.ants[pid]
      if (!pAnt) continue

      const cfg = CASTE_DEFS[colony.class]
      let speed = cfg.speed + colony.stats.speed * 0.35

      // Skill Cooldown Tick
      if (colony.activeSkillCooldown > 0) colony.activeSkillCooldown--

      // Splatoon-style Pheromone turf effect
      const currentTileX = Math.floor(pAnt.position.x / TILE)
      const currentTileY = Math.floor(pAnt.position.y / TILE)
      if (currentTileX >= 0 && currentTileX < 64 && currentTileY >= 0 && currentTileY < 64) {
        const turf = this.turfGrid[currentTileY * 64 + currentTileX]
        if (turf) {
          if (turf === pid) {
            speed *= 1.35 // +35% friendly speed
          } else {
            speed *= 0.75 // -25% enemy slow
          }
        }
      }

      // WASD forces
      let dx = 0, dy = 0
      const k = colony.input.keys
      if (k.w || k.W || k.ArrowUp)    dy -= 1
      if (k.s || k.S || k.ArrowDown)  dy += 1
      if (k.a || k.A || k.ArrowLeft)  dx -= 1
      if (k.d || k.D || k.ArrowRight) dx += 1

      // Handle Shift Active Skill: Dash (Scouts/Bullet ants)
      if (colony.input.activeSkill && colony.activeSkillCooldown === 0) {
        if (['scout', 'bullet', 'stinkbug'].includes(colony.class)) {
          colony.activeSkillCooldown = 60 // 3 seconds
          // Instantly dash forward in movement direction
          const angle = Math.atan2(dy || (colony.input.my - pAnt.position.y), dx || (colony.input.mx - pAnt.position.x))
          pAnt.position.x += Math.cos(angle) * 120
          pAnt.position.y += Math.sin(angle) * 120
          pAnt.position.x = Math.max(16, Math.min(MAP_SIZE - 16, pAnt.position.x))
          pAnt.position.y = Math.max(16, Math.min(MAP_SIZE - 16, pAnt.position.y))

          // Stinkbug dash releases defensive poison cloud trail
          if (colony.class === 'stinkbug') {
            this.clouds.push({
              id: uuid(),
              x: pAnt.position.x,
              y: pAnt.position.y,
              radius: 65,
              duration: 100,
              type: 'poison',
              ownerId: pid
            })
          }
        }
      }

      // Standard movement vector
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy)
        pAnt.position.x += (dx / len) * speed
        pAnt.position.y += (dy / len) * speed

        // Clamp inside map limits
        pAnt.position.x = Math.max(16, Math.min(MAP_SIZE - 16, pAnt.position.x))
        pAnt.position.y = Math.max(16, Math.min(MAP_SIZE - 16, pAnt.position.y))
      }

      // ── Attack Fire Rate & Trigger ──────────────────────────────────────────
      if (pAnt.attackCooldown > 0) pAnt.attackCooldown--

      if (colony.input.firing && pAnt.attackCooldown === 0) {
        this._fireProjectile(pid, colony, pAnt)
      }
    }
  }

  _fireProjectile(pid, colony, pAnt) {
    const cfg = CASTE_DEFS[colony.class]
    const bSpeed = cfg.bulletSpeed + colony.stats.bulletSpeed * 0.8
    const bDamage = cfg.damage + colony.stats.damage * 4

    // Aim toward mouse
    const ang = Math.atan2(colony.input.my - pAnt.position.y, colony.input.mx - pAnt.position.x)
    const baseCooldown = cfg.reload - Math.min(cfg.reload - 3, colony.stats.reload * 1.2)
    pAnt.attackCooldown = Math.max(2, Math.floor(baseCooldown))

    const vx = Math.cos(ang) * bSpeed
    const vy = Math.sin(ang) * bSpeed

    if (cfg.type === 'triple') {
      // Acid gunner fires 3 spread acid drops
      for (let s = -1; s <= 1; s++) {
        const spreadAng = ang + s * 0.18
        this.projectiles.push({
          id: uuid(),
          x: pAnt.position.x,
          y: pAnt.position.y,
          vx: Math.cos(spreadAng) * bSpeed,
          vy: Math.sin(spreadAng) * bSpeed,
          damage: bDamage * 0.8,
          type: 'acid',
          ownerId: pid,
          color: colony.color,
          life: 40
        })
      }
    } else {
      this.projectiles.push({
        id: uuid(),
        x: pAnt.position.x,
        y: pAnt.position.y,
        vx, vy,
        damage: bDamage,
        type: cfg.type,
        ownerId: pid,
        color: colony.color,
        life: cfg.range / bSpeed
      })
    }
  }

  // ── Dynamic Splatoon-style Pheromone turf deposition ─────────────────────────
  _tickPheromoneDeposition() {
    for (const [pid, colony] of this.colonies) {
      const pAnt = colony.ants[pid]
      if (!pAnt) continue

      // Scouts deposit no trail
      if (colony.class === 'scout') continue

      const tx = Math.floor(pAnt.position.x / TILE)
      const ty = Math.floor(pAnt.position.y / TILE)
      if (tx >= 0 && tx < 64 && ty >= 0 && ty < 64) {
        this.turfGrid[ty * 64 + tx] = pid
      }
    }
  }

  // ── Swarming Drone follower mini-ants (Nursery mechanics) ───────────────────
  _tickSwarms() {
    for (const [pid, colony] of this.colonies) {
      const playerAnt = colony.ants[pid]
      if (!playerAnt) continue

      for (const [antId, ant] of Object.entries(colony.ants)) {
        if (ant.isPlayer) continue

        // Tick attack cooldown
        if (ant.attackCooldown > 0) ant.attackCooldown--

        // AI drone logic: stay close to player, swarm target enemies or food shapes
        const distToPlayer = Math.hypot(ant.position.x - playerAnt.position.x, ant.position.y - playerAnt.position.y)

        // Find nearest threat/food in vicinity
        let bestTarget = null
        let bestDist = 180

        // Check enemy players
        for (const [otherPid, otherColony] of this.colonies) {
          if (otherPid === pid) continue
          const enemyAnt = otherColony.ants[otherPid]
          if (enemyAnt) {
            const d = Math.hypot(ant.position.x - enemyAnt.position.x, ant.position.y - enemyAnt.position.y)
            if (d < bestDist) { bestDist = d; bestTarget = enemyAnt }
          }
        }

        // Check food shapes
        if (!bestTarget) {
          for (const shape of this.foodShapes) {
            const d = Math.hypot(ant.position.x - shape.x, ant.position.y - shape.y)
            if (d < bestDist) { bestDist = d; bestTarget = shape }
          }
        }

        if (bestTarget) {
          // Attack or move to target
          const dx = bestTarget.x ?? bestTarget.position.x
          const dy = bestTarget.y ?? bestTarget.position.y
          const ang = Math.atan2(dy - ant.position.y, dx - ant.position.x)

          if (bestDist < 35 && ant.attackCooldown === 0) {
            // Melee bite
            bestTarget.hp -= 8
            ant.attackCooldown = 15
          } else {
            // Fly toward
            ant.position.x += Math.cos(ang) * 3
            ant.position.y += Math.sin(ang) * 3
          }
        } else if (distToPlayer > 80) {
          // Return to player ant
          const ang = Math.atan2(playerAnt.position.y - ant.position.y, playerAnt.position.x - ant.position.x)
          ant.position.x += Math.cos(ang) * 3.5
          ant.position.y += Math.sin(ang) * 3.5
        } else {
          // Orbit/wander
          const ang = Date.now() * 0.003 + antId.charCodeAt(0)
          const rx = playerAnt.position.x + Math.cos(ang) * 45
          const ry = playerAnt.position.y + Math.sin(ang) * 45
          ant.position.x += (rx - ant.position.x) * 0.15
          ant.position.y += (ry - ant.position.y) * 0.15
        }
      }
    }
  }

  // ── Projectile Simulation & Reaction Checks ──────────────────────────────────
  _tickProjectiles(kills) {
    const speedScale = 1
    const active = []

    for (const p of this.projectiles) {
      p.x += p.vx * speedScale
      p.y += p.vy * speedScale
      p.life--

      // Collision checks
      let hit = false

      // Check hits against enemy player ants
      for (const [enemyPid, enemyColony] of this.colonies) {
        if (enemyPid === p.ownerId) continue
        const enemyAnt = enemyColony.ants[enemyPid]
        if (enemyAnt) {
          const d = Math.hypot(p.x - enemyAnt.position.x, p.y - enemyAnt.position.y)
          if (d < 20) {
            enemyAnt.hp -= p.damage
            hit = true

            // Trigger Bombardier blast
            if (p.type === 'explosive') {
              this._createSplashBlast(p.ownerId, p.x, p.y, 90, p.damage * 0.8, kills)
            }
            // Trigger Silk Web trap
            if (p.type === 'silk') {
              this.clouds.push({ id: uuid(), x: p.x, y: p.y, radius: 45, duration: 80, type: 'silk', ownerId: p.ownerId })
            }

            if (enemyAnt.hp <= 0) {
              kills.push({
                text: `${this.colonies.get(p.ownerId)?.name || 'An Ant'} slew ${enemyColony.name}!`,
                attacker: p.ownerId,
                victim: enemyPid
              })
              this._awardXP(p.ownerId, 250) // massive reward on player kill
              this._awardCarapace(p.ownerId, 10)
              delete enemyColony.ants[enemyPid]
            }
            break
          }
        }
      }

      if (hit) continue

      // Check hits against food shapes
      for (let i = this.foodShapes.length - 1; i >= 0; i--) {
        const sh = this.foodShapes[i]
        const d = Math.hypot(p.x - sh.x, p.y - sh.y)
        if (d < sh.size + 6) {
          sh.hp -= p.damage
          hit = true

          if (p.type === 'explosive') {
            this._createSplashBlast(p.ownerId, p.x, p.y, 80, p.damage * 0.7, kills)
          }

          if (sh.hp <= 0) {
            this._awardXP(p.ownerId, sh.xpValue)
            this._awardResources(p.ownerId, sh.type)
            this.foodShapes.splice(i, 1)
          }
          break
        }
      }

      if (hit) continue

      // Check projectile-to-projectile collisions for Chemical Reactions!
      for (const other of active) {
        if (other.ownerId !== p.ownerId) {
          const d = Math.hypot(p.x - other.x, p.y - other.y)
          if (d < 25) {
            hit = true
            other.life = 0 // destroy other projectile too

            // TRIGGER REACTIONS!
            if ((p.type === 'acid' && other.type === 'honeydew') || (p.type === 'honeydew' && other.type === 'acid')) {
              // Corrosive Sizzling Mist
              this.clouds.push({
                id: uuid(),
                x: p.x, y: p.y,
                radius: 110,
                duration: 120, // 6 seconds
                type: 'mist',
                ownerId: p.ownerId
              })
            } else if ((p.type === 'poison' && other.type === 'explosive') || (p.type === 'explosive' && other.type === 'poison')) {
              // Volatile chain reaction explosion!
              this._createSplashBlast(p.ownerId, p.x, p.y, 160, p.damage * 1.5, kills)
            } else if ((p.type === 'silk' && other.type === 'acid') || (p.type === 'acid' && other.type === 'silk')) {
              // Corrosive spiderwebs
              this.clouds.push({
                id: uuid(),
                x: p.x, y: p.y,
                radius: 75,
                duration: 100,
                type: 'silk-acid',
                ownerId: p.ownerId
              })
            }
            break
          }
        }
      }

      if (!hit && p.life > 0) active.push(p)
    }

    this.projectiles = active
  }

  _createSplashBlast(ownerId, x, y, radius, damage, kills) {
    // Blast enemies
    for (const [enemyPid, enemyColony] of this.colonies) {
      if (enemyPid === ownerId) continue
      const enemyAnt = enemyColony.ants[enemyPid]
      if (enemyAnt) {
        const d = Math.hypot(x - enemyAnt.position.x, y - enemyAnt.position.y)
        if (d <= radius) {
          const force = 1 - (d / radius)
          enemyAnt.hp -= damage * force
          if (enemyAnt.hp <= 0) {
            kills.push({ text: `Chemical explosion blasted ${enemyColony.name}!`, attacker: ownerId, victim: enemyPid })
            this._awardXP(ownerId, 250)
            delete enemyColony.ants[enemyPid]
          }
        }
      }
    }

    // Blast food shapes
    for (let i = this.foodShapes.length - 1; i >= 0; i--) {
      const sh = this.foodShapes[i]
      const d = Math.hypot(x - sh.x, y - sh.y)
      if (d <= radius) {
        const force = 1 - (d / radius)
        sh.hp -= damage * force
        if (sh.hp <= 0) {
          this._awardXP(ownerId, sh.xpValue)
          this._awardResources(ownerId, sh.type)
          this.foodShapes.splice(i, 1)
        }
      }
    }
  }

  // ── Reaction chemical clouds (mist, silk, poison) ticking ──────────────────
  _tickClouds() {
    const active = []
    for (const c of this.clouds) {
      c.duration--

      // Apply cloud ticking effects in radius
      for (const [pid, colony] of this.colonies) {
        const pAnt = colony.ants[pid]
        if (!pAnt) continue
        const d = Math.hypot(c.x - pAnt.position.x, c.y - pAnt.position.y)
        if (d > c.radius) continue

        const isFriendly = pid === c.ownerId
        if (c.type === 'mist') {
          if (isFriendly) {
            pAnt.hp = Math.min(pAnt.maxHp, pAnt.hp + 0.6) // heal friendly
          } else {
            pAnt.hp -= 0.8 // dissolve enemy
          }
        } else if (c.type === 'poison') {
          if (!isFriendly) {
            pAnt.hp -= 0.7
          }
        } else if (c.type === 'silk') {
          if (!isFriendly) {
            // High slow is checked during movement. Just apply minor sting
            pAnt.hp -= 0.1
          }
        } else if (c.type === 'silk-acid') {
          if (!isFriendly) {
            pAnt.hp -= 1.0 // extremely high corrosive trap
          }
        }
      }

      if (c.duration > 0) active.push(c)
    }
    this.clouds = active
  }

  // ── Stat XP Progression & Awarding ──────────────────────────────────────────
  _awardXP(pid, amount) {
    const colony = this.colonies.get(pid)
    if (!colony) return

    colony.xp += amount
    const xpNeeded = this._xpNeededForLevel(colony.level)

    if (colony.xp >= xpNeeded) {
      colony.xp -= xpNeeded
      colony.level++
      colony.upgradePoints += 1
    }
  }

  _xpNeededForLevel(lvl) {
    return 40 + lvl * 10
  }

  _awardResources(pid, shapeType) {
    const colony = this.colonies.get(pid)
    if (!colony) return
    const multiplier = colony.class === 'farmer' ? 2 : 1
    if (shapeType === 'leaf') colony.resources.leaf += 3 * multiplier
    if (shapeType === 'sugar') colony.resources.leaf += 10 * multiplier
    if (shapeType === 'carapace') colony.resources.carapace += 2
  }

  _awardCarapace(pid, amount) {
    const colony = this.colonies.get(pid)
    if (colony) colony.resources.carapace += amount
  }

  // ── Stat health regeneration & touch decay ──────────────────────────────────
  _tickRegen() {
    for (const [pid, colony] of this.colonies) {
      const pAnt = colony.ants[pid]
      if (!pAnt) continue

      // Stats passive regen
      const baseRegen = colony.stats.regen * 0.08
      const casteBonus = colony.class === 'farmer' ? 0.12 : 0

      // Boost regen inside friendly Granaries
      let insideGranary = false
      for (const ch of Object.values(colony.chambers)) {
        if (ch.active && ch.type === 'granary') {
          const d = Math.hypot(pAnt.position.x - ch.position.x, pAnt.position.y - ch.position.y)
          if (d < 120) insideGranary = true
        }
      }

      pAnt.hp = Math.min(pAnt.maxHp, pAnt.hp + baseRegen + casteBonus + (insideGranary ? 0.4 : 0))
    }
  }

  // ── Deployable nest structures (Chambers) ────────────────────────────────────
  _tickChambers() {
    for (const [pid, colony] of this.colonies) {
      const playerAnt = colony.ants[pid]
      if (!playerAnt) continue

      for (const ch of Object.values(colony.chambers)) {
        if (!ch.active) continue

        // 1. Nursery spawns AI swarm follower drones
        if (ch.type === 'nursery') {
          ch.spawnTimer++
          const currentDronesCount = Object.values(colony.ants).filter(a => !a.isPlayer).length
          if (currentDronesCount < 4 && ch.spawnTimer >= 140) {
            ch.spawnTimer = 0
            const droneId = uuid()
            colony.ants[droneId] = this._makeDroneAnt(droneId, 'scout', {
              x: ch.position.x + (Math.random() - 0.5) * 40,
              y: ch.position.y + (Math.random() - 0.5) * 40
            })
          }
        }

        // 2. Tunnel shoots automated basic acid sprays at enemies in range
        if (ch.type === 'tunnel') {
          ch.spawnTimer++
          if (ch.spawnTimer >= 35) {
            ch.spawnTimer = 0
            // Find closest enemy player ant
            let nearestEnemy = null
            let bestD = 220
            for (const [enemyPid, enemyColony] of this.colonies) {
              if (enemyPid === pid) continue
              const enemyAnt = enemyColony.ants[enemyPid]
              if (enemyAnt) {
                const d = Math.hypot(ch.position.x - enemyAnt.position.x, ch.position.y - enemyAnt.position.y)
                if (d < bestD) { bestD = d; nearestEnemy = enemyAnt }
              }
            }

            if (nearestEnemy) {
              const ang = Math.atan2(nearestEnemy.position.y - ch.position.y, nearestEnemy.position.x - ch.position.x)
              this.projectiles.push({
                id: uuid(),
                x: ch.position.x,
                y: ch.position.y,
                vx: Math.cos(ang) * 5.5,
                vy: Math.sin(ang) * 5.5,
                damage: 15,
                type: 'acid',
                ownerId: pid,
                color: colony.color,
                life: 40
              })
            }
          }
        }
      }
    }
  }

  // ── Procedural food shape maintaining ────────────────────────────────────────
  _maintainFoodShapes() {
    const limit = this.dayPhase === 'night' ? 40 : 80 // fewer shapes at night
    if (this.foodShapes.length >= limit) return

    const types = ['leaf', 'sugar', 'carapace']
    const weights = [0.65, 0.25, 0.10] // leaf is most common

    while (this.foodShapes.length < limit) {
      // Pick random walkable position on map
      const tx = Math.floor(Math.random() * (64 - 4)) + 2
      const ty = Math.floor(Math.random() * (64 - 4)) + 2

      const tile = this.map.tiles.find(t => t.x === tx && t.y === ty)
      if (!tile || !tile.walkable) continue

      const x = tx * TILE + TILE / 2 + (Math.random() - 0.5) * 10
      const y = ty * TILE + TILE / 2 + (Math.random() - 0.5) * 10

      // Roll shape type
      const roll = Math.random()
      let type = 'leaf'
      let hp = 15, size = 6, xpVal = 10, color = '#6abf30'

      if (roll > weights[0] + weights[1]) {
        type = 'carapace'
        hp = 85; size = 11; xpVal = 60; color = '#60a5fa'
      } else if (roll > weights[0]) {
        type = 'sugar'
        hp = 35; size = 8; xpVal = 25; color = '#facc15'
      }

      this.foodShapes.push({
        id: uuid(),
        x, y,
        type, hp, maxHp: hp,
        size, xpValue: xpVal, color,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05
      })
    }
  }

  // ── Day/Night Cycle & Wolf Spider Boss Spawning ─────────────────────────────
  tickDayCycle() {
    if (--this.dayTimer <= 0) {
      this.dayPhase = this.dayPhase === 'day' ? 'night' : 'day'
      this.dayTimer = 240 // reset timer (12 seconds per phase at 20Hz ticks)

      if (this.dayPhase === 'night') {
        this._spawnWolfSpiderBoss()
      } else {
        // despawn alive predators at dawn
        this.predators = []
      }
      return this.dayPhase
    }
    return null
  }

  _spawnWolfSpiderBoss() {
    // Spawns one massive Wolf Spider Predator at map center
    this.predators.push({
      id: uuid(),
      name: 'APEX WOLF SPIDER',
      x: 1000,
      y: 1000,
      hp: 1200,
      maxHp: 1200,
      damage: 40,
      speed: 4.8,
      size: 34,
      attackCooldown: 0
    })

    // Also spawn a few small wandering hunter beetles
    for (let i = 0; i < 3; i++) {
      const pos = SPAWN_POSITIONS[Math.floor(Math.random() * SPAWN_POSITIONS.length)]
      this.predators.push({
        id: uuid(),
        name: 'Hunter Beetle',
        x: pos.x + (Math.random() - 0.5) * 300,
        y: pos.y + (Math.random() - 0.5) * 300,
        hp: 300,
        maxHp: 300,
        damage: 18,
        speed: 3.5,
        size: 16,
        attackCooldown: 0
      })
    }
  }

  _tickPredators(kills) {
    const active = []
    for (const p of this.predators) {
      if (p.attackCooldown > 0) p.attackCooldown--

      // Seek nearest player ant
      let nearestPlayer = null
      let bestD = 800

      for (const [pid, colony] of this.colonies) {
        const playerAnt = colony.ants[pid]
        if (playerAnt) {
          const d = Math.hypot(p.x - playerAnt.position.x, p.y - playerAnt.position.y)
          if (d < bestD) { bestD = d; nearestPlayer = playerAnt }
        }
      }

      if (nearestPlayer) {
        const ang = Math.atan2(nearestPlayer.position.y - p.y, nearestPlayer.position.x - p.x)
        p.x += Math.cos(ang) * p.speed
        p.y += Math.sin(ang) * p.speed

        // Touch contact damage
        if (bestD < p.size + 15 && p.attackCooldown === 0) {
          nearestPlayer.hp -= p.damage
          p.attackCooldown = 25 // tick delay

          if (nearestPlayer.hp <= 0) {
            kills.push({ text: `${p.name} devoured a player!`, victim: nearestPlayer.id })
            delete this.colonies.get(nearestPlayer.id)?.ants[nearestPlayer.id]
          }
        }
      }

      // Check hits from player projectiles on predator
      for (const bullet of this.projectiles) {
        const d = Math.hypot(bullet.x - p.x, bullet.y - p.y)
        if (d < p.size + 10) {
          p.hp -= bullet.damage
          bullet.life = 0 // absorb bullet

          if (p.hp <= 0) {
            kills.push({ text: `APEX DEFEATED! ${this.colonies.get(bullet.ownerId)?.name || 'An ant'} slew ${p.name}!`, attacker: bullet.ownerId })
            this._awardXP(bullet.ownerId, 1200) // immense bonus XP
            this._awardCarapace(bullet.ownerId, 25)  // legendary loot drop
            break
          }
        }
      }

      if (p.hp > 0) active.push(p)
    }
    this.predators = active
  }

  // ── Check win conditions (last ant standing) ───────────────────────────────
  checkWinner() {
    if (this._maxPlayers < 2) return null
    const alive = [...this.colonies.entries()].filter(([, c]) =>
      Object.values(c.ants).some(a => a.isPlayer))
    return alive.length === 1 ? alive[0][0] : null
  }

  getColonies() {
    const out = {}
    for (const [id, c] of this.colonies) out[id] = c
    return out
  }
}