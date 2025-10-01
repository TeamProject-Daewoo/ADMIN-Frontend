<template>
  <div class="coupon-admin-container">
    <div class="controls-header">
      <h2 class="title">쿠폰 관리</h2>
      <div class="actions">
        <div class="filter-wrapper">
          <select id="statusFilter" v-model="statusFilter">
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="expired">만료됨</option>
          </select>
        </div>
        <router-link to="/admin/coupons/new" class="add-coupon-btn">
          쿠폰 등록하기
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading-spinner"></div>
    
    <div v-else-if="pagedCoupons.length > 0" class="coupon-list-wrapper">
      <ul class="coupon-list">
        <li
          v-for="coupon in pagedCoupons"
          :key="coupon.id"
          class="coupon-card"
        >
          <div class="coupon-info">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-details">
              코드: {{ coupon.couponCode }} |
              <span v-if="coupon.discountAmount">{{ coupon.discountAmount.toLocaleString() }}원 할인</span>
              <span v-if="coupon.discountPercent">{{ coupon.discountPercent }}% 할인</span>
            </div>
            <div class="coupon-validity">
              {{ formatDate(coupon.validFrom) }} ~ {{ formatDate(coupon.validTo) }}
            </div>
          </div>
          <span :class="['status-badge', getCouponStatus(coupon).className]">
            {{ getCouponStatus(coupon).text }}
          </span>
        </li>
      </ul>
      
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 0">이전</button>
        <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1">다음</button>
      </div>
    </div>
    
    <div v-else class="no-data-message">
      표시할 쿠폰이 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api/axios';

const coupons = ref([]);
const loading = ref(false);
const currentPage = ref(0);
const pageSize = 10;
const statusFilter = ref('all');

const fetchCoupons = async () => {
  loading.value = true;
  try {
    // API에서 모든 데이터를 가져옵니다 (클라이언트 측 필터링 및 페이지네이션).
    const res = await api.get('/api/coupons/list', { params: { page: 0, size: 1000 } });
    coupons.value = res.data.content || [];
  } catch (err) {
    console.error('쿠폰 불러오기 실패:', err);
  } finally {
    loading.value = false;
  }
};

// 쿠폰의 상태를 계산하는 함수
const getCouponStatus = (coupon) => {
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validTo = new Date(coupon.validTo);

  if (now > validTo) {
    return { text: '만료됨', className: 'status-expired' };
  } else if (now >= validFrom && now <= validTo) {
    return { text: '활성', className: 'status-active' };
  } else {
    return { text: '비활성', className: 'status-inactive' };
  }
};

// 선택된 필터에 따라 쿠폰 목록을 반환
const filteredCoupons = computed(() => {
  if (statusFilter.value === 'all') {
    return coupons.value;
  }
  return coupons.value.filter(c => {
    const status = getCouponStatus(c).className.replace('status-', ''); // 'active', 'expired', 'inactive'
    return status === statusFilter.value;
  });
});

// 필터가 변경되면 첫 페이지로 리셋
watch(statusFilter, () => {
  currentPage.value = 0;
});

// 페이지네이션을 위한 총 페이지 수
const totalPages = computed(() => Math.ceil(filteredCoupons.value.length / pageSize));

// 현재 페이지에 보여줄 쿠폰 목록
const pagedCoupons = computed(() => {
  const start = currentPage.value * pageSize;
  return filteredCoupons.value.slice(start, start + pageSize);
});

const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // 'YYYY-MM-DD' 형식으로 반환
  return dateStr.split('T')[0];
};

onMounted(() => fetchCoupons());
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

.coupon-admin-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f8f9fa;
  border-radius: 16px;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-wrapper {
  position: relative;
}

#statusFilter {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-size: 1rem;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236c757d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

#statusFilter:focus {
  outline: none;
  border-color: #007bff;
}

.add-coupon-btn {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #fff;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.add-coupon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}

.coupon-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.coupon-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: transform 0.2s, box-shadow 0.2s;
}

.coupon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coupon-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
}

.coupon-details {
  color: #495057;
  font-size: 0.9rem;
}

.coupon-validity {
  color: #868e96;
  font-size: 0.8rem;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.status-active { background-color: #d1fae5; color: #065f46; }
.status-inactive { background-color: #e5e7eb; color: #4b5563; }
.status-expired { background-color: #fee2e2; color: #991b1b; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-weight: 500;
}
.pagination button:hover:not(:disabled) { background-color: #007bff; color: white; border-color: #007bff; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination span { font-weight: 500; color: #495057; }

.loading-spinner {
  margin: 4rem auto;
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data-message {
  text-align: center;
  padding: 4rem;
  color: #868e96;
  background-color: #fff;
  border-radius: 12px;
}
</style>