<template>
  <div class="approval-container">
    <header>
      <h2>사업자 승인 관리</h2>
    </header>

    <div class="tabs">
      <button :class="{ active: activeTab === 'pending' }" @click="changeTab('pending')">
        승인 대기 ({{ pendingUsers.length }})
      </button>
      <button :class="{ active: activeTab === 'approved' }" @click="changeTab('approved')">
        승인 완료 ({{ approvedUsers.length }})
      </button>
      <button :class="{ active: activeTab === 'rejected' }" @click="changeTab('rejected')">
        거절 ({{ rejectedUsers.length }})
      </button>
    </div>

    <main class="content-area">
      <div class="user-list-panel">
        <ul v-if="activeTab === 'pending'" class="user-list">
          <li v-if="pendingUsers.length === 0">승인 대기 중인 사용자가 없습니다.</li>
          <li v-for="user in pendingUsers" :key="user.username"
              :class="{ selected: selectedUser && selectedUser.username === user.username }"
              @click="selectUser(user)" class="user-item">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-id">{{ user.username }}</span>
          </li>
        </ul>

        <ul v-if="activeTab === 'approved'" class="user-list">
          <li v-if="approvedUsers.length === 0">승인된 사용자가 없습니다.</li>
           <li v-for="user in approvedUsers" :key="user.username"
              :class="{ selected: selectedUser && selectedUser.username === user.username }"
              @click="selectUser(user)" class="user-item">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-id">{{ user.username }}</span>
          </li>
        </ul>

        <ul v-if="activeTab === 'rejected'" class="user-list">
          <li v-if="rejectedUsers.length === 0">거절된 사용자가 없습니다.</li>
          <li v-for="user in rejectedUsers" :key="user.username"
              :class="{ selected: selectedUser && selectedUser.username === user.username }"
              @click="selectUser(user)" class="user-item">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-id">{{ user.username }}</span>
          </li>
        </ul>
      </div>

      <div class="user-details-panel">
        <div v-if="selectedUser" class="details-card">
          <h3>상세정보</h3>
          <ul>
            <li><strong>이름</strong> {{ selectedUser.name }}</li>
            <li><strong>이메일</strong> {{ selectedUser.username }}</li>
            <li><strong>사업자 등록번호</strong> {{ selectedUser.businessRegistrationNumber }}</li>
            <li><strong>연락처</strong> {{ selectedUser.phoneNumber }}</li>
            <li><strong>가입일</strong> {{ formatDate(selectedUser.joinDate) }}</li>
            <li><strong>상태</strong> <span :class="`status-${selectedUser.approvalStatus.toLowerCase()}`">{{ statusToKorean(selectedUser.approvalStatus) }}</span></li>
          </ul>

          <div v-if="selectedUser.approvalStatus === 'PENDING'" class="action-buttons">
            <button class="approve-btn" @click="handleApprove(selectedUser.username)">승인</button>
            <button class="reject-btn" @click="handleReject(selectedUser.username)">거절</button>
          </div>
          
          <div v-if="selectedUser.approvalStatus === 'APPROVED'" class="action-buttons">
            <button class="pending-btn" @click="handleChangeToPending(selectedUser.username)">대기</button>
            <button class="reject-btn" @click="handleChangeToRejected(selectedUser.username)">차단</button>
          </div>
          
          <div v-if="selectedUser.approvalStatus === 'REJECTED'" class="action-buttons">
            <button class="pending-btn" @click="handleChangeToPending(selectedUser.username)">대기</button>
            <button class="delete-btn" @click="handleDelete(selectedUser.username)">최종 삭제</button>
          </div>

        </div>
        <div v-else class="details-placeholder">
          <p>왼쪽 목록에서 사용자를 선택하여 정보를 확인하세요.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';

const users = ref([]);
const activeTab = ref('pending');
const selectedUser = ref(null);

const pendingUsers = computed(() => users.value.filter(u => u.approvalStatus === 'PENDING'));
const approvedUsers = computed(() => users.value.filter(u => u.approvalStatus === 'APPROVED'));
// [추가] 거절된 사용자 목록
const rejectedUsers = computed(() => users.value.filter(u => u.approvalStatus === 'REJECTED'));

// 목록 가져오기 (기존과 동일)
const fetchUsers = async () => {
  try {
    const response = await api.get('/api/admin/business-users');
    users.value = response.data;
  } catch (error) { console.error("목록 조회 실패:", error); }
};

// 상세 정보 가져오기 (기존과 동일)
const selectUser = async (user) => {
  try {
    const response = await api.get(`/api/admin/business-users/${user.username}`);
    selectedUser.value = response.data;
  } catch (error) { console.error("상세 정보 조회 실패:", error); }
};

