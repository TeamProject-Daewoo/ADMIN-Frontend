<template>
  <div class="notice-list">
    <h2>공지사항</h2>

    <div class="filter-bar">
      <button :class="{ active: selectedCategory === '' }" @click="selectedCategory = ''; fetchNoticesPaged(0)">전체</button>
      <button :class="{ active: selectedCategory === 'notice' }" @click="selectedCategory = 'notice'; fetchNoticesPaged(0)">공지</button>
      <button :class="{ active: selectedCategory === 'patch' }" @click="selectedCategory = 'patch'; fetchNoticesPaged(0)">패치</button>
      <button :class="{ active: selectedCategory === 'event' }" @click="selectedCategory = 'event'; fetchNoticesPaged(0)">이벤트</button>

      <input type="text" v-model="searchTerm" placeholder="제목" @input="fetchNoticesPaged(0)" />
      <button class="btn-create" @click="goToCreate">글쓰기</button>
    </div>

    <ul class="notice-items">
      <li
        v-for="notice in filteredNotices"
        :key="notice.id"
        class="notice-item"
        @click="goDetail(notice.id)"
      >
        <span class="category" :class="notice.category">{{ categoryLabel(notice.category) }}</span>
        <span class="title">{{ notice.title }}</span>
        <span class="date">{{ formatDate(notice.createdAt) }}</span>

        <!-- 삭제 버튼 추가 -->
        <button class="btn-delete" @click.stop="deleteNotice(notice.id)">삭제</button>
      </li>
    </ul>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="goPrev" :disabled="currentPage === 0">이전</button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page - 1 === currentPage }"
        @click="goPage(page - 1)"
      >
        {{ page }}
      </button>

      <button @click="goNext" :disabled="currentPage === totalPages - 1">다음</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import notice from '@/api/axios';

const router = useRouter();

const notices = ref([]);
const selectedCategory = ref('');
const searchTerm = ref('');
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = 10;

const goToCreate = () => {
  router.push({ name: 'NoticeCreate' });
};

const filteredNotices = computed(() => {
  return notices.value.filter(n => {
    const matchCategory = selectedCategory.value === '' || n.category === selectedCategory.value;
    const matchSearch = n.title.toLowerCase().includes(searchTerm.value.toLowerCase());
    return matchCategory && matchSearch;
  });
 
});


const categoryLabel = (cat) => {
  switch (cat) {
    case 'notice':
      return '공지';
    case 'patch':
      return '점검';
    case 'event':
      return '이벤트';
    default:
      return '';
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toISOString().split('T')[0];
};

const goDetail = (id) => {
  router.push({ name: 'NoticeDetail', params: { id } });
};

const fetchNoticesPaged = async (page = 0) => {
  try {
    const res = await notice.get(`${import.meta.env.VITE_BACK_ADMIN_URL}/api/admin/notices/paged?page=${page}&size=${pageSize}`);
    notices.value = res.data.content;
    totalPages.value = res.data.totalPages;
    currentPage.value = res.data.pageNumber;
  } catch (error) {
    console.error('공지사항 불러오기 실패:', error);
  }
};

const deleteNotice = async (id) => {
  try {
      if (!confirm('삭제하시겠습니까?')) {
    return; // 사용자가 '취소'를 누르면 여기서 함수를 종료합니다.
  }
    await notice.delete(`/api/admin/notices/${id}`);
    // 삭제 성공 후 리스트 새로고침
    fetchNoticesPaged(currentPage.value);
    alert('게시글이 삭제되었습니다');
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const goPage = (page) => {
  if (page < 0 || page >= totalPages.value) return;
  fetchNoticesPaged(page);
};

const goNext = () => {
  if (currentPage.value < totalPages.value - 1) {
    fetchNoticesPaged(currentPage.value + 1);
  }
};

const goPrev = () => {
  if (currentPage.value > 0) {
    fetchNoticesPaged(currentPage.value - 1);
  }
};

fetchNoticesPaged(0);

watch([selectedCategory, searchTerm], () => {
  fetchNoticesPaged(0);
});
</script>

<style scoped>
.notice-list {
  max-width: 900px;
  margin: 40px auto;
  font-family: "Noto Sans KR", sans-serif;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  text-align: left;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-bar button {
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  background-color: #e0e0e0;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-bar button.active {
  background-color: #42b983;
  color: white;
}

.filter-bar input {
  margin-left: auto;
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 200px;
}

.notice-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-items li {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  position: relative;
}

.notice-items li:hover {
  background-color: #f0f9f5;
}

.category {
  display: inline-block;
  width: 50px;
  font-weight: 600;
  text-align: center;
  margin-right: 10px;
  border-radius: 6px;
  padding: 4px 6px;
  color: white;
  font-size: 0.9rem;
}

.category.notice {
  background-color: #3498db;
}
.category.patch {
  background-color: #27ae60;
}
.category.event {
  background-color: #9b59b6;
}

.title {
  flex: 1;
  color: #333;
}
.title:hover {
  color: #42b983;
}

.date {
  font-size: 0.85rem;
  color: #888;
  margin-left: 10px;
}

/* 삭제 버튼 스타일 */
.btn-delete {
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 0.85rem;
  transition: background-color 0.2s ease;
}

.btn-delete:hover {
  background-color: #c0392b;
}

/* 페이징 버튼 스타일 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pagination button {
  padding: 6px 12px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button.active {
  background-color: #42b983;
  color: white;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ===== [추가] 오른쪽 액션 영역 스타일 ===== */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions input {
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 200px;
}

/* ===== [추가] 글쓰기 버튼 스타일 ===== */
.btn-create {
  background-color: #42b983 !important;
  color: white;
}
.btn-create:hover {
  background-color: #36a473 !important;
}
</style>
