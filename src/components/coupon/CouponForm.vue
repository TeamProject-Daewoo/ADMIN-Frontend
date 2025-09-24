<template>
  <div class="coupon-form">
    <h2>{{ isEdit ? "쿠폰 수정" : "쿠폰 생성" }}</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="couponName">쿠폰명</label>
        <input id="couponName" v-model="form.name" required />
      </div>

      <div>
        <label>할인 타입</label>
        <select v-model="form.discountType">
          <option value="amount">금액 할인</option>
          <option value="percentage">퍼센트 할인</option>
        </select>
      </div>

      <div>
        <label for="discountValue">할인 값</label>
        <input
          id="discountValue"
          type="number"
          min="0"
          v-model.number="form.discountValue"
          required
        />
      </div>

      <div>
        <label for="validStartDate">시작일</label>
        <input id="validStartDate" type="date" v-model="form.validStartDate" />
      </div>

      <div>
        <label for="validEndDate">종료일</label>
        <input id="validEndDate" type="date" v-model="form.validEndDate" />
      </div>

      <div>
        <label>쿠폰 타입</label>
        <select v-model="form.couponType" required>
          <option value="">선택하세요</option>
          <option value="NEW_USER_ONLY">신규 가입자용</option>
          <option value="FIRST_PURCHASE_ONLY">최초 구매자용</option>
          <option value="ACTIVE">모든 사용자</option>
        </select>
      </div>

      <button type="submit">{{ isEdit ? "수정하기" : "생성하기" }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/api/auth';
import axios from '@/api/axios';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isEdit = computed(() => !!route.params.id);

const coupons = ref<Array<any>>([]);

const form = reactive({
  couponName: '',
  discountType: 'percentage', // or 'fixed'
  discountValue: 0,
  validStartDate: '',
  validEndDate: '',
  validPeriodAfterDownload: null as number | null,
  totalIssueLimit: null as number | null,
  perUserLimit: null as number | null,
  couponType: '', // NEW_USER | FIRST_PURCHASE | SEASONAL 등
});

// — 쿠폰 목록 조회
const fetchCoupons = async () => {
  try {
    const res = await axios.get('/api/admin/coupons', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });
    coupons.value = res.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('접근 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
      router.push('/login');
    } else {
      alert('쿠폰 목록을 불러오는데 실패했습니다.');
    }
  }
};

// — 단일 쿠폰 조회 (수정폼 초기화)
const fetchCoupon = async (id: string | number) => {
  try {
    const res = await axios.get(`/api/admin/coupons/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });
    Object.assign(form, res.data);
  } catch {
    alert('쿠폰을 불러오지 못했습니다.');
    router.back();
  }
};

// — 쿠폰 생성 / 수정
const submitForm = async () => {
  // 유효기간 검사
  if (form.validStartDate && form.validEndDate) {
    if (new Date(form.validStartDate) > new Date(form.validEndDate)) {
      alert('시작일은 종료일보다 이전이어야 합니다.');
      return;
    }
  }

  try {
    const url = isEdit.value
      ? `/api/admin/coupons/${route.params.id}`
      : '/api/admin/coupons';
    const method = isEdit.value ? 'put' : 'post';

    const res = await axios({
      url,
      method,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      data: form,
    });

    alert(isEdit.value ? '쿠폰이 수정되었습니다.' : '쿠폰이 생성되었습니다.');
    router.push('/admin/coupons');
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('권한이 없습니다. 관리자 계정으로 로그인해주세요.');
      router.push('/login');
    } else {
      alert('오류가 발생했습니다.');
    }
  }
};

// — 쿠폰 삭제
const deleteCoupon = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await axios.delete(`/api/admin/coupons/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });
    alert('쿠폰이 삭제되었습니다.');
    fetchCoupons();
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('권한이 없습니다.');
      router.push('/login');
    } else {
      alert('삭제에 실패했습니다.');
    }
  }
};

onMounted(() => {
  fetchCoupons();

  if (isEdit.value) {
    fetchCoupon(route.params.id as string);
  }
});
</script>


<style scoped>
.coupon-form {
  max-width: 400px;
  margin: 20px auto;
}
.coupon-form div {
  margin-bottom: 12px;
}
.coupon-form label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}
.coupon-form input,
.coupon-form select {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.coupon-form button {
  padding: 8px 12px;
  background-color: #3b82f6;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.coupon-form button:hover {
  background-color: #2563eb;
}
</style>
