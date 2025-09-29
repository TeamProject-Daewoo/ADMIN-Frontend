import api from "./axios";

// 유효한 쿠폰 목록 조회
export const getCoupons = async (page = 0, size = 10) => {
  const res = await api.get("/coupons/valid", { params: { page, size } });
  return res.data;
};

// 쿠폰 등록
export const createCoupon = async (payload) => {
  const res = await api.post("/coupons", payload);
  return res.data;
};
