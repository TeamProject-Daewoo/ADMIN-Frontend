<template>
  <div class="admin-inquiry-detail">
    <h2>문의 상세</h2>

    <div v-if="inquiry" class="detail-container">
      <p><strong>제목:</strong> {{ inquiry.title }}</p>
      <p><strong>내용:</strong> {{ inquiry.content }}</p>
      <p><strong>카테고리:</strong> {{ inquiry.category }}</p>
      <p><strong>작성일:</strong> {{ formatDate(inquiry.createdAt) }}</p>
      
      <div v-if="inquiry.inquiryFiles && inquiry.inquiryFiles.length">
        <strong>첨부파일:</strong>
        <ul>
          <li v-for="file in inquiry.inquiryFiles" :key="file.id">
            <a :href="fullFileUrl(file.filePath)" target="_blank" rel="noopener noreferrer">
              {{ file.fileName }}
            </a>
            <button @click="downloadFile(file.id)">다운로드</button>
          </li>
        </ul>
      </div>

      <p><strong>상태:</strong> {{ inquiry.status }}</p>

      <hr />

      <div v-if="inquiry.answerContent" class="answer-section">
        <h3>답변</h3>
        <p>{{ inquiry.answerContent }}</p>
        <p><strong>답변자:</strong> {{ inquiry.adminUsername }}</p>
        <p><strong>답변일:</strong> {{ formatDate(inquiry.answeredAt) }}</p>
      </div>

      <div v-else class="answer-section">
        <h3>답변 작성</h3>
        <textarea
          v-model="answerContent"
          rows="6"
          placeholder="답변을 입력하세요..."
        ></textarea>
        <br />
        <button @click="submitAnswer">답변 등록</button>
      </div>

      <button class="back-button" @click="goBack">목록으로 돌아가기</button>
    </div>

    <div v-else>
      <p>로딩 중...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchInquiryDetail, postAnswer } from '@/api/adminInquiries';

const route = useRoute();
const router = useRouter();

const inquiry = ref(null);
const answerContent = ref('');

// 문의 상세 로드
const loadDetail = async () => {
  try {
    const res = await fetchInquiryDetail(route.params.id);
    inquiry.value = res.data;
  } catch (e) {
    alert('문의 상세를 불러오는 중 오류가 발생했습니다.');
  }
};

// 컴포넌트 마운트 시 상세 데이터 불러오기
onMounted(() => {
  loadDetail();
});

// 답변 제출
const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    alert('답변 내용을 입력하세요.');
    return;
  }

  try {
    await postAnswer(inquiry.value.id, answerContent.value, 'admin'); // 실제 관리자 아이디로 바꿔주세요
    alert('답변이 등록되었습니다.');
    router.push('/admin/inquiries');
  } catch (e) {
    alert('답변 등록 중 오류가 발생했습니다.');
  }
};

// 목록으로 돌아가기
const goBack = () => {
  router.push('/admin/inquiries');
};

// 날짜 형식화
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

// 파일 다운로드 - 백엔드 API 호출하여 다운로드
const downloadFile = (fileId) => {
  if (!inquiry.value) return;

  const inquiryId = inquiry.value.id;
  const url = `${import.meta.env.VITE_BACK_ADMIN_URL}/admin/inquiries/${inquiryId}/download/${fileId}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', ''); // 파일명은 서버가 응답 헤더로 지정함
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 전체 파일 URL 생성 (첨부파일 직접 열 때 사용)
const fullFileUrl = (path) => {
  if (!path) return '#';
  return path.startsWith('/')
    ? `${import.meta.env.VITE_BACK_ADMIN_URL}/${path}`
    : `${import.meta.env.VITE_BACK_ADMIN_URL}/${path}`;
};
  
</script>

<style scoped>
.admin-inquiry-detail {
  max-width: 700px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.detail-container p {
  margin: 8px 0;
}

.answer-section {
  margin-top: 20px;
}

textarea {
  width: 100%;
  resize: vertical;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 10px;
  padding: 8px 14px;
  background-color: #1976d2;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #115293;
}

.back-button {
  background-color: #666;
  margin-top: 25px;
}

.back-button:hover {
  background-color: #444;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 6px;
}
</style>
