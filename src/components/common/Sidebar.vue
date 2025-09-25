<!-- src/components/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>호텔 관리</h1>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/dashboard" class="nav-item">대시보드</RouterLink>
      <RouterLink to="/admin/approvelist" class="nav-item">사업자 관리</RouterLink>
      <RouterLink to="/admin/inquiries" class="nav-item">문의 목록</RouterLink>
      <RouterLink to="/admin/notices" class="nav-item">공지 사항</RouterLink>
      <RouterLink to="/admin/reviews" class="nav-item">리뷰 관리</RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'

</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid var(--border-color, #e5e7eb);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 0 0 270px;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
}
.sidebar .nav-item {
  display: block;
  writing-mode: horizontal-tb;
  white-space: nowrap;
}
.sidebar-header { padding: 16px 16px 12px; border-bottom: 1px solid var(--border-color, #e5e7eb); }
.sidebar-header h1 { margin: 0 0 8px; font-size: 18px; color: var(--text-primary, #111827); }
.sidebar-nav { display: flex; flex-direction: column; padding: 12px; }
.nav-item {
  padding: 10px 12px; text-decoration: none; color: var(--text-secondary, #374151);
  border-radius: 8px; font-weight: 500; transition: all 0.2s ease;
}
.nav-item:hover { background-color: var(--background-color, #f9fafb); color: var(--primary-color, #16a34a); }
.nav-item.router-link-exact-active {
  background-color: var(--primary-color-light, #e9f7ef);
  color: var(--primary-color, #16a34a);
  font-weight: 600;
}

.hotel-select { display:flex; gap:8px; align-items:center; }
.hotel-select select {
  flex:1; padding:8px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; font-size:13px;
}
.choose-link { font-size:12px; color:#2563eb; text-decoration:none; }
.choose-link:hover { text-decoration:underline; }
</style>
