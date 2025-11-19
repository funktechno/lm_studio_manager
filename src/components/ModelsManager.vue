<template>
  <section>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
      <select v-model="selectedModel" @change="updateNewKey">
        <option value="">-- Select downloaded model --</option>
        <option v-for="model in downloadedModels" :key="model.modelKey" :value="model.modelKey">{{ model.modelKey }}</option>
      </select>
      <input v-model="newKey" placeholder="Enter model key to load" />
      <button @click="onLoad" :disabled="loading">Load model</button>
      <button @click="refresh">Refresh list</button>
    </div>

    <div v-if="loading" style="margin-bottom:12px;">
      <strong>Loading:</strong> {{ loadingKey }} — {{ loadingProgress }}%
    </div>

    <ul>
      <li v-for="(m, idx) in loadedModels" :key="m.key + idx" style="margin-bottom:8px;">
        <strong>{{ m.key }}</strong>
        <button style="margin-left:8px;" @click="onUnload(m)">Unload</button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useModelsState } from '../stores/modelsManager'

const newKey = ref('')
const selectedModel = ref('')
const { state, listLoaded, getDownloadedModels, loadModel, unloadModel } = useModelsState()

const loadedModels = computed(() => state.loadedModels)
const downloadedModels = computed(() => state.downloadedModels)
const loading = computed(() => state.loading)
const loadingProgress = computed(() => state.loadingProgress)
const loadingKey = computed(() => state.loadingKey)

async function refresh() {
  await listLoaded()
  await getDownloadedModels()
}

function updateNewKey() {
  newKey.value = selectedModel.value
}

async function onUnload(model: any) {
  await unloadModel(model.handle)
}

async function onLoad() {
  const keyToLoad = selectedModel.value || newKey.value
  if (!keyToLoad) return
  await loadModel(newKey.value)
  newKey.value = ''
}

// initial load
refresh()
</script>

<style scoped>
input { padding:6px 8px; }
button { padding:6px 8px; }
</style>
