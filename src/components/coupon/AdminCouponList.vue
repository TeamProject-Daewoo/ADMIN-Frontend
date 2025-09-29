<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4">쿠폰 리스트</h2>

    <!-- 등록 버튼 -->
    <router-link
      to="/admin/coupons/new"
      class="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      쿠폰 등록하기
    </router-link>

    <!-- 상태 필터 드롭다운 -->
    <div class="mb-4">
      <label for="statusFilter" class="mr-2 font-medium">상태 필터:</label>
      <select id="statusFilter" v-model="statusFilter" class="border rounded p-1">
        <option value="all">전체</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
        <option value="expired">만료됨</option>
      </select>
    </div>

    <div v-if="loading">로딩 중...</div>

    <!-- 쿠폰 리스트 -->
    <ul class="mb-32">
      <li
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        class="border-b py-2 flex justify-between"
      >
        <div>
          <div class="font-medium">{{ coupon.name }}</div>
          <div class="text-sm text-gray-600">
            코드: {{ coupon.couponCode }} |
            <span v-if="coupon.discountAmount">{{ coupon.discountAmount }}원 할인</span>
            <span v-if="coupon.discountPercent">{{ coupon.discountPercent }}% 할인</span>
          </div>
          <div class="text-xs text-gray-500">
            {{ coupon.validFrom }} ~ {{ coupon.validTo }}
          </div>
        </div>
        <span
          class="px-2 py-1 text-xs rounded"
          :class="(new Date(coupon.validFrom) <= new Date() && new Date() <= new Date(coupon.validTo)) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'"
        >
          {{ (new Date(coupon.validFrom) <= new Date() && new Date() <= new Date(coupon.validTo)) ? "활성" : "비활성" }}
        </span>
      </li>
    </ul>

   
 <div class="pagination flex justify-center mt-6">
  <button
    @click="prevPage"
    :disabled="currentPage === 0"
    class="rounded px-4 py-2 font-semibold text-white transition-colors"
    :class="currentPage === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
  >
    Prev
  </button>
  <span
    class="px-4 py-2 rounded bg-gray-100 text-gray-800 font-bold select-none"
    style="min-width: 70px; text-align: center;"
  >
    {{ currentPage + 1 }} / {{ totalPages }}
  </span>
  <button
    @click="nextPage"
    :disabled="currentPage === totalPages - 1"
    class="rounded px-4 py-2 font-semibold text-white transition-colors"
    :class="currentPage === totalPages - 1 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
  >
    Next
  </button>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'

const coupons = ref([])
const loading = ref(false)
const currentPage = ref(0)
const pageSize = 10
const statusFilter = ref('all') // 상태 필터: all / active / inactive



// 서버에서 한 번에 모든 쿠폰 가져오기
const fetchCoupons = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/coupons/list', { params: { page: 0, size: 1000 } })
    coupons.value = res.data.content || []
  } catch (err) {
    console.error('쿠폰 불러오기 실패:', err)
  } finally {
    loading.value = false
  }
}

const filteredCoupons = computed(() => {
  const now = new Date()
  if (statusFilter.value === 'all') return coupons.value
  if (statusFilter.value === 'active')
    return coupons.value.filter(c => new Date(c.validFrom) <= now && now <= new Date(c.validTo))
  if (statusFilter.value === 'inactive')
    return coupons.value.filter(c => now < new Date(c.validFrom))
  if (statusFilter.value === 'expired')
    return coupons.value.filter(c => now > new Date(c.validTo))
  return coupons.value
})

// 페이지 단위로 잘라서 보여줄 배열
const totalPages = computed(() => Math.ceil(filteredCoupons.value.length / pageSize))
const pagedCoupons = computed(() => {
  const start = currentPage.value * pageSize
  return filteredCoupons.value.slice(start, start + pageSize)
})

// Prev / Next
const prevPage = () => { if (currentPage.value > 0) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value - 1) currentPage.value++ }

onMounted(() => fetchCoupons(0))
</script>


<style>
/* 전체 컨테이너 */
div.p-4 {
  max-width: 900px;
  margin: 20px auto;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 쿠폰 등록 버튼 */
.router-link {
  display: inline-block;
  padding: 10px 18px;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  transition: 0.3s;
}

.router-link:hover {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

/* 상태 필터 드롭다운 */
select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* 쿠폰 리스트 */
ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 카드형 */
  gap: 20px;
}

/* 쿠폰 아이템 */
li.border-b {
  border: none; /* 카드형으로 바꾸면서 제거 */
  background: #fff;
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

li.border-b:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

/* 쿠폰 정보 */
li div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

li div .font-medium {
  font-size: 16px;
  color: #1f2937;
}

li div .text-sm {
  color: #4b5563;
}

li div .text-xs {
  color: #6b7280;
}

/* 상태 배지 */
li span.px-2 {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 60px;
  transition: 0.3s;
}

li span.px-2.bg-green-100 {
  background: #d1fae5;
  color: #065f46;
}

li span.px-2.bg-gray-200 {
  background: #e5e7eb;
  color: #6b7280;
}

/* 페이징 버튼 */
.fixed {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: #fff;
  padding: 10px 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.fixed button {
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  transition: 0.3s;
}

.fixed button.bg-blue-600 {
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  color: #fff;
}

.fixed button.bg-blue-600:hover {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.fixed button.bg-blue-300 {
  background: #93c5fd;
  color: #fff;
  cursor: not-allowed;
}

.fixed span {
  min-width: 60px;
  text-align: center;
  font-weight: 700;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px 10px;
}

/* 모바일 대응 */
@media (max-width: 640px) {
  ul {
    grid-template-columns: 1fr; /* 1열로 변경 */
  }
  .fixed {
    flex-direction: column;
    gap: 8px;
  }
}

</style>
