import { createStore } from 'zustand/vanilla'

export const useGameStore = createStore((set) => ({
  phase: 'lobby',
  setPhase: (phase) => set({ phase }),

  roomId: null,
  roomPlayers: [],
  setRoom: (roomId, players) => set({ roomId, roomPlayers: players }),

  myId: null,
  myName: '',
  setMyId:   (id)   => set({ myId: id }),
  setMyName: (name) => set({ myName: name }),

  colony: {
    color: '#4ade80',
    name: '',
    xp: 0,
    level: 1,
    upgradePoints: 0,
    class: 'worker',
    stats: { regen:0, maxHp:0, speed:0, damage:0, bulletSpeed:0, reload:0 },
    resources: { leaf:0, fungus:0, honeydew:0, carapace:0 },
    chambers: {},
    territory: null,
    ants: {},
    activeSkillCooldown: 0,

    // Life & Relation System
    lives: 3,
    respawnTimer: 0,
    invulnerableTimer: 0,
    relations: {}
  },
  updateColony:    (patch) => set(s => ({ colony: { ...s.colony, ...patch } })),
  updateResources: (res)   => set(s => ({
    colony: { ...s.colony, resources: { ...s.colony.resources, ...res } }
  })),

  colonies: {},
  setColonies:      (colonies) => set({ colonies }),
  updateColonyById: (id, patch) => set(s => ({
    colonies: { ...s.colonies, [id]: { ...s.colonies[id], ...patch } }
  })),

  mapSeed:  null,
  dayPhase: 'day',
  dayTimer: 240,
  setMap:      (seed)  => set({ mapSeed: seed }),
  setDayCycle: (phase) => set({ dayPhase: phase, dayTimer: 240 }),

  projectiles: [],
  foodShapes: [],
  clouds: [],
  predators: [],

  // Alliance invites queue
  allianceRequests: [],

  selectedAntIds: [],
  setSelection: (ids) => set({ selectedAntIds: ids }),

  placingChamber: null,
  setPlacingChamber: (type) => set({ placingChamber: type }),

  killFeed: [],
  addKill: (entry) => set(s => ({ killFeed: [entry, ...s.killFeed].slice(0, 6) })),

  chatMessages: [],
  addChat: (msg) => set(s => ({ chatMessages: [...s.chatMessages, msg].slice(-50) }))
}))