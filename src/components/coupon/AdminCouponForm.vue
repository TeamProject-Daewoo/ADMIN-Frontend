<template>
  <div class="coupon-form">
    <h2>쿠폰 등록</h2>
    <form @submit.prevent="submitForm">
      <!-- 쿠폰 이름 -->
      <div>
        <label>쿠폰 이름</label>
        <input v-model="coupon.name" type="text" required />
      </div>

      <!-- 쿠폰 코드 -->
      <div>
        <label>쿠폰 코드</label>
        <input v-model="coupon.couponCode" type="text" required />
      </div>

      <!-- 할인 금액 -->
      <div>
        <label>할인 금액(0일경우 null)</label>
        <input v-model.number="coupon.discountAmount" type="number" min="0" />
      </div>

      <!-- 할인율 -->
      <div>
        <label>할인율 (%)(0일경우 null)</label>
        <input v-model.number="coupon.discountPercent" type="number" min="0" max="100" />
      </div>

      <!-- 유효기간 설정 -->
      <div>
  <label>시작일</label>
  <input
    v-model="coupon.validFrom"
    type="date"
    required
    :max="coupon.validTo || ''"
  />
</div>
<div>
  <label>만료일</label>
  <input
    v-model="coupon.validTo"
    type="date"
    required
    :min="coupon.validFrom || ''"
  />
</div>


      <!-- 다운로드 후 유효기간 -->
      <div>
        <label>다운로드 후 유효기간(일)</label>
        <input v-model.number="coupon.validPeriodAfterDownload" type="number" min="0" />
      </div>

      <!-- 최대 발급 수 -->
      <div>
        <label>최대 발급 수</label>
        <input v-model.number="coupon.maxIssuance" type="number" min="0" />
      </div>


      <!-- 중복 허용 여부 -->
      <div>
        <label>중복 발급 허용(체크시 사용자가 같은코드 여러번 사용가능)</label>
        <input v-model="coupon.allowDuplicate" type="checkbox" />
      </div>

      <!-- 발급 방식 -->
      <div>
        <label>발급 방식</label>
        <select v-model="coupon.issuanceType" required>
          <option value="AUTO">신규 회원 가입</option>
          <option value="MANUAL">관리자 수동 발급</option>
          <option value="EVENT">이벤트 발급</option>
        </select>
      </div>

      <button type="submit">쿠폰 등록</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const coupon = reactive({
  name: '',
  couponCode: '',
  discountAmount: 0,
  discountPercent: 0,
  validFrom: '',
  validTo: '',
  validPeriodAfterDownload: 0,
  maxIssuance: 0,
  isActive: true,
  allowDuplicate: false,
  issuanceType: 'AUTO',
})

const submitForm = async () => {
  try {
    const payload = {
      ...coupon,
      validFrom: coupon.validFrom ? `${coupon.validFrom}T00:00:00` : null,
      validTo: coupon.validTo ? `${coupon.validTo}T23:59:59` : null,
    }

    await api.post('/api/coupons', payload)
    alert('쿠폰이 등록되었습니다!')
    router.push('/admin/coupons') // ✅ 등록 후 리스트 페이지로 이동
  } catch (error) {
    console.error('쿠폰 등록 실패:', error.response?.data || error.message)
    alert('쿠폰 등록 실패')
  }
}
</script>


<style scoped>
/* 전체 컨테이너 */
.coupon-form {
  max-width: 550px;
  margin: 30px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 헤더 */
.coupon-form h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 16px;
}

/* 라벨 */
.coupon-form label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #374151;
}

/* 일반 입력 / 숫자 / 날짜 / select */
.coupon-form input[type="text"],
.coupon-form input[type="number"],
.coupon-form input[type="date"],
.coupon-form select {
  width: 100%;
  height: 44px;
  padding: 10px 14px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-sizing: border-box;
  transition: 0.2s;
}

.coupon-form input:focus,
.coupon-form select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
}

/* 컨테이너 안 div */
.coupon-form div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 시작일/만료일 2열 배치 */
.date-group {
  display: flex;
  gap: 12px;
}

.date-group > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-form input[type="date"] {
  height: 50px;          /* 높이를 조금 더 크게 */
  font-size: 16px;       /* 글씨 키움 */
  padding: 12px 14px;    /* 위아래 여유 추가 */
  border-radius: 10px;   /* 모서리 조금 더 둥글게 */
}


/* 버튼 */
.coupon-form button {
  margin-top: 16px;
  padding: 14px 0;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  cursor: pointer;
  transition: 0.3s;
}

.coupon-form button:hover {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

/* 모바일 대응 */
@media (max-width: 640px) {
  .date-group {
    flex-direction: column;
  }
}
</style>
