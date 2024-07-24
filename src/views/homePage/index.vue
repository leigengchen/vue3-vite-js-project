
<template>
  <div>
    <h1>首页</h1>
    <button class="text-md p-2 ml-4 bg-blue-500 text-white rounded-md mx-auto my-4" @click="toDetailPage">详情</button>
    <div class="flex justify-start items-center mt-8 ml-4 :sm:ml-0">
      <img src="../../../public/vite.svg" alt="" class="w-10 h-10 mr-4">
      <div class="flex flex-col justify-center items-start">
        <h2 class="text-lg font-bold">文章标题</h2>
        <p class="text-gray-600 text-0sm">文章详情</p>
      </div>
    </div>
    <p>{{ nowTime }}</p>
  </div>
</template>

<script setup>
const router = useRouter();
const nowTime = computed(() => parseTime(new Date()))

const toDetailPage = () => {
  router.push('/detailPage')
}
</script>