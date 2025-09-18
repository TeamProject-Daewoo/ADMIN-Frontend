// src/api/adminApi.js
import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:8889',  // 관리자 백엔드 주소
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default adminApi;
