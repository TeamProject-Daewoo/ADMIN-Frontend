<template>
  <div class="admin-container">
    <h1>리뷰 관리</h1>
    <header class="admin-header">
     
     <div v-if="currentViewMode === 'reported'">
        <span class="btn btn-reject" @click="rejectAll">선택한 항목 모두 거절</span>
      </div>
      <div v-if="currentViewMode === 'deleted'">
        <span class="btn btn-cancel" @click="deleteAll">선택한 항목 삭제 취소</span>
      </div>  
      <div v-else>
        <span class="btn btn-delete" @click="deleteAll">선택한 항목 모두 삭제</span>
      </div>
      
    </header>
    <div class="admin-filter">
      <div class="filter-tab">
        <button 
            @click="setViewMode('reported')" 
            :class="{'active': currentViewMode === 'reported'}" 
          >
            신고된 리뷰
          </button>
          <button 
            @click="setViewMode('all')" 
            :class="{'active': currentViewMode === 'all'}" 
          >
            모든 리뷰
          </button>
          <button 
            @click="setViewMode('deleted')" 
            :class="{'active': currentViewMode === 'deleted'}" 
          >
            삭제된 리뷰
          </button>
      </div>
      <div>
          <input class="review-input" type="text" @input="handleInput" :value="searchTerm" placeholder="리뷰 내용을 입력하세요">
          <span class="review-count">총 {{ reviewList.length }}개의 
            <span v-if="deletedList">삭제된 항목</span>
            <span v-else>미삭제 항목</span>
          </span>
        </div>
      </div>
    <div class="table-wrapper">
      <table class="review-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th>호텔 정보</th>
            <th>작성자</th>
            <th>이메일</th>
            <th>평점</th>
            <th class="text-cell">리뷰 내용</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="reviewList.length === 0">
            <td :colspan="8" class="no-data">표시할 리뷰가 없습니다.</td>
          </tr>
          <tr v-for="review in reviewList" :key="review.reviewId">
            <td>
              <input type="checkbox" :value="review.reviewId" v-model="selectedReviews" />
            </td>
            <td>
              <div class="hotel-info">
                <strong>{{ review.hotelName }}</strong>
                <span class="hotel-id">(ID: {{ review.hotelId }})</span>
              </div>
            </td>
            <td>{{ review.nickName }}</td>
            <td>{{ review.email }}</td>
            <td class="rating-cell">⭐ {{ review.rating }}</td>
            <td class="text-cell">
              <span :title="review.reviewText">{{ review.reviewText }}</span>
            </td>
            <td>{{ formatDate(review.reviewDate) }}</td>
            <td class="actions-cell">
              <button v-if="currentViewMode === 'reported'" class="btn btn-reject" @click="reject(review.reviewId)">거절</button>
              <button v-if="currentViewMode === 'deleted'" class="btn btn-cancel" @click="deleteReview(review.reviewId)">삭제 취소</button>
              <button v-else class="btn btn-delete" @click="deleteReview(review.reviewId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import axios from "@/api/axios";
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from 'lodash';

const deletedList = ref(false);
const reviewList = ref([]);
const searchTerm = ref('');

const currentViewMode = ref('reported');
watch(currentViewMode, () => {
    fetchReviews();
});

function setViewMode(mode) {
    currentViewMode.value = mode;
    deletedList.value = (currentViewMode.value === 'all') ? false : true;
}

onMounted(() => {
    fetchReviews();
})

const isAllSelected = computed(() => {
    if (reviewList.value.length === 0) {
        return false;
    }
    return selectedReviews.value.length === reviewList.value.length;
});

const toggleDeletedList = (toggle) => {
  deletedList.value = toggle;
  selectedReviews.value = [];
  fetchReviews()
};

function handleInput(event) {
    searchTerm.value = event.target.value;
    debouncedSearch();
}
const debouncedSearch = debounce(() => {
    fetchReviews();
}, 100);

