import { useGameStore }  from './store/gameStore.js'
import { initSocket }    from './socket/client.js'
import { initUI }        from './ui/hud.js'
import { showLobby }     from './ui/lobby.js'

async function boot() {
  const store = useGameStore.getState()

  // Dynamically import Pixi only when needed (keeps initial load fast)
  const { initRenderer } = await import('./game/renderer.js')
  await initRenderer(document.getElementById('app'))

  initSocket()
  initUI(document.getElementById('ui-overlay'))
  showLobby()

  store.setPhase('lobby')
  console.log('[antivus] booted')
}

boot().catch(console.error)