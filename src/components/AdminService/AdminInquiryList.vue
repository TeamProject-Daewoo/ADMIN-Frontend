<template>
  <div class="admin-inquiry-list">
    <h2>문의 목록</h2>

    <div class="filter">
      <label>상태 필터: </label>
      <select v-model="statusFilter" @change="loadInquiries">
        <option value="">전체</option>
        <option value="PENDING">접수됨</option>
        <option value="ANSWERED">답변 완료</option>
      </select>
    </div>

    <table class="inquiry-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>제목</th>
          <th>카테고리</th>
          <th>작성일</th>
          <th>상태</th>
          <th>보기</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inquiry in inquiries.content" :key="inquiry.id">
          <td>{{ inquiry.id }}</td>
          <td>{{ inquiry.title }}</td>
          <td>{{ inquiry.category }}</td>
          <td>{{ formatDate(inquiry.createdAt) }}</td>
          <td>{{ inquiry.status }}</td>
          <td>
            <router-link :to="`/admin/inquiries/${inquiry.id}`" class="detail-link">상세보기</router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="inquiries.first">이전</button>
      <span>페이지 {{ page + 1 }}</span>
      <button @click="nextPage" :disabled="inquiries.last">다음</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchInquiries } from '@/api/adminInquiries';

const inquiries = ref({ content: [], first: true, last: true });
const page = ref(0);
const statusFilter = ref('');

const loadInquiries = async () => {
  try {
    const res = await fetchInquiries(page.value, 10, statusFilter.value);
    inquiries.value = res.data;
  } catch (e) {
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
  if (!inquiries.value.first && page.value > 0) {
    page.value--;
    loadInquiries();
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

onMounted(() => {
  loadInquiries();
});
</script>

<style scoped>
.admin-inquiry-list {
  max-width: 900px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.filter {
  margin-bottom: 15px;
}

.inquiry-table {
  width: 100%;
  border-collapse: collapse;
}

.inquiry-table th,
.inquiry-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.detail-link {
  color: #1976d2;
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
