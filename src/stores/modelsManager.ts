import { reactive, readonly } from "vue";
import { LLM, LMStudioClient, ModelInfo } from "@lmstudio/sdk";
const client = new LMStudioClient({
  baseUrl: "ws://localhost:1250",
});

// Basic, small wrapper store for model management
type LoadedModel = {
  key: string;
  handle: LLM;
};

// const client = createClient ? createClient({}) : ({} as any)

const state = reactive({
  loadedModels: [] as LoadedModel[],
  loading: false,
  loadingProgress: 0,
  loadingKey: null as string | null,
  downloadedModels: [] as ModelInfo[],
});

export async function getDownloadedModels() {
  if (!client.system?.listDownloadedModels) return [];
  const downloaded = await client.system.listDownloadedModels();
  state.downloadedModels = downloaded || [];
  return state.downloadedModels;
}

export async function listLoaded() {
  if (!client.llm?.listLoaded) return [];
  const loaded: LLM[] = await client.llm.listLoaded();
  // Expect loaded to be an array of { key, handle }
  state.loadedModels = (loaded || []).map((m) => ({
    key: m.identifier,
    handle: m,
  }));
  return state.loadedModels;
}

export async function unloadModel(handle: LLM) {
  if (!handle) return;
  if (handle.unload) {
    await handle.unload();
  }
  // Remove from state
  state.loadedModels = state.loadedModels.filter(
    (m) => m.key !== handle.identifier
  );
}

export async function loadModel(key: string) {
  if (!client.llm?.model) {
    throw new Error("LM client not available");
  }
  state.loading = true;
  state.loadingProgress = 0;
  state.loadingKey = key;
  let handle: LLM | null = null;
  try {
    handle = await client.llm.model(key, {
      onProgress: (progress) => {
        console.log(`Loading ${key}: ${progress}%`);
        state.loadingProgress = progress;
      },
    });

    // const handle = await client.llm.model(key)

    // If the handle offers progress events, listen to them.
    // if (handle && handle.on && typeof handle.on === 'function') {
    //   handle.on('progress', (p: number) => {
    //     state.loadingProgress = p
    //   })
    // }

    // If handle has a load() promise, await it to finish
    // if (handle && typeof handle.load === 'function') {
    //   await handle.load((progressCallback?: (n: number) => void) => {
    //     if (progressCallback) {
    //       // some SDKs may call this; ignore here
    //     }
    //   })
    // }

    // // Default: if handle has a ready promise property
    // if (handle && handle.ready instanceof Promise) {
    //   await handle.ready
    // }

    // Add to loaded models state (avoid duplicates)
    const exists = state.loadedModels.find(
      (m) => m.handle === handle || m.key === key
    );
    if (!exists) state.loadedModels.push({ key, handle });
  } catch (error) {
    //
  }
  state.loading = false;
  state.loadingProgress = 100;
  state.loadingKey = null;

  return handle;
}

export function useModelsState() {
  return {
    state: readonly(state),
    listLoaded,
    getDownloadedModels,
    loadModel,
    unloadModel,
  };
}
