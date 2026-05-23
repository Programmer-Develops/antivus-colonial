import { useGameStore }      from './store/gameStore.js'
import { initSocket }        from './socket/client.js'
import { initUI, initRecruitPanel } from './ui/hud.js'
import { showLobby }         from './ui/lobby.js'

async function boot() {
  const store   = useGameStore.getState()
  const overlay = document.getElementById('ui-overlay')

  const { initRenderer } = await import('./game/renderer.js')
  await initRenderer(document.getElementById('app'))

  initSocket()
  initUI(overlay)
  initRecruitPanel(overlay)
  showLobby()

  store.setPhase('lobby')
  console.log('[antivus] booted')
}

boot().catch(console.error)