<template>
  <section>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
      <select v-model="selectedModel" @change="updateNewKey"
        style="padding:8px 10px;border-radius:6px;border:1px solid #ccc;background:#fff;min-width:280px;">
        <option value="">-- Select downloaded model --</option>
        <option v-for="model in downloadedModels" :key="model.modelKey" :value="model.modelKey">
          {{ model.displayName }}
          <!-- Key: {{ model.modelKey }}<br> -->
          <!-- Format: {{ model.format }}<br> -->
          Size: {{ (model.sizeBytes / (1024 * 1024)).toFixed(2) }} MB
          <span v-if="model.paramsString"> Params: {{ model.paramsString }}</span>
          Context: {{ new Intl.NumberFormat().format(model.maxContextLength) }} tokens
          <!-- <span v-if="model.architecture"> Arch: {{ model.architecture }}<br></span> -->
          <!-- <span v-if="model.quantization"> Quant: {{ model.quantization }}<br></span> -->
        </option>
      </select>

      <input v-model="newKey" placeholder="Enter model key to load"
        style="padding:8px 10px;border-radius:6px;border:1px solid #ccc;min-width:220px;" />

      <button @click="onLoad" :disabled="loading" :style="{
        background: '#2ecc71',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
      }">
        Load model
      </button>
      <button @click="refresh" :disabled="loading" :style="{
        background: 'blue',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
      }">Refresh list</button>

    </div>


    <div v-if="loading" style="margin-bottom:12px;">
      <strong>Loading:</strong> {{ loadingKey }} — {{ loadingProgress }}%
    </div>

    <ul style="list-style:none; padding:0;">
      <li v-for="(m, idx) in loadedModels" :key="m.key + idx" style="
      margin-bottom:12px;
      padding:12px;
      border:1px solid #ddd;
      border-radius:6px;
      background:#f9f9f9;
    ">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="font-size:1.1em; color:#333;">{{ m.handle.displayName }}</strong>
          </div>
          <button style="
          background:#e74c3c;
          color:white;
          border:none;
          padding:6px 12px;
          border-radius:4px;
          cursor:pointer;
        " @click="onUnload(m)">
            Unload
          </button>
        </div>

        <!-- Expanded model attributes -->
        <div style="margin-top:8px; font-size:0.9em; color:#444;">
          <p><strong>Identifier:</strong> {{ m.handle.identifier }}</p>
          <p><strong>Path:</strong> {{ m.handle.path }}</p>
          <p><strong>Model Key:</strong> {{ m.handle.modelKey }}</p>
          <template v-if="m.info">
            <p><strong>Context:</strong> {{ new Intl.NumberFormat().format(m.info?.contextLength) }} tokens</p>
          </template> 
          <p><strong>Format:</strong> {{ m.handle.format }}</p>
          <p><strong>Size:</strong> {{ (m.handle.sizeBytes / (1024 * 1024)).toFixed(2) }} MB</p>
          <p><strong>Vision Enabled:</strong> {{ m.handle.vision ? 'Yes' : 'No' }}</p>
          <p><strong>Trained for Tool Use:</strong> {{ m.handle.trainedForToolUse ? 'Yes' : 'No' }}</p>
        </div>
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
input {
  padding: 6px 8px;
}

button {
  padding: 6px 8px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 8px;
}

button {
  margin-left: 8px;
}
</style>