const fetchReviews = async () => {
  let result = '';
    if(currentViewMode.value === 'reported') {
      result = await axios.get(`/api/reviews/viewReportedAll`, {
      params: {
        searchTerm: searchTerm.value
      }
    });
    }
    else {
      result = await axios.get(`/api/reviews/viewAll`, {
        params: {
          deletedShow: deletedList.value,
          searchTerm: searchTerm.value
        }
      });
    }

    reviewList.value = result.data;
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const deleteReview = async (id) => {
  if (confirm(`정말로 ID: ${id} ${(currentViewMode.value === 'deleted') ?  "리뷰 삭제를 취소 " : "리뷰를 삭제 "}하시겠습니까?`)) {
    alert(`ID: ${id} ${(currentViewMode.value === 'deleted') ?  "리뷰 삭제가 취소 " : "리뷰가 삭제 "}되었습니다.`);
    console.log((currentViewMode.value === 'deleted' ? false : true))
    await axios.delete(`/api/reviews/delete/${id}`, {
      params: {
        isDelete: (currentViewMode.value === 'deleted' ? false : true)
      }
    });
    fetchReviews();
   }
};
const deleteAll = async () => {
  if (selectedReviews.value.length === 0) {
      alert("하나 이상의 삭제할 항목을 선택해주세요.");
      return; 
  }
  if (confirm(`정말로 선택한 항목들을 삭제하시겠습니까?`)) {
    alert(`선택한 모든 리뷰가 삭제되었습니다.`);
    await axios.delete(`/api/reviews/deleteAll`, {
      params: {
        reviews: selectedReviews.value,
        isDelete: (currentViewMode.value === 'deleted') ? false : true
      }
    });
    fetchReviews();
    selectedReviews.value = [];
  } 
}

const reject = async (id) => {
  if (confirm(`정말로 ID: ${id} 리뷰 삭제를 거절 하시겠습니까?`)) {
    alert(`ID: ${id} 리뷰 삭제를 거절하었습니다.`);
    await axios.get(`/api/reviews/report/${id}`, {
        params: {
          isReport: false
        }
      }
    );
    fetchReviews();
   }
}
const rejectAll = async () => {
  if (selectedReviews.value.length === 0) {
      alert("하나 이상의 삭제할 항목을 선택해주세요.");
      return; 
  }
  if (confirm(`정말로 선택한 항목을 모두 거절 하시겠습니까?`)) {
    alert(`선택한 모든 리뷰 삭제를 거절하었습니다.`);
    await axios.get(`/api/reviews/reportAll`, {
        params: {
          reviews: selectedReviews.value,
          isReport: false
        }
      }
    );
    fetchReviews();
    selectedReviews.value = [];
   }
}


const selectedReviews = ref([]);
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedReviews.value = reviewList.value.map(r => r.reviewId);
  } else {
    selectedReviews.value = [];
  }
};
</script>

<style scoped>
.admin-container {
  font-family: Pretendard, -apple-system, sans-serif;
  padding: 2rem;
  background-color: #f9fafb;
}

.admin-header {
  display: flex;
  align-items:center;
  margin-bottom: 1.0rem;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #111827;
}
.admin-filter {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.review-input {
    width: 250px; 
    height: 38px;
    line-height: 38px;
    padding: 0 10px; 
    border: 1px solid #ccc; 
    border-radius: 4px;
    margin-bottom: 10px;
    /* 글꼴 및 색상 */
    font-size: 14px;
    color: #333;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    margin-right: 10px;
}

.review-input:focus {
    border-color: #007bff; 
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); 
    outline: none; 
}
.review-count {
  display: inline-block;
  font-size: 1rem;
  color: #6b7280;
  background-color: #e5e7eb;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
}
.review-count-container {
  text-align: right;
}

.filter-tab button {
  padding: 8px 15px;
  height: 100%;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  color: #555;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  border-radius: 10px 10px 0 0;
  margin-bottom: -1px;
  transition: all 0.2s ease;
}
.filter-tab button:hover {
    background-color: #eee;
    color: #333;
}
.filter-tab button.active {
    background-color: #f6fff4; 
    color: #51a750;
    font-weight: 700;
    z-index: 2;
}

.table-wrapper {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* 화면이 작을 경우 스크롤 가능 */
}

.review-table {
    width: 100%; 
    table-layout: fixed;
    border-collapse: collapse; 
}

.review-table th, .review-table td {
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;

}

.review-table thead {
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 600;
}

.review-table tbody tr:hover {
  background-color: #f9fafb;
}

.review-table th, 
.review-table td {
    padding: 10px;
    border: 1px solid #ddd;
    overflow: hidden; 
    white-space: nowrap;
    text-overflow: ellipsis; 
}


/* 체크박스 (1번째 컬럼) */
.review-table th:nth-child(1),
.review-table td:nth-child(1) {
    width: 40px; 
}

/* 관리/액션 버튼 (8번째 컬럼) */
.review-table th:nth-child(8),
.review-table td:nth-child(8) {
    width: 8%; 
    text-align: center;
}


.side-container {
  display: flex;
  flex-direction: column;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.hotel-info {
  display: flex;
  flex-direction: column;
}

.hotel-id {
  font-size: 0.8rem;
  color: #6b7280;
}

.rating-cell {
  font-weight: bold;
  color: #f59e0b;
}

.text-cell {
  max-width: 250px; /* 긴 텍스트 자르기 */
}

.text-cell span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions-cell {
  white-space: nowrap; /* 버튼 줄바꿈 방지 */
}

.btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
  margin-right: 6px;
}

.btn:hover {
  background-color: #f3f4f6;
}

.btn-delete {
  color: #dc2626;
}
.btn-reject {
  color: #ff8128
}
.btn-reject:hover {
  background-color: #feece2;
  border-color: #fcbca5;
}
.btn-cancel {
  color: #299537;
}
.btn-cancel:hover {
  background-color: #e2fee5;
  border-color: #73c883;
}
.btn-delete:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}
.btn-toggle {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.review-table th,
.review-table td {
    transition: width 0.3s ease-in-out, 
                opacity 0.3s ease-in-out, 
                padding 0.3s ease-in-out;
    overflow: hidden;
}

.hidden-column {
    width: 0 !important; 
    min-width: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    opacity: 0;
}
</style>