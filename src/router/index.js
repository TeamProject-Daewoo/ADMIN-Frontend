import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/api/auth'
import { watch } from 'vue'

import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import MainLandingPage from '@/views/MainLandingPage.vue'
import ApproveList from '@/views/BusinessApproval.vue'
import ReviewList from '@/components/review/ReviewList.vue'
import errorPage from '@/components/common/errorPage.vue';
import AdminCreateView from '@/components/AdminAccounts/AdminCreateView.vue';
import AdminListView from '@/components/AdminAccounts/AdminListView.vue';
import AdminAccountView from '@/views/AdminAccount.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'Home',         component: MainLandingPage, meta: { layout: 'EmptyLayout', requiresGuest: true } },
    { path: '/login',       name: 'login',        component: LoginView,       meta: { layout: 'EmptyLayout', requiresGuest: true } },
    { path: '/dashboard',   name: 'dashboard',    component: DashboardView,   meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER'] } },
    { path: '/admin/inquiries', name: 'AdminInquitryLis', component: () => import('../components/AdminService/AdminInquiryList.vue'), meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] }},
    { path: '/admin/inquiries/:id', name: 'AdminInquiryDetail', component: () => import('../components/AdminService/AdminInquiryDetail.vue'), props: true, meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] },},
    { path: '/admin/notices/create', name: 'NoticeCreate', component: () => import('../components/AdminNotice/AdminNoticeCreate.vue'), meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] }},
    { path: "/admin/notices", name: "NoticeList", component: () => import('@/components/AdminNotice/notice.vue'), meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] } },
    { path: '/admin/notices/:id', name: 'NoticeDetail', component: () => import('@/components/AdminNotice/NoticeDetail.vue'), props: true, meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] } },
    { path: '/admin/approvelist', name: 'ApproveList', component: ApproveList , meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER','ROLE_ADMIN_BIZ'] } },
    { path: '/admin/reviews', name: 'Review', component: ReviewList, meta: { requiresAuth: true, requiredRoles: ['ROLE_ADMIN_SUPER', 'ROLE_ADMIN_CS'] }},
    { path: '/errorPage', name: 'errorPage', component: errorPage},

    {
      path: '/admin/account',
      component: AdminAccountView, // 👈 2. 부모 레이아웃
      meta: { requiresAuth: true, requiresRole: ['ROLE_ADMIN_SUPER'] },
      children: [
        {
          path: 'list',
          name: 'adminList',
          component: AdminListView,
        },
        {
          path: 'create',
          name: 'adminCreateAccount',
          component: AdminCreateView,
        },
        // 👇 /admin 접속 시 자동으로 /admin/list로 이동
        { path: '', redirect: { name: 'adminList' } } 
      ]
    },
  ],
})

// 네비게이션 가드 (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { requiredRoles } = to.meta;

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
  const isLoggedIn = authStore.isLoggedIn; // getter를 사용하는 것이 더 일관성 있습니다.

  // 1️⃣ Case: 로그아웃 상태여야 하는 페이지 (로그인, 회원가입 등)
  if (to.meta.requiresGuest && isLoggedIn) {
    // 이미 로그인한 사용자는 대시보드로 보냅니다.
    return next('/dashboard');
  }

  // 2️⃣ Case: 특정 역할(Role)이 필요한 페이지
  const requiredRoles = to.meta.requiredRoles;
  if (requiredRoles && requiredRoles.length > 0) {
    if (!isLoggedIn) {
      // 역할이 필요한 페이지에 비로그인 상태로 접근 시
      alert('로그인이 필요한 서비스입니다.');
      return next('/');
    }
    
    // 로그인 상태라면, 역할이 맞는지 검사
    const userRoles = authStore.role || [];
    const hasPermission = userRoles.some(role => requiredRoles.includes(role));

    if (hasPermission) {
      // 권한이 있으면 통과
      return next();
    } else {
      // 권한이 없으면 에러 페이지로
      return next({ name: 'errorPage' }); // routes에 정의된 name 사용
    }
  }

  // 3️⃣ Case: 역할은 필요 없지만 '로그인' 자체는 필수인 페이지
  if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요한 서비스입니다.');
    return next('/');
  }

  // 4️⃣ Case: 그 외 모든 경우 (권한이 필요 없는 공개 페이지)
  next();
}


export default router
