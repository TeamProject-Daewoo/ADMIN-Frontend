import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin/inquiries',
      name: 'AdminInquitryLis',
      component: () => import('../components/AdminService/AdminInquiryList.vue'),
    },
    {
      path: '/admin/inquiries/:id',
      name: 'AdminInquiryDetail',
      component: () => import('../components/AdminService/AdminInquiryDetail.vue'),
      props: true,
    },
    {
      path: '/admin/notices/create',  // ✅ 공지사항 작성 경로 추가
      name: 'NoticeCreate',
      component: () => import('../components/AdminNotice/AdminNoticeCreate.vue'),
    },
  ],
})

export default router
