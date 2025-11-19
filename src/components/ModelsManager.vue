<template>
  <section>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
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
const { state, listLoaded, loadModel, unloadModel } = useModelsState()

const loadedModels = computed(() => state.loadedModels)
const loading = computed(() => state.loading)
const loadingProgress = computed(() => state.loadingProgress)
const loadingKey = computed(() => state.loadingKey)

async function refresh() {
  await listLoaded()
}

async function onUnload(model: any) {
  await unloadModel(model.handle)
}

async function onLoad() {
  if (!newKey.value) return
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
