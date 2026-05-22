import { initRenderer }  from './game/renderer.js'
import { initSocket }    from './socket/client.js'
import { initUI }        from './ui/hud.js'
import { useGameStore }  from './store/gameStore.js'

const store = useGameStore.getState()

async function boot() {
  await initRenderer(document.getElementById('app'))
  initSocket()
  initUI(document.getElementById('ui-overlay'))
  store.setPhase('lobby')
}

boot()