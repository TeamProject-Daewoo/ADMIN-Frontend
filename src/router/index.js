import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/api/auth'
import { watch } from 'vue'

import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import MainLandingPage from '@/views/MainLandingPage.vue'
import ApproveList from '@/views/BusinessApproval.vue'
import errorPage from '@/components/common/errorPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'Home',         component: MainLandingPage, meta: { layout: 'EmptyLayout', requiresGuest: true } },
    { path: '/login',       name: 'login',        component: LoginView,       meta: { layout: 'EmptyLayout', requiresGuest: true } },
    { path: '/dashboard',   name: 'dashboard',    component: DashboardView,   meta: { requiresAuth: true } },
    { path: '/admin/inquiries', name: 'AdminInquitryLis', component: () => import('../components/AdminService/AdminInquiryList.vue'), meta: { requiresAuth: true }},
    { path: '/admin/inquiries/:id', name: 'AdminInquiryDetail', component: () => import('../components/AdminService/AdminInquiryDetail.vue'), props: true, meta: { requiresAuth: true },},
    { path: '/admin/notices/create', name: 'NoticeCreate', component: () => import('../components/AdminNotice/AdminNoticeCreate.vue'), meta: { requiresAuth: true }},
    { path: "/admin/notices", name: "NoticeList", component: () => import('@/components/AdminNotice/notice.vue'), meta: { requiresAuth: true } },
    { path: '/admin/notices/:id', name: 'NoticeDetail', component: () => import('@/components/AdminNotice/NoticeDetail.vue'), props: true, meta: { requiresAuth: true } },
    { path: '/admin/approvelist', name: 'ApproveList', component: ApproveList , meta: { requiresAuth: true } },
    {path: '/errorPage', name: 'errorPage', component: errorPage},
  ],
})

// 네비게이션 가드 (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 앱 초기화(자동 로그인)가 끝날 때까지 기다림
  if (authStore.isInitialized) {
    handleNavigation(to, from, next)
  } else {
    const unwatch = watch(() => authStore.isInitialized, (isInitialized) => {
      if (isInitialized) {
        handleNavigation(to, from, next)
        unwatch()
      }
    })
  }
})

function handleNavigation(to, from, next) {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.accessToken

  // 이동하려는 페이지가 로그인이 필요한데, 로그인하지 않은 경우
  if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요한 서비스입니다.')
    next('/') // 👈 요청하신 대로 메인 페이지('/')로 이동
  }
  // 이동하려는 페이지가 로그아웃 상태여야 하는데, 로그인한 경우
  else if (to.meta.requiresGuest && isLoggedIn) {
    // 이미 로그인했다면, 대시보드 페이지로 보냅니다.
    next('/dashboard') 
  } 
  // 그 외의 경우는 정상적으로 통과
  else {
    next()
  }
}


export default router
