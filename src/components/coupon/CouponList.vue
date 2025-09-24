  <template>
    <div>
      <h2>쿠폰 목록</h2>
      <button @click="goCreate">쿠폰 생성</button>
      <ul>
        <li v-for="coupon in coupons" :key="coupon.couponId">
          {{ coupon.name }} ({{ coupon.status }})
          <button @click="goEdit(coupon.couponId)">수정</button>
        </li>
      </ul>
    </div>
  </template>

  <script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/api/auth';
import axios from '@/api/axios';

const router = useRouter();
const authStore = useAuthStore();

const coupons = ref([]);

const fetchCoupons = async () => {
  try {
    const res = await axios.get('/api/admin/coupons', {
      
    });
    coupons.value = res.data;
  } catch {
    alert('쿠폰 목록을 불러오는데 실패했습니다.');
  }
};

const goCreate = () => router.push('/admin/coupons/create');
const goEdit = (id: number) => router.push(`/admin/coupons/edit/${id}`);

onMounted(fetchCoupons);
</script>
