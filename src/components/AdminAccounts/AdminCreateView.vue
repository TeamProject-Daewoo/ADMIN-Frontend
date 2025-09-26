<template>
  <div class="admin-create-container">
    <h1>관리자 계정 생성</h1>
    <p class="subtitle">새로운 관리자 계정의 정보를 입력해주세요.</p>
    
    <div class="form-card">
      <form @submit.prevent="handleCreate">
        <div class="input-group">
          <label for="name">관리자 이름</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            placeholder="이름 입력 (7자 이하, 특수문자/공백 제외)" 
            required 
            maxlength="7" 
            @input="handleInput"
          />
          <p v-if="nameError" class="validation-message error-text">{{ nameError }}</p>
        </div>
        <div class="input-group">
          <label for="adminId">아이디</label>
          <div class="input-with-button">
            <input 
              type="text" 
              id="adminId" 
              v-model="formData.username" 
              placeholder="아이디 입력 (7~20자, 특수문자/공백 제외)" 
              :disabled="isAdminIdChecked" 
              required 
              maxlength="19" 
              @input="handleInput"
            />
            <button type="button" @click="checkAdminId" :disabled="isAdminIdChecked || !formData.username || !!usernameError" class="check-button">
              {{ isAdminIdChecked ? '확인완료' : '중복확인' }}
            </button>
          </div>
          <p v-if="usernameError" class="validation-message error-text">{{ usernameError }}</p>
          <p v-if="idMessage" :class="idMessageClass" class="validation-message">{{ idMessage }}</p>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="formData.password" placeholder="비밀번호 입력" required @input="preventSpaces"/>
        </div>
        <div class="input-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="비밀번호 재입력" required @input="preventSpaces"/>
          <p v-if="formData.confirmPassword" :class="passwordsMatch ? 'success-text' : 'error-text'" class="validation-message">
            {{ passwordsMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
          </p>
        </div>
        <div class="input-group">
          <label>권한 설정</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="checkbox" id="admin-cs" v-model="selectedRoles.cs" />
              <label for="admin-cs">CS 관리자 (ADMIN_CS)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="admin-biz" v-model="selectedRoles.biz" />
              <label for="admin-biz">사업자 관리자 (ADMIN_BIZ)</label>
            </div>
          </div>
        </div>
        <button type="submit" class="submit-button" :disabled="!isFormValid">계정 생성</button>
      </form>
    </div>
  </div>
</template>
 
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
 
const router = useRouter();
// ✨ 변경된 부분: adminId를 username으로 수정하여 템플릿과 일치시킴
const formData = reactive({ name: '', username: '', password: '', confirmPassword: '', role: null });
const selectedRoles = reactive({ cs: false, biz: false });
 
const isAdminIdChecked = ref(false);
const idMessage = ref('');
const idMessageClass = ref('');

// ✨ 추가된 부분: 이름과 아이디 유효성 검사를 위한 상태
const nameError = ref('');
const usernameError = ref('');
const isNameValid = ref(false);
const isUsernameValid = ref(false);

// ✨ 추가된 부분: 입력 시 공백 및 허용되지 않는 특수문자 제거
const handleInput = (event) => {
  // 영어, 숫자, 한글만 허용 (공백 및 대부분의 특수문자 제거)
  event.target.value = event.target.value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
};

// ✨ 추가된 부분: 비밀번호 필드의 공백 입력을 방지하는 함수
const preventSpaces = (event) => {
  event.target.value = event.target.value.replace(/\s/g, '');
};

// ✨ 추가된 부분: 이름 유효성 검사 watch
watch(() => formData.name, (newName) => {
  if (newName && newName.length > 0) {
    isNameValid.value = true;
    nameError.value = ''; // 이름이 있으면 에러 메시지 없음
  } else {
    isNameValid.value = false;
  }
  // maxlength 속성이 7자로 제한하지만, 추가적인 스크립트 방어
  if (newName && newName.length > 7) {
    formData.name = newName.substring(0, 7);
  }
});

// ✨ 변경된 부분: 아이디 유효성 검사 watch 로직 강화
watch(() => formData.username, (newUsername) => {
  isAdminIdChecked.value = false;
  idMessage.value = '';

  if (!newUsername) {
    usernameError.value = '';
    isUsernameValid.value = false;
  } else if (newUsername.length < 7 || newUsername.length > 20) {
    usernameError.value = '아이디는 7자 이상, 20자 이하로 입력해주세요.';
    isUsernameValid.value = false;
  } else {
    usernameError.value = '';
    isUsernameValid.value = true;
  }
});
 
// 권한 체크박스 중 하나만 선택되도록 처리
watch(() => selectedRoles.cs, (isCs) => {
  if (isCs) {
    selectedRoles.biz = false;
    formData.role = 'ADMIN_CS';
  } else if (!selectedRoles.biz) {
    formData.role = null;
  }
});
watch(() => selectedRoles.biz, (isBiz) => {
  if (isBiz) {
    selectedRoles.cs = false;
    formData.role = 'ADMIN_BIZ';
  } else if (!selectedRoles.cs) {
    formData.role = null;
  }
});
 
const checkAdminId = async () => {
  // ✨ 추가된 부분: 아이디 형식/길이가 유효하지 않으면 중복확인 실행 안 함
  if (!isUsernameValid.value) {
    alert('아이디 형식을 확인해주세요.');
    return;
  }
  try {
    await api.post('/api/admin/check-id', { username: formData.username });
    idMessage.value = '사용 가능한 아이디입니다.';
    idMessageClass.value = 'success-text';
    isAdminIdChecked.value = true;
  } catch (error) {
    idMessage.value = '이미 사용 중인 아이디입니다.';
    idMessageClass.value = 'error-text';
  }
};
 
const passwordsMatch = computed(() => formData.password && formData.password === formData.confirmPassword);
 
// ✨ 변경된 부분: isFormValid에 새로운 유효성 검사 조건 추가
const isFormValid = computed(() => {
  return isNameValid.value &&
         isUsernameValid.value &&
         isAdminIdChecked.value &&
         passwordsMatch.value &&
         !!formData.role; // role이 null이 아닌지 확인
});

const resetForm = () => {
  formData.name = '';
  // ✨ 변경된 부분: adminId -> username
  formData.username = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.role = null;
  selectedRoles.cs = false;
  selectedRoles.biz = false;
  isAdminIdChecked.value = false;
};
 
const handleCreate = async () => {
  if (!isFormValid.value) {
    alert('모든 정보를 올바르게 입력해주세요.');
    return;
  }
  try {
    // ✨ 변경된 부분: 서버로 보낼 데이터에 username 사용
    const payload = { ...formData };
    await api.post('/api/admin/create', payload);
    alert('관리자 계정이 생성되었습니다.');
    resetForm();
  } catch (error) {
    alert(error.response?.data?.message || error.response?.data || '계정 생성에 실패했습니다.');
  }
};
</script>
  <style scoped>
  .admin-create-container {
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin-bottom: 2rem;
  }
  
  .form-card {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  }
  
  .input-group {
    margin-bottom: 1.5rem;
  }
  
  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    color: #374151;
  }
  
  .input-group input[type="text"],
  .input-group input[type="password"] {
    width: 100%;
  box-sizing: border-box;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  }
  
  .input-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
  
  .input-with-button {  
    display: flex;
    gap: 0.75rem;
  }
  
  .input-with-button input {
    flex-grow: 1;
  }
  
  .check-button {
    padding: 0.75rem 1rem;
    background-color: #4b5563;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .check-button:hover:not(:disabled) {
    background-color: #374151;
  }
  
  .check-button:disabled {
    background-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  .validation-message {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .success-text {
    color: #16a34a;
  }
  
  .error-text {
    color: #dc2626;
  }
  
  .checkbox-group {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.75rem;
  }
  
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .checkbox-item label {
    margin-bottom: 0;
    font-weight: 400;
    cursor: pointer;
  }
  .checkbox-item input {
    cursor: pointer;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.875rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  .submit-button:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
  </style>