// [수정] 승인 처리 (PENDING -> APPROVED)
const handleApprove = async (username) => {
  if (!confirm("승인 처리하시겠습니까?")) return;
  try {
    await api.patch(`/api/admin/business-users/${username}/approve`);
    updateUserStatus(username, 'APPROVED');
    alert("승인 처리되었습니다.");
  } catch (error) { alert("승인 실패"); }
};

// [수정] 거절 처리 (PENDING -> REJECTED)
const handleReject = async (username) => {
  if (!confirm("거절 처리하시겠습니까?")) return;
  try {
    await api.patch(`/api/admin/business-users/${username}/to-rejected`);
    updateUserStatus(username, 'REJECTED');
    alert("거절 처리되었습니다.");
  } catch (error) { alert("거절 실패"); }
};

// [추가] 최종 삭제 (DB에서 제거)
const handleDelete = async (username) => {
  if (!confirm("정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
  try {
    await api.delete(`/api/admin/business-users/${username}`);
    users.value = users.value.filter(u => u.username !== username);
    selectedUser.value = null;
    alert("삭제되었습니다.");
  } catch (error) { alert("삭제 실패"); }
};

// [추가] '대기' 상태로 변경 (APPROVED -> PENDING)
const handleChangeToPending = async (username) => {
  if (!confirm("'대기' 상태로 변경하시겠습니까?")) return;
  try {
    await api.patch(`/api/admin/business-users/${username}/to-pending`);
    updateUserStatus(username, 'PENDING');
    alert("'대기' 상태로 변경되었습니다.");
  } catch (error) { alert("상태 변경 실패"); }
};

// [추가] '차단(거절)' 상태로 변경 (APPROVED -> REJECTED)
const handleChangeToRejected = async (username) => {
  if (!confirm("'차단(거절)' 상태로 변경하시겠습니까?")) return;
  try {
    await api.patch(`/api/admin/business-users/${username}/to-rejected`);
    updateUserStatus(username, 'REJECTED');
    alert("'차단(거절)' 상태로 변경되었습니다.");
  } catch (error) { alert("상태 변경 실패"); }
};

// --- 유틸리티 함수 ---

// [추가] 로컬 상태 업데이트 함수 (중복 제거)
const updateUserStatus = (username, newStatus) => {
    const userInList = users.value.find(u => u.username === username);
    if (userInList) userInList.approvalStatus = newStatus;
    if (selectedUser.value && selectedUser.value.username === username) {
        selectedUser.value.approvalStatus = newStatus;
    }
};

const changeTab = (tab) => {
  activeTab.value = tab;
  selectedUser.value = null;
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '';

const statusToKorean = (status) => {
  const statusMap = {
    PENDING: '승인 대기',
    APPROVED: '승인 완료',
    REJECTED: '거절'
  };
  return statusMap[status] || status;
};

onMounted(fetchUsers);
</script>


<style scoped>
/* CSS는 변경 사항이 없으므로 그대로 사용하시면 됩니다. */
.approval-container {
  padding: 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f9f9f9;
}

header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.8rem 1.5rem;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease-in-out;
}

.tabs button.active {
  color: #2c3e50;
  border-bottom-color: #2c3e50;
}

.content-area {
  display: flex;
  gap: 2rem;
  height: 60vh;
}

.user-list-panel, .user-details-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 1.5rem;
  overflow-y: auto;
}

.user-list-panel {
  flex: 1;
}

.user-details-panel {
  flex: 2;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f5f5f5;
}

.user-item.selected {
  background-color: #e0f2f1;
  font-weight: 700;
}

.user-name {
  font-weight: 600;
}
.user-id {
  color: #777;
  font-size: 0.9rem;
}

.details-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.details-card ul {
  list-style: none;
  padding: 0;
}

.details-card li {
  font-size: 1rem;
  padding: 0.7rem 0;
}

.details-card li strong {
  display: inline-block;
  width: 120px;
  color: #555;
}

.status-pending { color: #f39c12; font-weight: bold; }
.status-approved { color: #27ae60; font-weight: bold; }

.details-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.action-buttons {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-buttons button {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  transition: opacity 0.2s;
}
.action-buttons button:hover {
  opacity: 0.85;
}

.approve-btn {
  background-color: #27ae60;
}

.reject-btn {
  background-color: #e74c3c;
}
.delete-btn { background-color: #e74c3c; } /* 최종 삭제 버튼 */
.pending-btn { background-color: #3498db; } /* 대기 버튼 */
</style>