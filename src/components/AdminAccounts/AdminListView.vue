<template>
  <div class="admin-list-container">
    <div class="header">
      <h1>관리자 계정 목록</h1>
      <router-link to="/admin/account/create" class="create-btn">새 관리자 생성</router-link>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>아이디</th>
            <th>권한</th>
            <th>생성일자</th>
            <th>관리</th> </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">로딩 중...</td>
          </tr>
          <tr v-else-if="admins.length === 0">
            <td colspan="5">등록된 관리자 계정이 없습니다.</td>
          </tr>
          <tr v-for="admin in admins" :key="admin.username">
            <td>{{ admin.name }}</td>
            <td>{{ admin.username }}</td>
            <td><span class="role-badge">{{ admin.role }}</span></td>
            <td>{{ formatDate(admin.createdAt) }}</td>
            <td>
              <button @click="deleteAdmin(admin)" class="delete-btn">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';

const admins = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get('/api/admin/list');
    admins.value = data;
  } catch (error) {
    console.error("관리자 목록 조회 실패:", error);
    alert("관리자 목록을 불러오는 데 실패했습니다.");
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr) => {
  return dateStr ? new Date(dateStr).toLocaleString('ko-KR') : '-';
};

// ✨ 추가된 부분: 관리자 삭제 함수
const deleteAdmin = async (adminToDelete) => {
  // 사용자에게 정말 삭제할 것인지 확인받습니다.
  if (!confirm(`'${adminToDelete.name}'(${adminToDelete.username}) 관리자를 정말 삭제하시겠습니까?`)) {
    return;
  }

  try {
    // 서버에 삭제 요청을 보냅니다. (엔드포인트는 실제 API에 맞게 조정하세요)
    await api.delete(`/api/admin/delete/${adminToDelete.username}`);

    // API 호출 성공 시, 화면에서도 해당 관리자를 제거합니다.
    admins.value = admins.value.filter(admin => admin.username !== adminToDelete.username);

    alert("관리자 계정이 성공적으로 삭제되었습니다.");

  } catch (error) {
    console.error("관리자 삭제 실패:", error);
    alert("관리자 계정 삭제에 실패했습니다.");
  }
};
</script>

<style scoped>
.admin-list-container { max-width: 1000px; margin: 1rem auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.create-btn { padding: 0.5rem 1rem; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
.table-card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
th { background-color: #f9fafb; font-weight: 500; color: #6b7280; }
td { color: #374151; }
.role-badge { background-color: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }

.delete-btn {
  padding: 0.3rem 0.8rem;
  background-color: #ef4444; /* 빨간색 배경 */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #dc2626; /* 호버 시 더 진한 빨간색 */
}

/* 관리 컬럼 가운데 정렬 */
th:last-child,
td:last-child {
  text-align: center;
}
</style>