<script setup>
import { ref } from 'vue'

defineProps({
  msg: {
    type: String,
    default: () => '测试'
  },
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button class="text-md bg-slate-600 text-white py-4 px-4 rounded-md hover:bg-slate-700" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
