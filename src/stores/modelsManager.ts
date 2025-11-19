import { reactive, readonly } from 'vue'
import { createClient } from '@lmstudio/sdk'

// Basic, small wrapper store for model management
type LoadedModel = {
  key: string
  handle: any
}

const client = createClient ? createClient({}) : ({} as any)

const state = reactive({
  loadedModels: [] as LoadedModel[],
  loading: false,
  loadingProgress: 0,
  loadingKey: null as string | null
})

export async function listLoaded() {
  if (!client.llm || !client.llm.listLoaded) return []
  const loaded = await client.llm.listLoaded()
  // Expect loaded to be an array of { key, handle }
  state.loadedModels = (loaded || []).map((m: any) => ({ key: m.key, handle: m.handle }))
  return state.loadedModels
}

export async function unloadModel(handle: any) {
  if (!handle) return
  if (handle.unload) {
    await handle.unload()
  }
  // Remove from state
  state.loadedModels = state.loadedModels.filter(m => m.handle !== handle)
}

export async function loadModel(key: string) {
  if (!client.llm || !client.llm.model) {
    throw new Error('LM client not available')
  }
  state.loading = true
  state.loadingProgress = 0
  state.loadingKey = key

  const handle = await client.llm.model(key)

  // If the handle offers progress events, listen to them.
  if (handle && handle.on && typeof handle.on === 'function') {
    handle.on('progress', (p: number) => {
      state.loadingProgress = p
    })
  }

  // If handle has a load() promise, await it to finish
  if (handle && typeof handle.load === 'function') {
    await handle.load((progressCallback?: (n: number) => void) => {
      if (progressCallback) {
        // some SDKs may call this; ignore here
      }
    })
  }

  // Default: if handle has a ready promise property
  if (handle && handle.ready instanceof Promise) {
    await handle.ready
  }

  // Add to loaded models state (avoid duplicates)
  const exists = state.loadedModels.find(m => m.handle === handle || m.key === key)
  if (!exists) state.loadedModels.push({ key, handle })

  state.loading = false
  state.loadingProgress = 100
  state.loadingKey = null

  return handle
}

export function useModelsState() {
  return {
    state: readonly(state),
    listLoaded,
    loadModel,
    unloadModel
  }
}
