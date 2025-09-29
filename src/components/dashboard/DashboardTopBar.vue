<template>
  <div class="topbar">
    <!-- 날짜 범위 필터 -->
    <div class="date-filter">
      <label class="label">기간</label>
      <input type="date" v-model="modelStartDate" class="input-date" />
      <span class="tilde">~</span>
      <input type="date" v-model="modelEndDate" class="input-date" />
      <button class="btn" :disabled="!modelStartDate || !modelEndDate" @click="$emit('apply')">적용</button>
      <button class="btn ghost" v-if="modelStartDate || modelEndDate" @click="$emit('clear')">초기화</button>
    </div>

    <!-- 우측: 범위/새로고침 + 전체/선택 토글 -->
    <div class="toolbar">
        <div class="toggle-container">
          <button @click="$emit('search', null)">모든 사업자 통계</button>
        </div>
        <div class="search-wrapper" ref="searchComponentRef" :class="{ 'is-focused': isInputFocused }">
          <input
            type="number"
            autocomplete="off"
            :value="businessNumberInput" 
            @blur="hideSuggestion"
            @input="handleInput"
            ref="inputRef"
            @focus="handleFocus"
            @keyup.enter="finalize"
            placeholder="사업자 번호 입력"
            class="search-input"
          >
          <SearchSuggestions
            v-if="isInputFocused"
            :keyword="businessNumberInput"
            :numbers="numbers"
            @select-suggestion="selectSuggestion"
          />
        </div>

      <select v-model.number="modelRangeDays" class="select">
        <option :value="7">최근 7일</option>
        <option :value="14">최근 14일</option>
        <option :value="30">최근 30일</option>
        <option :value="90">최근 90일</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import SearchSuggestions from './SearchSuggestions.vue'

const props = defineProps({
  startDate: String,
  endDate: String,
  rangeDays: { type: Number, default: 30 },
  loading: { type: Boolean, default: false },
  numbers: {type: Set, default: []},
  currentNumber: {type: String, default: ''}
})
const emit = defineEmits([
  'update:startDate', 'update:endDate', 'update:rangeDays', 'update:scope',
  'apply', 'clear', 'reload', 'search'
])

const modelStartDate = computed({
  get: () => props.startDate,
  set: v => emit('update:startDate', v)
})
const modelEndDate = computed({
  get: () => props.endDate,
  set: v => emit('update:endDate', v)
})
const modelRangeDays = computed({
  get: () => props.rangeDays,
  set: v => emit('update:rangeDays', v)
})
const modelScope = computed({
  get: () => props.scope,
  set: v => emit('update:scope', v)
})


const isInputFocused = ref(false);
const inputRef = ref(null);
const searchComponentRef = ref(null);
const businessNumber  = ref(null)
const businessNumberInput = ref(businessNumber.value);
const isControlClicked = ref(false);

const handleFocus = () => {
  isInputFocused.value = true;
};
const hideSuggestion = () => {
  isInputFocused.value = false;
}
watch(() => {
  businessNumberInput.value = props.currentNumber;
})
const handleInput = (event) => {
  businessNumberInput.value = event.target.value.replace(/\D/g, '');
}

//click outside 방식 
const handleClickOutside = (event) => {
  if (searchComponentRef.value && !searchComponentRef.value.contains(event.target)) {
    isInputFocused.value = false;
  }
};

const selectSuggestion = (suggestion) => {
  businessNumberInput.value = suggestion;
  finalize();
};

const finalize = () => {
  businessNumber.value = businessNumberInput.value;
  if(inputRef.value) {
    isInputFocused.value = false;
    inputRef.value?.blur();
    if(props.numbers.has(businessNumberInput.value)) {
      emit('search', businessNumber.value);
    }
    else {
      alert('존재하지 않는 사업자 번호입니다')
    }
  }
};
</script>

<style scoped>
.topbar{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin:6px 0 12px; flex-wrap:wrap; }
.date-filter{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.date-filter .label{ color:#475569; font-weight:700; }
.input-date{ border:1px solid #e5e7eb; border-radius:10px; padding:8px 10px; background:#fff; }
.tilde{ color:#94a3b8; }

.toolbar{ display:flex; align-items:center; gap:10px; margin:0; }
.select{ border:1px solid #e5e7eb; border-radius:10px; padding:13px 12px; background:#fff; }
.btn{ background:#111827; color:#fff; border:none; padding:10px 14px; border-radius:10px; font-weight:600; }
.btn.ghost{ background:#fff; color:#374151; border:1px solid #e5e7eb; }

/* 세그먼트 토글 */
.seg{ display:flex; gap:6px; }
.seg-btn{ background:#f1f5f9; color:#475569; border:none; padding:8px 12px; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer; }
.seg-btn.active{ background:#111827; color:#fff; }
.search-wrapper {
  width: 300px;
  position: relative;
  border: 1px solid #dbdbdb;
  border-radius: 20px;
}

.search-input {
  width: 300px;
  box-sizing: border-box;
  padding: 12px 16px;
  outline: none;
  border: 1px solid #b2b2b2;
  border-radius: 20px;
  font-size: 16px;
  border: none;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Chrome, Safari */
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
