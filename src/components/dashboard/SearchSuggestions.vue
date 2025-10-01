<template>
    <div class="suggestions-container">
        <ul class="suggestions-list">
        <li
            v-for="(suggestion, index) in filteredSuggestions"
            :key="index"
            class="suggestion-item"
            @mousedown.prevent="onSelect(suggestion)"
            v-html="highlightMatch(suggestion)"
        ></li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const emit = defineEmits(['select-suggestion'])
const onSelect = (suggestion) => {
  emit('select-suggestion', suggestion);
}
const props = defineProps({
  keyword: {
    type: String,
    requried: true
  },
  numbers: {
    type: Set,
    requried: true
  }
})

const filteredSuggestions = computed(() => {
  const keyword = props.keyword?.trim();

  const listToFilter = Array.from(props.numbers);
  if(!keyword) return listToFilter;
  return listToFilter.filter(item => {
    return item.startsWith(keyword);
  });
});

const highlightMatch = (suggestion) => {
  const keywordToHighlight = props.keyword;
  if (!keywordToHighlight || keywordToHighlight.trim() === '') {
    return suggestion;
  }
  //특수문자 예외 방지
  const escapedKeyword = keywordToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'i');
  return suggestion.replace(regex, '<strong>$1</strong>');
};
</script>

<style scoped>
/* 추천 검색어 컨테이너 스타일 */
.suggestions-container {
  position: absolute;
  width: 270px;
  left: 15px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-top: none; 
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 101;
  overflow-y: auto;
  max-height: 140px;
}
::-webkit-scrollbar {
  display: none;
}

.suggestions-divider {
  border: none;
  border-top: 1px solid #f3f4f6; /* 연한 회색 구분선 */
  margin: 8px 0;
}

.recent-searches-horizontal {
  padding: 8px 12px;
}

.suggestion-item {
  min-height: 20px;
  width: 100%;
}
.suggestion-item:hover {
  background-color: #f9fafb; /* 호버 효과 */
}

.box{
   -ms-overflow-style: none;
}
.box::-webkit-scrollbar{
  display:none;
}

/* 추천 검색어 목록 ul 태그 초기화 */
.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 각 추천 아이템 스타일 */
.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

/* 아이템에 마우스를 올렸을 때 배경색 변경 */
.suggestion-item:hover {
  background-color: #f5f5f5;
}

/* 검색 결과가 없을 때 표시되는 메시지 스타일 */
.no-results {
  padding: 12px 16px;
  color: #888;
  text-align: center;
}

/* 하이라이팅 스타일 (v-html 내부의 strong 태그에 적용) */
.suggestion-item :deep(strong) {
  color: #007bff; /* 원하는 하이라이트 색상 */
  font-weight: bold;
}
</style>