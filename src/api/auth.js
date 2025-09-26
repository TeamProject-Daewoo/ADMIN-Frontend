import { defineStore } from 'pinia';
import api from '@/api/axios'; // axios 인스턴스 임포트

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    loggedInUser: null, // 사용자 ID (예: 'user123')
    userName: null,     // 사용자 이름 (예: '홍길동')
    role: [],          // ✨ 사용자의 역할 목록을 저장 (예: ['ROLE_SUPER_ADMIN'])
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,

    // ✨ 특정 역할을 보유했는지 확인하는 유연한 getter
    hasRole: (state) => (requiredRole) => {
      return state.role.includes(requiredRole);
    },
  },
  
  actions: {
    // 👇 JWT 파싱 시 roles 정보도 함께 저장하도록 수정
    setToken(token) {
      this.accessToken = token;
      const payload = this.parseJwt(token);
      
      this.loggedInUser = payload?.sub || null;
      this.userName = payload?.name || null;
      
      // 'roles' 클레임(콤마로 구분된 문자열)을 배열로 변환하여 저장
      if (payload?.role) {
        this.role = payload.role.split(',');
      } else {
        this.role = [];
      }
    },

    // 이 액션은 /api/user/me 에서 부가 정보를 가져올 때 사용되므로 그대로 둡니다.
    setUserInfo(userData) {
      if (userData) {
        this.loggedInUser = userData.username || this.loggedInUser;
        this.userName = userData.name || this.userName;
      }
    },

    // 👇 logout 시 roles도 초기화
    logout() {
      this.accessToken = null;
      this.loggedInUser = null;
      this.userName = null;
      this.role = []; // 역할 정보 초기화
    },
    
    // initialize 액션은 setToken을 호출하므로 자동으로 역할 정보를 처리하게 됩니다.
    // 수정할 필요 없습니다.
    async initialize() {
      this.isInitialized = false;
      try {
        const refreshResponse = await api.post('/api/auth/refresh');
        const newAccessToken = refreshResponse.data.accessToken;
        
        this.setToken(newAccessToken); // 수정된 setToken 호출

        const userResponse = await api.get('/api/user/me');
        this.setUserInfo(userResponse.data);
        
        console.log('자동 로그인 및 사용자 정보 동기화 완료');
      } catch (error) {
        console.log('자동 로그인 실패. 유효한 리프레시 토큰이 없습니다.');
        this.logout();
      } finally {
        this.isInitialized = true;
      }
    },

    // JWT 파싱 함수는 그대로 사용합니다.
    parseJwt(token) {
      if (!token) return null;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    },
  },
});