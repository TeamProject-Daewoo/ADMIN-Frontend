<template>
  <div v-if="notice" class="notice-detail">
    <!-- 제목 -->
    <h2 class="title" v-if="!isEditing">{{ notice.title }}</h2>
    <input v-else v-model="editTitle" class="edit-title" />

    <!-- 메타 정보 -->
    <div class="meta" v-if="!isEditing">
      <span class="category" :class="notice.category">{{ categoryLabel(notice.category) }}</span>
      <span class="date">작성일: {{ formatDate(notice.createdAt) }}</span>
    </div>

    <hr />

    <!-- 내용 -->
    <div class="content" v-if="!isEditing" v-html="notice.content"></div>
    <textarea v-else v-model="editContent" class="edit-content"></textarea>

    <!-- 버튼들 -->
    <div class="buttons">
      <button v-if="!isEditing" @click="startEditing">수정하기</button>
      <button v-else @click="saveEdit" :disabled="loading">
        {{ loading ? '저장 중...' : '저장' }}
      </button>
      <button v-if="isEditing" @click="cancelEdit" :disabled="loading">취소</button>
    </div>

    <p v-if="message" :class="{ error: isError, success: !isError }">{{ message }}</p>
  </div>

  <div v-else class="loading">
    로딩 중...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axios'; // jwt 포함된 axios 인스턴스

const route = useRoute();
const router = useRouter();  // <-- 라우터 추가
const notice = ref(null);

const isEditing = ref(false);
const editTitle = ref('');
const editContent = ref('');
const loading = ref(false);
const message = ref('');
const isError = ref(false);

const categoryLabel = (cat) => {
  switch (cat) {
    case 'notice': return '공지';
    case 'patch': return '패치';
    case 'event': return '이벤트';
    default: return '';
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

onMounted(async () => {
  const id = route.params.id;
  try {
    // 관리자 API 경로 사용
    const res = await api.get(`/api/admin/notices/${id}`);
    notice.value = res.data;
  } catch (error) {
    console.error('공지 상세 조회 실패:', error);
    message.value = '공지사항을 불러오는데 실패했습니다.';
    isError.value = true;
  }
});

const startEditing = () => {
  if (!notice.value) return;
  isEditing.value = true;
  editTitle.value = notice.value.title;
  editContent.value = notice.value.content;
  message.value = '';
  isError.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
  message.value = '';
  isError.value = false;
};

const saveEdit = async () => {
  // 1. 제목과 내용이 비어있는지 먼저 확인합니다.
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    message.value = '제목과 내용을 모두 입력해주세요.';
    isError.value = true;
    return;
  }

  // 2. 사용자에게 수정 여부를 물어보고 확인합니다.
  if (!confirm('수정하시겠습니까?')) {
    return; // 사용자가 '취소'를 누르면 여기서 함수를 종료합니다.
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const id = route.params.id;
    await api.put(`/api/admin/notices/${id}`, {
      title: editTitle.value,
      content: editContent.value,
      category: notice.value.category,
    });

    // 3. 수정 성공 시 alert 알림을 띄웁니다.
    alert('공지사항이 성공적으로 수정되었습니다.');

    // 4. 사용자가 alert의 '확인'을 누르면 목록 페이지로 이동합니다.
    router.push('/admin/notices');

  } catch (error) {
    console.error('공지 수정 실패:', error);
    if (error.response && error.response.status === 403) {
      message.value = '권한이 없습니다.';
    } else {
      message.value = '공지사항 수정 중 오류가 발생했습니다.';
    }
    isError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.notice-detail {
  max-width: 700px;
  margin: 40px auto;
  font-family: "Noto Sans KR", sans-serif;
  background: #fff;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.edit-title {
  width: 100%;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
  padding: 8px;
  box-sizing: border-box;
}

.meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.category {
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  user-select: none;
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

.date {
  color: #666;
  font-size: 0.9rem;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 25px 0;
}

.content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap;
}

.edit-content {
  width: 100%;
  min-height: 200px;
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 10px;
  box-sizing: border-box;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  margin-right: 10px;
  padding: 8px 14px;
  font-size: 1rem;
  cursor: pointer;
}

.loading {
  max-width: 700px;
  margin: 80px auto;
  font-size: 1.3rem;
  color: #999;
  text-align: center;
  font-family: "Noto Sans KR", sans-serif;
}

p.error {
  color: #e74c3c;
  margin-top: 15px;
  font-weight: 600;
  text-align: center;
}

p.success {
  color: #27ae60;
  margin-top: 15px;
  font-weight: 600;
  text-align: center;
}
</style>
