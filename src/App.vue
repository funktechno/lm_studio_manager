<template>
  <main>
    <h1>LM Studio Manager</h1>
    <ModelsManager />
  </main>
</template>

<script setup lang="ts">
import ModelsManager from './components/ModelsManager.vue'
</script>

<style>
body { font-family: system-ui, Arial, sans-serif; margin: 24px; }
main { max-width: 800px; }
</style>
