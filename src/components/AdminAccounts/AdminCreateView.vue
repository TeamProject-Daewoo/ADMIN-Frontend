<template>
  <div class="admin-create-container">
    <h1>관리자 계정 생성</h1>
    <p class="subtitle">새로운 관리자 계정의 정보를 입력해주세요.</p>
    
    <div class="form-card">
      <form @submit.prevent="handleCreate">
        <div class="input-group">
          <label for="name">관리자 이름</label>
          <input type="text" id="name" v-model="formData.name" placeholder="이름 입력" required />
        </div>
        <div class="input-group">
          <label for="adminId">아이디</label>
          <div class="input-with-button">
            <input type="text" id="adminId" v-model="formData.adminId" placeholder="아이디 입력" :disabled="isAdminIdChecked" required />
            <button type="button" @click="checkAdminId" :disabled="isAdminIdChecked || !formData.adminId" class="check-button">
              {{ isAdminIdChecked ? '확인완료' : '중복확인' }}
            </button>
          </div>
          <p v-if="idMessage" :class="idMessageClass" class="validation-message">{{ idMessage }}</p>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="formData.password" placeholder="비밀번호 입력" required />
        </div>
        <div class="input-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="비밀번호 재입력" required />
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
  const formData = reactive({ name: '', adminId: '', password: '', confirmPassword: '', role: null });
  const selectedRoles = reactive({ cs: false, biz: false });
  
  const isAdminIdChecked = ref(false);
  const idMessage = ref('');
  const idMessageClass = ref('');
  
  watch(() => formData.adminId, () => {
    isAdminIdChecked.value = false;
    idMessage.value = '';
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
    try {
      await api.post('/api/admin/check-id', { adminId: formData.adminId });
      idMessage.value = '사용 가능한 아이디입니다.';
      idMessageClass.value = 'success-text';
      isAdminIdChecked.value = true;
    } catch (error) {
      idMessage.value = '이미 사용 중인 아이디입니다.';
      idMessageClass.value = 'error-text';
    }
  };
  
  const passwordsMatch = computed(() => formData.password && formData.password === formData.confirmPassword);
  
  const isFormValid = computed(() => {
    return isAdminIdChecked.value &&
           passwordsMatch.value &&
           formData.name &&
           formData.role;
  });

  const resetForm = () => {
  formData.name = '';
  formData.adminId = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.role = null;
  selectedRoles.cs = false; // 체크박스 상태도 초기화
  selectedRoles.biz = false;
  isAdminIdChecked.value = false; // 중복확인 상태도 초기화
};
  
  const handleCreate = async () => {
    if (!isFormValid.value) {
      alert('모든 정보를 올바르게 입력해주세요.');
      return;
    }
    try {
      await api.post('/api/admin/create', formData);
      alert('관리자 계정이 생성되었습니다.');
      resetForm();
    } catch (error) {
      alert(error.response?.data || '계정 생성에 실패했습니다.');
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