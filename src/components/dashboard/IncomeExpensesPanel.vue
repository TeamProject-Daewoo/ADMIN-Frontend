<template>
  <div class="panel tall">
    <div class="panel-head">
      <h3>최근 매출 Top 10</h3>
      <div class="toggle-container">
        <button v-if="btnHide"
          @click="toggleKey(currentKey)"
          >
          {{ currentText }}
        </button>
        <select class="select sm" :value="rangeDays" @change="$emit('update:rangeDays', Number($event.target.value))">
          <option :value="7">최근 7일</option>
          <option :value="14">최근 14일</option>
          <option :value="30">최근 30일</option>
          <option :value="90">최근 90일</option>
        </select>
      </div>
    </div>
    <apexchart v-if="!loading" type="line" height="360" :options="incomeExpenseChart.options" :series="incomeExpenseChart.series" />
    <div v-else class="skeleton-chart"/>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import apexchart from 'vue3-apexcharts'
defineProps({
  loading: Boolean,
  rangeDays: Number,
  incomeExpenseChart: Object,
  btnHide: Boolean
})
const emit = defineEmits(['update:rangeDays', 'update:top10-key-type'])
const currentKey = ref('title');
const currentText = ref('호텔별')
const toggleKey = (keyType) => {
  currentKey.value = (keyType === 'title' ? 'businessNumber' : 'title') 
  currentText.value = (keyType === 'title') ? '사업자별' : '호텔별'
  emit('update:top10-key-type', currentKey.value);
};
onMounted(() => {
  emit('update:top10-key-type', currentKey.value);
});
</script>

<style scoped>
.panel.tall{ display:flex; flex-direction:column; min-height:430px; }
.skeleton-chart{ height:260px; border-radius:12px; background: repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6 10px,#e5e7eb 10px,#e5e7eb 20px); }
</style>
