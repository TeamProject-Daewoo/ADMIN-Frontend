<template>
  <div class="dashboard">
    <div class="main-dashboard-title">
      <h1>대시보드</h1>
      <p>현재 사업자: <b :class="currentNumberStyle">{{ currentNumber === null ? '모두' : currentNumber }}</b></p>
    </div>
    <div class="headline-divider"></div>
    <DashboardPage @set-number="(value) => currentNumber = value" />
  </div>
</template>
g
<script setup>
import { RouterLink } from 'vue-router'
import DashboardPage from '@/components/dashboard/DashboardPage.vue';
import { ref, watch } from 'vue';

const currentNumber = ref(null);
const currentNumberStyle = ref('not-selected-business-number')
watch(() => currentNumber.value, 
  () => {
    currentNumberStyle.value = currentNumber.value !== null ? 'selected-business-number' : 'not-selected-business-number'
})

</script>

<style scoped>
.dashboard { max-width: 100%; }
.main-dashboard-title {display: flex; justify-content: space-between;}
.hint { margin: 12px 0; color: #6b7280; }
.headline-divider { height:1px; background:#e5e7eb; margin:8px 0 14px; }
.not-selected-business-number { color: rgb(61, 136, 235); }
.selected-business-number { color: rgb(43, 136, 43)}
</style>
