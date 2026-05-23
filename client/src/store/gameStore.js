import { createStore } from 'zustand/vanilla'

export const useGameStore = createStore((set) => ({
  phase: 'lobby',
  setPhase: (phase) => set({ phase }),

  roomId: null,
  roomPlayers: [],
  setRoom: (roomId, players) => set({ roomId, roomPlayers: players }),

  myId: null,
  myName: 'Queen',
  setMyId:   (id)   => set({ myId: id }),
  setMyName: (name) => set({ myName: name }),

  colony: {
    queenAlive: true,
    ants: {},
    resources: { leaf: 20, fungus: 0, honeydew: 0, carapace: 0 },
    chambers: {},
    morale: 100,
    color: '#4ade80',
    antCount: 5
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

  selectedAntIds: [],
  setSelection: (ids) => set({ selectedAntIds: ids }),

  killFeed: [],
  addKill: (entry) => set(s => ({ killFeed: [entry, ...s.killFeed].slice(0, 6) })),

  chatMessages: [],
  addChat: (msg) => set(s => ({ chatMessages: [...s.chatMessages, msg].slice(-50) }))
}))