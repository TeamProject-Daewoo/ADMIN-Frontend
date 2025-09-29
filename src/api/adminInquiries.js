// src/api/adminInquiries.js
import api from '@/api/axios';

const ADMIN_BASE_URL = '/api/admin'
export const fetchInquiries = (page = 0, size = 10, status = '') => {
  const url = status ? `${ADMIN_BASE_URL}/inquiries?page=${page}&size=${size}&status=${status}` : `${ADMIN_BASE_URL}/inquiries?page=${page}&size=${size}`;
  return api.get(url);
};

export const fetchInquiryDetail = (id) => {
  return api.get(`${ADMIN_BASE_URL}/inquiries/${id}`);
};

export const postAnswer = (id, answerContent, adminUsername) => {
  return api.post(`${ADMIN_BASE_URL}/inquiries/${id}/answer`, {
    answerContent,
    adminUsername,
  });
};
