<template>
  <div>
    测试自动导入
  </div>
  <p>{{ count }}</p>
</template>

<script setup>
const count = ref(0)

onMounted(() => {
  emitter.on('getCount', (numData) => {
    count.value = numData.count
  })
})

onUnmounted(() => {
  emitter.off('getCount')
})
</script>