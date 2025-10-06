<template>
  <div class="notice-create">
    <h2>공지사항 작성</h2>
    <form @submit.prevent="submitNotice">
      <label for="category">공지 유형</label>
      <select id="category" v-model="form.category" required>
        <option disabled value="">공지 유형을 선택하세요</option>
        <option value="notice">공지</option>
        <option value="patch">패치</option>
        <option value="event">이벤트</option>
      </select>

      <label for="title">제목</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        placeholder="제목을 입력하세요"
        required
      />

      <label for="content">내용</label>
      <textarea
        id="content"
        v-model="form.content"
        placeholder="내용을 작성하세요"
        rows="8"
        required
      ></textarea>

      <button type="submit" :disabled="loading">
        {{ loading ? "저장 중..." : "공지사항 등록" }}
      </button>
    </form>

    <p v-if="message" :class="{ error: isError, success: !isError }">{{ message }}</p>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "@/api/axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
  category: "",
  title: "",
  content: "",
});

const loading = ref(false);
const message = ref("");
const isError = ref(false);

const submitNotice = async () => {
  if (!form.category || !form.title || !form.content) {
    message.value = "모든 필드를 입력해주세요.";
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await axios.post(`${import.meta.env.VITE_BACK_ADMIN_URL}/api/admin/notices`, {
      category: form.category,
      title: form.title,
      content: form.content,
    });
    alert("공지사항이 성공적으로 등록되었습니다.");
    router.push('/admin/notices');
    
    isError.value = false;

    // 초기화
    form.category = "";
    form.title = "";
    form.content = "";
  } catch (e) {
    message.value = "공지사항 등록 중 오류가 발생했습니다.";
    isError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.notice-create {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9f9f9;
  font-family: "Noto Sans KR", sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

label {
  display: block;
  margin: 15px 0 6px 0;
  font-weight: 600;
  color: #34495e;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  font-size: 1.05rem;
  box-sizing: border-box;
  font-family: "Noto Sans KR", sans-serif;
  transition: border-color 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #42b983;
  outline: none;
}

button {
  margin-top: 30px;
  width: 100%;
  padding: 14px 0;
  background-color: #42b983;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #7ac29a;
  cursor: not-allowed;
}

p {
  margin-top: 20px;
  text-align: center;
  font-weight: 600;
}

p.error {
  color: #e74c3c;
}

p.success {
  color: #27ae60;
}
</style>
