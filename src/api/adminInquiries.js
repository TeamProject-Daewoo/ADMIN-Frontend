// src/api/adminInquiries.js
import adminApi from './adminApi';

export const fetchInquiries = (page = 0, size = 10, status = '') => {
  const url = status ? `/admin/inquiries?page=${page}&size=${size}&status=${status}` : `/admin/inquiries?page=${page}&size=${size}`;
  return adminApi.get(url);
};

export const fetchInquiryDetail = (id) => {
  return adminApi.get(`/admin/inquiries/${id}`);
};

export const postAnswer = (id, answerContent, adminUsername) => {
  return adminApi.post(`/admin/inquiries/${id}/answer`, {
    answerContent,
    adminUsername,
  });
};
