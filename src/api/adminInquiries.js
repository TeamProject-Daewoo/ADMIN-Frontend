// src/api/adminInquiries.js
import api from '@/api/axios';

export const fetchInquiries = (page = 0, size = 10, status = '') => {
  const url = status ? `/admin/inquiries?page=${page}&size=${size}&status=${status}` : `/admin/inquiries?page=${page}&size=${size}`;
  return api.get(url);
};

export const fetchInquiryDetail = (id) => {
  return api.get(`/admin/inquiries/${id}`);
};

export const postAnswer = (id, answerContent, adminUsername) => {
  return api.post(`/admin/inquiries/${id}/answer`, {
    answerContent,
    adminUsername,
  });
};
