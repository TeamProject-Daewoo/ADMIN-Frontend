<template>
  <div class="admin-landing-container">
    <div class="content-box">
        <img src="https://i.ibb.co/ccn2vLPb/hotel-logo.png" alt="Hotel Hub Logo" class="logo-image">

      <h1 class="main-title">
        <strong>HotelHub 파트너센터 관리자</strong>
      </h1>
      <p class="sub-title">
        관리자 및 제휴점 파트너를 위한 페이지입니다.<br>
        로그인 후 모든 기능을 이용하실 수 있습니다.
      </p>
      
      <div class="button-container">
        <button class="btn btn-secondary" @click="goToHomepage">
          메인 홈페이지로 이동
        </button>
        <button class="btn btn-primary" @click="goToLogin">
          로그인하기
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToLogin() {
  router.push('/login');
}

// 홈페이지로 이동하는 함수 추가
function goToHomepage() {
  window.location.href = `${import.meta.env.VITE_HOMPAGE_MAIN}`;
}
</script>

<style scoped>
/* 전체 페이지 컨테이너 */
.admin-landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  text-align: center;
  font-family: 'Pretendard', sans-serif;
}

/* 콘텐츠를 담는 중앙 박스 */
.content-box {
  max-width: 800px;
  padding: 50px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* 로고 이미지 스타일 */
.logo-image {
  max-width: 180px;
  height: auto;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

/* 메인 타이틀 */
.main-title {
  font-size: 42px;
  font-weight: 300;
  color: #ecf0f1;
  line-height: 1.4;
  margin-bottom: 15px;
}

.main-title strong {
  font-weight: 700;
  color: #58D68D;
}

/* 서브 타이틀 */
.sub-title {
  font-size: 16px;
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 40px;
}

/* 버튼들을 감싸는 컨테이너 */
.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 기본 버튼 스타일 */
.btn {
  padding: 15px 35px;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 220px;
}

/* 주요 버튼 (로그인하기) */
.btn-primary {
  background-color: #58D68D;
  color: #2c3e50;
}

.btn-primary:hover {
  background-color: #48b472;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 214, 141, 0.2);
}

/* 👇 [추가] 보조 버튼 (홈페이지로 이동) */
.btn-secondary {
  background-color: transparent;
  color: #ecf0f1;
  border-color: #ecf0f1;
}

.btn-secondary:hover {
  background-color: #ecf0f1;
  color: #2c3e50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
</style>