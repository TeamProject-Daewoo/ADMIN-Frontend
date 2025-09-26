<template>
  <div class="admin-page-container">
    <h1>관리자 설정</h1>
    
    <nav class="admin-nav">
      <router-link to="/admin/account/list" class="nav-item">계정 목록</router-link>
      <router-link to="/admin/account/create" class="nav-item">새 계정 생성</router-link>
    </nav>

    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.admin-nav {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.nav-item {
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 2px solid transparent;
}
.nav-item.router-link-exact-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}
</style>