import { reactive, readonly } from "vue";
import { LLM, LLMInstanceInfo, LMStudioClient, ModelInfo } from "@lmstudio/sdk";
const client = new LMStudioClient({
  baseUrl: import.meta.env.VITE_LMSTUDIO_BASEURL || "ws://localhost:1250",
});

// Basic, small wrapper store for model management
type LoadedModel = {
  key: string;
  handle: LLM;
  info?: LLMInstanceInfo;
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
  state.loadedModels = await Promise.all(
    (loaded || []).map(async (m) => ({
      key: m.identifier,
      handle: m,
      info:
        typeof m.getModelInfo === "function" ? await m.getModelInfo() : null,
    }))
  );
  return state.loadedModels;
}

export async function unloadModel(handle: LLM) {
  if (!handle) return;
  if (handle.unload) {
    // Remove from state
    state.loadedModels = state.loadedModels.filter(
      (m) => m.key !== handle.identifier
    );
    try {
      await handle.unload();
    } catch (error) {
      // ignore errors
    }
  }
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
        // console.log(`Loading ${key}: ${progress}%`);
        state.loadingProgress = Number.parseFloat((progress * 100).toFixed(2));
      },
    });
    const info =
      typeof handle.getModelInfo === "function"
        ? await handle.getModelInfo()
        : null;

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
    if (!exists) state.loadedModels.push({ key, handle, info });
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
