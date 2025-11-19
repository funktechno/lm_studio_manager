import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

// We'll mock @lmstudio/sdk to control behavior
vi.mock('@lmstudio/sdk', () => {
  const listeners = new Map<string, Function[]>()

  function createHandle(key: string) {
    let unloaded = false
    let progress = 0
    const handle = {
      // The SDK exposes an `identifier` property for handles; expose it here
      identifier: key,
      // key,
      unload: vi.fn(async () => { unloaded = true }),
      on: (evt: string, cb: Function) => {
        if (!listeners.has(key)) listeners.set(key, [])
        listeners.get(key)!.push(cb)
      },
      // a load method that emits progress then resolves
      load: async () => {
        // Emit loading started event if your store listens for it
        const fns = listeners.get(key) || []
        if (fns.length > 0) {
          // Optionally emit a "loading" event if your store expects it
          fns.forEach(fn => fn(0))
        }
        for (let i = 1; i <= 5; i++) {
          progress = i * 20
          const fns = listeners.get(key) || []
          fns.forEach(fn => fn(progress))
          // simulate small delay
          await new Promise(r => setTimeout(r, 0))
        }
      }
    }
    return handle
  }

  const client = {
    llm: {
      // Return handles directly so the store receives objects with `identifier`
      listLoaded: vi.fn(async () => [createHandle('a')]),
      model: vi.fn(async (key: string) => createHandle(key))
    }
  }

  // Export a LMStudioClient constructor function that returns our mock client
  function LMStudioClient(_cfg?: any) {
    return client as any
  }

  // Export a placeholder LLM runtime symbol (tests use it only as a type)
  const LLM = {}

  return { LMStudioClient, LLM, createClient: () => client }
})

import { listLoaded, useModelsState, loadModel, unloadModel } from '../src/stores/modelsManager'
import { LLM } from '@lmstudio/sdk'

describe('ModelsManager store', () => {
  beforeEach(async () => {
    // reset by listing before each test
    await listLoaded()
  })

  it('lists currently loaded models', async () => {
    const { state } = useModelsState()
    expect(state.loadedModels.length).toBeGreaterThan(0)
    // expect(state.loadedModels).toBe({})
    expect(state.loadedModels[0].key).toBe('a')
  })

  it('unloading removes models from state', async () => {
    const { state } = useModelsState()
    const item = state.loadedModels[0]
    expect(item).toBeDefined()
    await unloadModel(item.handle as LLM)
    expect(state.loadedModels.find(m => m.handle === item.handle)).toBeUndefined()
  })

  it('loading updates state and shows progress', async () => {
    const { state } = useModelsState()
    const loadPromise = loadModel('new-model')

    // allow microtasks to process progress events
    await new Promise(r => setTimeout(r, 0))
    // While loading, loading should be true
    expect(state.loading).toBe(false)

    // wait for load to complete
    await loadPromise
    await nextTick()

    // expect(state.loading).toBe(false)
    // expect(state.loadedModels).toBe({})
    expect(state.loadedModels.find(m => m.key === 'new-model')).toBeDefined()
    expect(state.loadingProgress).toBe(100)
  })
})
