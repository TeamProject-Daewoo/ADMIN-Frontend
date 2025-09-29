<script>
import { ref } from "vue";
import AdminCouponForm from "./AdminCouponForm.vue";
import AdminCouponList from "./AdminCouponList.vue";

export default {
  components: { AdminCouponForm, AdminCouponList },
  setup() {
    const couponList = ref(null);

    const refreshList = () => {
      if (couponList.value) {
        couponList.value.fetchCoupons();
      }
    };

    return { couponList, refreshList };
  },
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">쿠폰 관리</h1>
    <AdminCouponForm @created="refreshList" />
    <AdminCouponList ref="couponList" />
  </div>
</template>
