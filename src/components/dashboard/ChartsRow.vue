<template>
  <div class="grid mid">
    <div class="panel">
      <div class="panel-head">
        <h3>{{ titles[0] }}</h3>
        <select class="select sm" :value="pkgRangeDays" @change="$emit('update:pkgRangeDays', Number($event.target.value))">
          <option :value="7">최근 7일</option>
          <option :value="14">최근 14일</option>
          <option :value="30">최근 30일</option>
          <option :value="90">최근 90일</option>
        </select>
      </div>
      <apexchart v-if="!loading" type="bar" height="300" :options="topPkgChart.options" :series="topPkgChart.series" />
      <div v-else class="skeleton-chart"/>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>{{ titles[1] }}</h3>
           <div class="toggle-container">
              <button v-if="btnHide"
                @click="toggleKey(currentKey[0], 0)"
                >
                {{ currentText[0] }}
              </button>
              <span class="muted">최근 {{ dayCount }}일</span>
          </div>
      </div>
      <apexchart v-if="!loading" type="bar" height="300" :options="revenueChart.options" :series="revenueChart.series" />
      <div v-else class="skeleton-chart"/>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>{{ titles[2] }}</h3>
        <div class="toggle-container">
          <button v-if="btnHide"
            @click="toggleKey(currentKey[1], 1)"
            >
            {{ currentText[1] }}
          </button>
          <select class="select sm" :value="typeRangeDays" @change="$emit('update:typeRangeDays', Number($event.target.value))">
            <option :value="7">최근 7일</option>
            <option :value="14">최근 14일</option>
            <option :value="30">최근 30일</option>
            <option :value="90">최근 90일</option>
          </select>
        </div>
      </div>
      <apexchart v-if="!loading" type="donut" height="300" :options="roomTypeChart.options" :series="roomTypeChart.series" />
      <div v-else class="skeleton-chart"/>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import apexchart from 'vue3-apexcharts'
const props = defineProps({
  loading: Boolean,
  dayCount: Number,
  pkgRangeDays: Number,
  typeRangeDays: Number,
  topPkgChart: Object,
  revenueChart: Object,
  roomTypeChart: Object,
  btnHide: Boolean,
  titles: Array
})
const emit = defineEmits(['update:pkgRangeDays','update:typeRangeDays', 'update:revenue-key-type', 'update:reserv-key-type'])
const currentKey = ref(['title', 'title']);
const currentText = ref(['호텔별', '호텔별'])
const toggleKey = (keyType, idx) => {
  currentKey.value[idx] = (keyType === 'title' ? 'businessNumber' : 'title') 
  currentText.value[idx] = (keyType === 'title') ? '사업자별' : '호텔별'
  emit('update:'+((idx === 0) ? 'revenue' : 'reserv') +'-key-type', currentKey.value[idx]);
};
onMounted(() => {
  emit('update:revenue-key-type', currentKey.value[0]);
  emit('update:reserv-key-type', currentKey.value[1]);
});
</script>

<style scoped>
.skeleton-chart{ height:260px; border-radius:12px; background: repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6 10px,#e5e7eb 10px,#e5e7eb 20px); }
</style>
