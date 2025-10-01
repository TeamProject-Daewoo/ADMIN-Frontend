<template>
    <div class="dashboard-container">
      <div class="content-box">
        <span class="icon">👩‍💻</span>
        <h1>BIZ 관리자 대시보드</h1>
        <p>BIZ 관리자 입니다.</p>
        <p class="welcome-text">환영합니다. 이 페이지에서 고객 문의 및 관련 업무를 처리할 수 있습니다.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  // 이 페이지는 화면 표시가 주 목적이므로, 스크립트 로직은 비워둡니다.
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: calc(100vh - 80px - 64px); /* (전체 높이 - 헤더 - 위아래 패딩) 대략적인 값 */
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 12px;
  }
  
  .content-box {
    max-width: 600px;
  }
  
  .icon {
    font-size: 4rem;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #343a40;
    margin-top: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #495057;
  }
  
  .welcome-text {
    font-size: 1rem;
    color: #6c757d;
    margin-top: 0.5rem;
  }
  </style>