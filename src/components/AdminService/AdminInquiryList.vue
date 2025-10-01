<template>
  <div class="admin-inquiry-container">
    <h2 class="title">문의 관리</h2>

    <div class="card">
      <div class="filter-controls">
        <label for="statusFilter">상태 필터: </label>
        <select id="statusFilter" v-model="statusFilter" @change="loadInquiries">
          <option value="">전체</option>
          <option value="PENDING">접수됨</option>
          <option value="ANSWERED">답변 완료</option>
        </select>
      </div>

      <div class="table-container">
        <table class="inquiry-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>작성일</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="inquiries.content && inquiries.content.length > 0" v-for="inquiry in inquiries.content" :key="inquiry.id">
              <td>{{ inquiry.id }}</td>
              <td>{{ inquiry.title }}</td>
              <td>{{ inquiry.category }}</td>
              <td>{{ formatDate(inquiry.createdAt) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(inquiry.status)]">
                  {{ inquiry.status === 'PENDING' ? '접수됨' : '답변 완료' }}
                </span>
              </td>
              <td>
                <router-link :to="`/admin/inquiries/${inquiry.id}`" class="detail-button">상세보기</router-link>
              </td>
            </tr>
            <tr v-else>
              <td colspan="6" class="no-data">문의 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="inquiries.first">이전</button>
        <span>페이지 {{ page + 1 }} / {{ inquiries.totalPages || 1 }}</span>
        <button @click="nextPage" :disabled="inquiries.last">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchInquiries } from '@/api/adminInquiries';

const inquiries = ref({ content: [], first: true, last: true, totalPages: 1 });
const page = ref(0);
const statusFilter = ref('');

const loadInquiries = async () => {
  try {
    const res = await fetchInquiries(page.value, 10, statusFilter.value);
    inquiries.value = res.data;
  } catch (e) {
    console.error('문의 목록 로딩 오류:', e);
    alert('문의 목록을 불러오는 중 오류가 발생했습니다.');
  }
};

const nextPage = () => {
  if (!inquiries.value.last) {
    page.value++;
    loadInquiries();
  }
};

const prevPage = () => {
  if (!inquiries.value.first) {
    page.value--;
    loadInquiries();
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 문의 상태에 따라 다른 CSS 클래스를 반환하는 함수
const getStatusClass = (status) => {
  if (status === 'PENDING') return 'status-pending';
  if (status === 'ANSWERED') return 'status-answered';
  return '';
};

onMounted(() => {
  loadInquiries();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

.admin-inquiry-container {
  padding: 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
}

.card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.filter-controls {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-controls label {
  font-weight: 500;
  color: #555;
}

.filter-controls select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.filter-controls select:focus {
  outline: none;
  border-color: #007bff;
}

.table-container {
  overflow-x: auto; /* 화면이 좁을 때 가로 스크롤 생성 */
}

.inquiry-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.inquiry-table th,
.inquiry-table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.inquiry-table thead {
  background-color: #fafafa;
}

.inquiry-table th {
  font-weight: 500;
  color: #888;
  font-size: 0.9rem;
  border-bottom: 2px solid #eee;
}

.inquiry-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease-in-out;
}

.inquiry-table tbody tr:last-child {
  border-bottom: none;
}

.inquiry-table tbody tr:hover {
  background-color: #f9f9f9;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #999;
}

/* 상태 뱃지 스타일 */
.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.8rem;
  color: #fff;
  white-space: nowrap;
}

.status-pending {
  background-color: #f89a16; /* 노란색 */
}

.status-answered {
  background-color: #28a745; /* 초록색 */
}

/* 상세보기 버튼 스타일 */
.detail-button {
  padding: 0.4rem 1rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.detail-button:hover {
  background-color: #0056b3;
}

/* 페이지네이션 스타일 */
.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: #555;
}

.pagination button {
  padding: 0.5rem 1.2rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>