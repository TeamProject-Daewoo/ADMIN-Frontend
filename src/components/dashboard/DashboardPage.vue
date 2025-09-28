<template>
  <div>
    <!-- 상단 바 -->
    <DashboardTopBar
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      v-model:rangeDays="rangeDays"
      :loading="loading"
      :numbers="hotelBusinessNumbers"
      @apply="applyCustomRange"
      @clear="clearCustomRange"
      @search="setBusiness"
    />

    <!-- KPI -->
    <KpiCards
      :loading="loading"
      :day-count="dayCount"
      :total-bookings-in-range="totalBookingsInRange"
      :this-month-bookings="thisMonthBookings"
      :this-week-bookings="thisWeekBookings"
      :active-today="activeToday"
      :rooms-total="roomsTotal"
      :rooms-available="roomsAvailable"
      :profit-total="profitTotal"
      :profit-month="profitMonth"
      :profit-week="profitWeek"
      :expenses-total="expensesTotal"
      :expenses-month="expensesMonth"
      :expenses-week="expensesWeek"
      :spark-bookings="sparkBookings"
      :spark-rooms="sparkRooms"
      :spark-profit="sparkProfit"
      :spark-expenses="sparkExpenses"
    />

    <!-- 중단 차트 -->
    <ChartsRow
      v-model:pkgRangeDays="pkgRangeDays"
      v-model:typeRangeDays="typeRangeDays"
      :day-count="dayCount"
      :loading="loading"
      :top-pkg-chart="topPkgChart"
      :revenue-chart="revChart"
      :room-type-chart="roomTypeChart"
      :btn-hide="isBusinessNumberNull"
      :titles="middleChartsTitle"
      @update:revenue-key-type="revenuehandleKeyTypeChange"
      @update:reserv-key-type="reservhandleKeyTypeChange"
    />

    <!-- 하단 -->
    <div class="grid bottom">
      <IncomeExpensesPanel
        v-model:rangeDays="rangeDays"
        :loading="loading"
        :btn-hide="isBusinessNumberNull"
        :income-expense-chart="incomeChart"
        @update:top10-key-type="top10handleKeyTypeChange"
      />

      <NewCustomers :reservations="reservations" />
      <RecentActivities :reservations="reservations" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import DashboardTopBar from './DashboardTopBar.vue'
import KpiCards from './KpiCards.vue'
import ChartsRow from './ChartsRow.vue'
import IncomeExpensesPanel from './IncomeExpensesPanel.vue'
import NewCustomers from './NewCustomers.vue'
import RecentActivities from './RecentActivities.vue'
import api from '@/api/axios'

const loading = ref(true)
const hotels = ref([])
const reservations = ref([])   // 전체/단일 모두 여기로 집계
const rooms = ref([])
const roomMap = ref({})
const hotelMap = ref({})
const hotelBusinessNumbers = ref(null);

const rangeDays = ref(7)
const pkgRangeDays = ref(7)
const typeRangeDays = ref(7)

/* 날짜 범위 */
const startDate = ref('')
const endDate   = ref('')

const revenueValue = ref('');
const reservationValue = ref('');
const top10Value = ref('');

/* props */
const isBusinessNumberNull = computed(() => businessNumber.value === null);
const middleChartsTitle = computed(() => 
  isBusinessNumberNull.value ? ['인기 지역', '총 매출액', '예약 비중'] : ['인기 객실', '매출 추이', '예약 객실 비중']
);
const incomeChart = computed(() => isBusinessNumberNull.value ? incomeExpenseChartByHotel.value : incomeExpenseChart.value);
const revChart = computed(() => isBusinessNumberNull.value ? totalRevenueChart.value : revenueChart.value);
const COLOR = computed(() => isBusinessNumberNull.value ? LIGHT_BLUE_COLORS : GREEN_COLORS )

const createKeyTypeHandler = (targetRef) => {
  return (newKeyType) => {
    targetRef.value = newKeyType;
  };
};
const revenuehandleKeyTypeChange = createKeyTypeHandler(revenueValue);
const reservhandleKeyTypeChange = createKeyTypeHandler(reservationValue)
const top10handleKeyTypeChange = createKeyTypeHandler(top10Value)

const businessNumber = ref(null)
const setBusiness = (number) => {
  businessNumber.value = number;
  load();
}

function applyCustomRange () {
  if (!startDate.value || !endDate.value) return
  if (new Date(startDate.value) > new Date(endDate.value)) {
    const t = startDate.value; startDate.value = endDate.value; endDate.value = t
  }
}
function clearCustomRange () { startDate.value = ''; endDate.value = '' }

/* 유틸 */
const n = (v) => Number(v ?? 0).toLocaleString('ko-KR')
const dOnly = (v) => (v ? String(v).slice(0,10) : '')
const addDays = (dt, days) => { const d = new Date(dt); d.setDate(d.getDate()+days); return d }
const isCanceled = (s) => (s || '').toUpperCase().includes('CANCEL') || (s || '').includes('취소')
const moneyOf = (r) => Number(r.totalPrice ?? r.total ?? r.amount ?? r.price ?? 0)
const safeChart = (series = [], options = {}) => ({ series, options })

/* 날짜 라벨 */
const rangeDateLabels = computed(() => {
  const end = endDate.value ? new Date(endDate.value) : new Date()
  const start = startDate.value ? new Date(startDate.value) : addDays(end, -(rangeDays.value - 1))
  let s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  let e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  if (s > e) [s,e] = [e,s]
  const arr = []; const cur = new Date(s)
  while (cur <= e) {
    arr.push(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`)
    cur.setDate(cur.getDate()+1)
  }
  return arr
})
const dayCount = computed(() => rangeDateLabels.value.length)

const flag = ref(false);
onMounted(() => {
  load();
})
async function load () {
  loading.value = true
  try {
    const result = await api.get( businessNumber.value == null ? '/api/admin/hotels' : `/api/admin/bushotels?businessNumber=${businessNumber.value}`);
    hotels.value = result.data;
    //자식에게 넘길 사업자 목록(첫 api 호출 1회만)
    if(!flag.value) {
      const extractedNumbers = hotels.value.map(hotel => hotel.businessNumber);
      hotelBusinessNumbers.value = new Set(extractedNumbers);
    }
    flag.value = true;

    reservations.value = hotels.value.flatMap(h => (h.reservations || []));
    rooms.value = hotels.value.flatMap(h => (h.rooms || []));
    //Join 용 Map
    roomMap.value = Object.fromEntries(rooms.value.map(room => [room.roomId, room]));
    hotelMap.value = Object.fromEntries(hotels.value.map(hotel => [hotel.contentId, hotel]));
  } finally {
    loading.value = false
  }
}


/* KPI (공통: reservations/rooms만 보고 계산) */
const bookingsByDay = computed(() => {
  const map = Object.fromEntries(rangeDateLabels.value.map(x => [x,0]))
  for (const r of reservations.value) {
    const d = dOnly(r.checkInDate)
    if (d in map && !isCanceled(r.status)) map[d]++
  }
  return map
})
const totalBookingsInRange = computed(() => Object.values(bookingsByDay.value).reduce((a,b)=>a+b,0))
const thisMonthBookings = computed(() => {
  const d = new Date(); const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  return reservations.value.filter(r => dOnly(r.checkInDate).startsWith(ym) && !isCanceled(r.status)).length
})
const thisWeekBookings = computed(() => {
  const now = new Date(); const monday = addDays(now, -((now.getDay()+6)%7)); const set = new Set()
  for (let i=0;i<7;i++){ const d = addDays(monday,i); set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`) }
  return reservations.value.filter(r => set.has(dOnly(r.checkInDate)) && !isCanceled(r.status)).length
})

// 전체 객실 수
const roomsTotal = computed(() => 
  rooms.value.reduce((sum, r) => sum + (r.roomcount ?? 0), 0)
)

// 이용 중 객실
const activeToday = computed(() => {
  const t = rangeDateLabels.value[rangeDateLabels.value.length-1]
  let count = 0
  for (const r of reservations.value) {
    if (isCanceled(r.status)) continue
    const inOk = dOnly(r.checkInDate) <= t
    const outOk = dOnly(r.checkOutDate) > t
    if (inOk && outOk) {
      count += (r.roomcount ?? 1) // 예약에서 실제 몇 실이 사용됐는지
    }
  }
  return count
})

// 이용 가능 객실
const roomsAvailable = computed(() => 
  Math.max(roomsTotal.value - activeToday.value, 0)
)
/* 매출/지출/순이익 */
const revenueDailyRaw = computed(() => {
  const map = Object.fromEntries(rangeDateLabels.value.map(d => [d,0]))
  for (const r of reservations.value) {
    const d = dOnly(r.checkInDate)
    if (d in map && !isCanceled(r.status)) map[d] += moneyOf(r)
  }
  return map
})

const calculateRevenueByHotel = (keyName) => {
  const map = {};
  const dateSet = new Set(rangeDateLabels.value); 
  
  for (const r of reservations.value) {
    const d = dOnly(r.checkInDate);
    
    if (dateSet.has(d) && !isCanceled(r.status)) {
      const hotelKey = hotelMap.value[r.contentId][keyName];
      map[hotelKey] = (map[hotelKey] || 0) + moneyOf(r);
    }
  }
  return map;
};
const revenueInDateRange = computed(() => {
    return calculateRevenueByHotel(revenueValue.value); 
});
const top10DateRange = computed(() => {
    return calculateRevenueByHotel(top10Value.value); 
});

const expensesDailyRaw = computed(() => {
  const out = {}; for (const d of Object.keys(revenueDailyRaw.value)) out[d] = Math.round(revenueDailyRaw.value[d]*0.35)
  return out
})
const profitDailyRaw = computed(() => {
  const out = {}; for (const d of rangeDateLabels.value) out[d] = (revenueDailyRaw.value[d]||0)-(expensesDailyRaw.value[d]||0)
  return out
})

const profitTotal = computed(() => Object.values(profitDailyRaw.value).reduce((a,b)=>a+b,0))
const profitMonth = computed(() => {
  const d = new Date(); const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  return Object.entries(profitDailyRaw.value).reduce((s,[k,v])=>s+(k.startsWith(ym)?v:0),0)
})
const profitWeek = computed(() => {
  const now = new Date(); const monday = addDays(now,-((now.getDay()+6)%7)); const set = new Set()
  for (let i=0;i<7;i++){ const d = addDays(monday,i); set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`) }
  return Object.entries(profitDailyRaw.value).reduce((s,[k,v])=>s+(set.has(k)?v:0),0)
})
const expensesTotal = computed(() => Object.values(expensesDailyRaw.value).reduce((a,b)=>a+b,0))
const expensesMonth = computed(() => {
  const d = new Date(); const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  return Object.entries(expensesDailyRaw.value).reduce((s,[k,v])=>s+(k.startsWith(ym)?v:0),0)
})
const expensesWeek = computed(() => {
  const now = new Date(); const monday = addDays(now,-((now.getDay()+6)%7)); const set = new Set()
  for (let i=0;i<7;i++){ const d = addDays(monday,i); set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`) }
  return Object.entries(expensesDailyRaw.value).reduce((s,[k,v])=>s+(set.has(k)?v:0),0)
})

/* 스파크 */
const toSpark = (map) => { const vals = Object.values(map); const max = Math.max(1, ...vals); return vals.map((v,i)=>({id:i,h:Math.round((v/max)*100)})) }
const sparkBookings = computed(() => toSpark(bookingsByDay.value))
const sparkRooms    = computed(() => toSpark(bookingsByDay.value))
const sparkExpenses = computed(() => toSpark(expensesDailyRaw.value))
const sparkProfit   = computed(() => toSpark(profitDailyRaw.value))

/* 차트 데이터 */
const topPkgData = computed(() => {
  const cutoff = addDays(new Date(), -pkgRangeDays.value); const map = {}
  for (const r of reservations.value) {
    const d = new Date(dOnly(r.checkInDate)); if (isNaN(d) || d < cutoff) continue
    if (isCanceled(r.status)) continue
    let title;
    if(isBusinessNumberNull.value) {
      title = hotelMap.value[r.contentId]?.area;
    }
    else {
      title = (`${roomMap.value[r.roomcode]?.roomName}(${r.roomcode})` || '미지정').toString().trim()
    }
    map[title] = (map[title]||0)+1
  }
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6)
  return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) }
})

const topPkgChart = computed(() => safeChart(
  [{ name: '예약 횟수', data: topPkgData.value.data ?? [] }],
  { chart:{toolbar:{show:false},foreColor:'#6b7280'}, colors:COLOR.value,
    plotOptions:{bar:{horizontal:true,borderRadius:6,columnWidth:'60%', distributed: true}},
    xaxis:{categories:topPkgData.value.labels ?? [], axisBorder:{show:false}, axisTicks:{show:false}},
    dataLabels:{enabled:false}, 
    grid:{strokeDashArray:4, borderColor:COLOR.value}, 
    tooltip:{y: {formatter: (value) => value}} }
))

//예약 비중
const roomTypeChart = computed(() => {
  const cutoff = addDays(new Date(), -typeRangeDays.value); const counts = {}
  for (const r of reservations.value) {
    if (isCanceled(r.status)) continue
    const d = new Date(dOnly(r.checkInDate)); if (isNaN(d) || d < cutoff) continue
    let title;
    if(isBusinessNumberNull.value) {
      title = (hotelMap.value[r.contentId][reservationValue.value] || '미지정').toString().trim()
    }
    else {
      title = (`${roomMap.value[r.roomcode]?.roomName}(${r.roomcode})` || '미지정').toString().trim()
    }
    counts[title] = (counts[title]||0)+1
  }
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1])
  if (!entries.length) return safeChart([1], { labels:['데이터 없음'], legend:{position:'bottom'}, dataLabels:{enabled:true, formatter:()=> '100%'} })
  const TOP = 6; let top = entries
  if (entries.length > TOP) {
    const head = entries.slice(0,TOP); const tail = entries.slice(TOP)
    const others = tail.reduce((s,[,v])=>s+v,0); top = [...head, ['기타', others]]
  }
  const labels = top.map(([k])=>k); const series = top.map(([,v])=>v)
  return safeChart(series, { labels, legend:{position:'bottom'},colors: COLOR.value, dataLabels:{enabled:true, formatter:(v)=>v.toFixed(1)+'%'}, tooltip:{ y:{ formatter:(v)=>Number(v).toLocaleString('ko-KR')+' 건' } } })
})

const revenueChart = computed(() => safeChart(
  [{ name:'매출', data: rangeDateLabels.value.map(d=>revenueDailyRaw.value[d]||0) }],
  { chart:{toolbar:{show:false}}, colors: COLOR.value, legend: { show: false },
    plotOptions:{bar:{columnWidth:'40%', borderRadius:6, distributed: true }},
    xaxis:{ categories:rangeDateLabels.value, tickAmount:rangeDateLabels.value.length, tickPlacement:'between',
      labels:{ rotate:0, trim:false, hideOverlappingLabels:false, formatter:(val,_ts,th)=> {
        const labels = (th && typeof th==='object' && th.w?.globals?.labels) ? th.w.globals.labels : rangeDateLabels.value
        const idx = (th && typeof th==='object' && typeof th.i==='number') ? th.i : labels.indexOf(val)
        const last = Math.max(0, labels.length-1); return (idx===0 || idx===last) ? val : ''
      }, style:{colors:'#94a3b8'} },
      axisTicks:{show:false}, axisBorder:{show:false} },
    yaxis:{ labels:{ formatter:(v)=>n(Math.round(v)) } }, dataLabels:{enabled:false},
    grid:{ strokeDashArray:4, borderColor:'#edf1f7' }, tooltip:{ y:{ formatter:(v)=>n(Math.round(v))+' 원' } } }
))

const totalRevenueChart = computed(() => safeChart(
  [{ name:'매출', data: Object.values(revenueInDateRange.value) }],
  { 
    chart: { type: 'bar' },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        distributed: true
      }
    },
    colors: COLOR.value,
    dataLabels: { enabled: false },
    xaxis: { 
      categories: Object.keys(revenueInDateRange.value) ,
      labels: { show: false },
      axisTicks: {show: false },
      axisBorder: { show: false }
    },
    yaxis: { labels: { formatter: (val) => val.toLocaleString() + "원" } },
    tooltip: { y: { formatter: (val) => val.toLocaleString() + "원" } },
    legend: { position: "bottom" },
    title: { text: undefined }
  }))
const incomeExpenseChart = computed(() => safeChart(
  [
    { name:'수입', data: rangeDateLabels.value.map(d=>revenueDailyRaw.value[d]||0) },
    { name:'지출', data: rangeDateLabels.value.map(d=>expensesDailyRaw.value[d]||0) }
  ],
  { chart:{toolbar:{show:false}}, colors:['#60d0a8','#f78fb3'],
    stroke:{width:3, curve:'smooth'}, markers:{size:0},
    xaxis:{ categories:rangeDateLabels.value, tickAmount:rangeDateLabels.value.length,
      labels:{ rotate:0, trim:false, hideOverlappingLabels:false, formatter:(val,_ts,th)=> {
        const labels = (th && typeof th==='object' && th.w?.globals?.labels) ? th.w.globals.labels : rangeDateLabels.value
        const idx = (th && typeof th==='object' && typeof th.i==='number') ? th.i : labels.indexOf(val)
        const last = Math.max(0, labels.length-1); return (idx===0 || idx===last) ? val : ''
      }, style:{colors:'#94a3b8'} },
      axisTicks:{show:false}, axisBorder:{show:false} },
    yaxis:{ labels:{ formatter:(v)=>n(Math.round(v)) } }, dataLabels:{enabled:false},
    grid:{ strokeDashArray:4, borderColor:'#edf1f7' }, tooltip:{ y:{ formatter:(v)=>n(Math.round(v))+' 원' } } }
))

//top 10
const top10Hotels = computed(() => {
  const totalRevenueMap = top10DateRange.value;
  const dailyRevenueMap = revenueDailyByHotelMap.value; 
  const dateLabels = rangeDateLabels.value; 
  const keyName = top10Value.value;

  //keyName을 키 값으로 중복 제거
  const keyToRepresentativeHotelMap = {};
    for (const hotel of hotels.value) {
        const hotelKey = hotel[keyName];
        if (!keyToRepresentativeHotelMap[hotelKey]) {
            keyToRepresentativeHotelMap[hotelKey] = hotel;
        }
    }

    const hotelsWithRevenue = [];
    for (const hotelKey of Object.keys(totalRevenueMap)) {
        const totalRevenue = totalRevenueMap[hotelKey] || 0;
        
        if (totalRevenue <= 0) continue; 

        const representativeHotel = keyToRepresentativeHotelMap[hotelKey];
        if (representativeHotel) {
            const dailyData = dateLabels.map(date => {
                return dailyRevenueMap[date]?.[hotelKey] || 0; 
            });

            hotelsWithRevenue.push({
                ...representativeHotel,
                [keyName]: hotelKey,
                totalRevenue: totalRevenue,
                dailyRevenue: dailyData
            });
        }
    }

  hotelsWithRevenue.sort((a, b) => b.revenue - a.revenue);
  return hotelsWithRevenue.slice(0, 10);
});

const BLUE_COLORS = [
  '#003f5c', // 아주 진한 남색 (Dark Indigo)
  '#2f4b7c', // 깊은 코발트 (Deep Cobalt)
  '#4c7f9e', // 차분한 파란색 (Calm Blue)
  '#63a0bb', // 중간 파란색 (Medium Blue)
  '#78b9d3', // 밝은 코발트 (Light Cobalt)
  '#8ecfec', // 맑은 하늘색 (Clear Sky)
  '#005f73', // 짙은 청록색 (Dark Teal)
  '#0a9396', // 터키석 (Turquoise)
  '#2a7985', // 바다색 (Sea Green)
  '#4a99a8', // 중간 청록색 (Medium Teal)
  '#6ec1c1', // 아쿠아 (Aqua)
  '#8dd0d0', // 연한 아쿠아 (Light Aqua)
];
const LIGHT_BLUE_COLORS = [
  '#0D47A1', // 아주 진한 네이비 블루 (Navy Blue)
  '#1565C0', // 짙은 파랑 (Deep Blue)
  '#1976D2', // 기본적인 선명한 파랑 (Standard Blue)
  '#1E88E5', // 선명한 스카이 블루 (Bright Blue)
  '#2196F3', // 대표적인 파랑 (Primary Blue)
  '#42A5F5', // 밝은 파랑 (Light Blue)
  '#64B5F6', // 하늘색 느낌 (Sky Blue)
  '#90CAF9', // 연한 파스텔 블루 (Pastel Blue)
  '#BBDEFB', // 은은한 연하늘색 (Soft Sky Blue)
  '#E3F2FD', // 거의 흰색에 가까운 하늘색 (Very Pale Blue)
];
const GREEN_COLORS = [
  '#6fbf73', // 선명한 녹색 (Fresh Green)
  '#4caf50', // 기본적인 녹색 (Standard Green)
  '#81c784', // 부드러운 연녹색 (Soft Light Green)
  '#a5d6a7', // 은은한 파스텔 녹색 (Pastel Green)
  '#388e3c', // 짙은 녹색 (Deep Green)
  '#2e7d32', // 다크 포레스트 (Dark Forest Green)
  '#66bb6a', // 상쾌한 연두 (Refreshing Green)
  '#9ccc65', // 노란기 도는 연두 (Yellowish Green)
  '#aed581', // 밝은 연두빛 (Bright Light Green)
  '#c5e1a5', // 차분한 파스텔 (Calm Pastel Green)
  '#dcedc8', // 연하고 밝은 민트빛 (Light Mint Green)
  '#f1f8e9', // 거의 흰색에 가까운 민트 (Mint White)
];

const revenueDailyByHotelMap = computed(() => {
  const map = Object.fromEntries(rangeDateLabels.value.map(d => [d, {}]));
  for (const r of reservations.value) {
    const d = dOnly(r.checkInDate);
    
    if (d in map && !isCanceled(r.status)) {
      const hotelKey = hotelMap.value[r.contentId][[top10Value.value]];
      if (hotelKey) {
        const dailyHotelMap = map[d];
        dailyHotelMap[hotelKey] = (dailyHotelMap[hotelKey] || 0) + moneyOf(r);
      }
    }
  }
  return map;
});

const incomeExpenseChartByHotel = computed(() => {
  const dailyMap = revenueDailyByHotelMap.value;
  const dateLabels = rangeDateLabels.value;

  const seriesData = top10Hotels.value.map(hotel => {
    const seriesName = hotel[top10Value.value];
    const hotelKey = hotel[top10Value.value];

    const dailyData = dateLabels.map(date => {
      return dailyMap[date][hotelKey] || 0;
    });
    return {
      name: seriesName,
      data: dailyData
    };
  });

  return safeChart(
    seriesData,
    {
      chart: { toolbar: { tools: { zoom: false, pan: false } },
      zoom: { enabled: false } },
      stroke: { width: 3, curve: 'smooth' }, 
      markers: { size: 0 },
      colors: BLUE_COLORS,
      xaxis: {
        categories: dateLabels, 
        tickAmount: dateLabels.length,
        labels:{ 
          rotate:0, 
          trim:false, 
          hideOverlappingLabels:false,
          formatter:(val,_ts,th)=> {
            const labels = (th && typeof th==='object' && th.w?.globals?.labels) ? th.w.globals.labels : rangeDateLabels.value
            const idx = (th && typeof th==='object' && typeof th.i==='number') ? th.i : labels.indexOf(val)
            const last = Math.max(0, labels.length-1); 
            return (idx===0 || idx===last) ? val : ''
          }, 
          style:{colors:'#94a3b8'} 
        },
        axisTicks:{show:false}, 
        axisBorder:{show:false} 
      },
      yaxis: { labels: { formatter: (v) => n(Math.round(v)) } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: '#edf1f7' },
      tooltip: { y: { formatter: (v) => n(Math.round(v)) + ' 원' } }
    }
  )
});
    
</script>


<style>
/* 공통 레이아웃/스타일 (자식에서도 사용될 클래스를 전역으로 둠) */
.topbar{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin:6px 0 12px; flex-wrap:wrap; }
.date-filter{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.date-filter .label{ color:#475569; font-weight:700; }
.input-date{ border:1px solid #e5e7eb; border-radius:10px; padding:8px 10px; background:#fff; }
.tilde{ color:#94a3b8; }
.btn{ background:#111827; color:#fff; border:none; padding:10px 14px; border-radius:10px; font-weight:600; transition: background-color .3s ease, transform .2s ease; }
.btn:hover{ background:#4b5563; transform: translateY(-1px); }
.btn.ghost{ background:#fff; color:#374151; border:1px solid #e5e7eb; }
.btn.ghost:hover{ background:#f8fafc; }
.select{ border:1px solid #e5e7eb; border-radius:10px; padding:13px 12px; background:#fff; }
.select.sm{ padding:6px 10px; font-size:13px; }
.grid{ display:grid; gap:30px; }
.top-cards{ grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.mid{ grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top:40px; gap:70px; }
.bottom{ grid-template-columns: 2fr 1.5fr 1.5fr; margin-top:40px; gap:70px; }
@media (max-width:1200px){ .mid, .bottom{ grid-template-columns: 1fr; } }
.card, .panel{ background: linear-gradient(145deg, #ffffff, #f3f4f6); border-radius:16px; padding:18px; box-shadow:0 8px 20px rgba(17,24,39,.1); transition: box-shadow .3s ease, transform .2s ease; }
.card:hover, .panel:hover{ transform: translateY(-2px); box-shadow:0 12px 24px rgba(17,24,39,.15); }
.panel-head{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:10px; }
.muted{ color:#9aa3b2; font-size:12px; }

/* KPI 카드 전역 클래스 */
.card.kpi{ --kpi-accent:#e2e8f0; background:#fff; border:1px solid #eef2f7; padding:16px 18px; border-left:4px solid var(--kpi-accent); }
.kpi--bookings{ --kpi-accent:#cfe2ff; } .kpi--rooms{ --kpi-accent:#c9f7e2; }
.kpi--expenses{ --kpi-accent:#ffe2e7; } .kpi--profit{ --kpi-accent:#dcfce7; }
.kpi-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.kpi-title{ font-size:13px; color:#64748b; font-weight:700; letter-spacing:.2px; }
.kpi-badge{ display:inline-flex; align-items:center; gap:6px; font-size:11px; padding:3px 8px; border-radius:999px; background:#f8fafc; color:#64748b; border:1px solid #eef2f7; line-height:1; }
.kpi-badge::before{ content:"→"; font-size:10px; transform: translateY(-.5px); }
.kpi-badge.up{ color:#16a34a; background:#e7f6ee; border-color:#d1fae5; }
.kpi-badge.up::before{ content:"▲"; }
.kpi-badge.down{ color:#dc2626; background:#ffecec; border-color:#ffe1e1; }
.kpi-badge.down::before{ content:"▼"; }
.kpi-main{ display:flex; align-items:baseline; gap:6px; margin-top:2px; }
.kpi-main .v{ font-size:clamp(28px,3.2vw,34px); font-weight:800; color:#0f172a; letter-spacing:-.02em; line-height:1; font-variant-numeric:tabular-nums; }
.kpi-main .unit{ font-size:16px; color:#94a3b8; font-weight:700; position:relative; top:-1px; }
.kpi-main.ratio .slash{ margin:0 6px; color:#cbd5e1; font-weight:700; }
.kpi-main.ratio .total{ color:#94a3b8; font-weight:800; }
.kpi-divider{ height:1px; background:#f1f5f9; margin:10px 0 8px; border-radius:1px; }
.kpi-sub{ display:flex; gap:20px; margin-top:4px; } .kpi-sub.two{ gap:36px; }
.kpi-sub .kpi-subv{ font-weight:800; color:#0f172a; font-variant-numeric:tabular-nums; }
.mini-bars{ display:flex; gap:6px; align-items:flex-end; height:42px; margin-top:12px; justify-content:flex-end; }
.mini-bars .bar{ width:9px; background:linear-gradient(180deg,#e2e8f0,#cbd5e1); border-radius:6px 6px 0 0; }
.mini-skeleton{ height:46px; border-radius:10px; background: repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6 10px,#e5e7eb 10px,#e5e7eb 20px); }

/* people/timeline (NewCustomers/RecentActivities에서 사용) */
.people{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
.people-item{ display:flex; align-items:center; gap:12px; padding:12px; border:1px solid #f1f5f9; border-radius:12px; background:linear-gradient(180deg,#ffffff 0%, #fafbfd 100%); transition: transform .15s ease, box-shadow .15s ease, border-color .2s ease; }
.people-item:hover{ transform: translateY(-2px); box-shadow:0 10px 24px rgba(2,6,23,.06); border-color:#e2e8f0; }
.avatar{ min-width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; color:#0f172a; background:#eef2ff; }
.avatar-grad{ background: conic-gradient(from 200deg,#dbeafe,#ede9fe,#dcfce7,#ffe4e6,#dbeafe); color:#0f172a; }
.meta{ flex:1; min-width:0; }
.title{ font-weight:700; color:#111827; display:flex; align-items:center; gap:8px; }
.sub{ color:#6b7280; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.chip{ background:#eef2ff; color:#4f46e5; font-weight:700; font-size:10px; padding:2px 6px; border-radius:999px; }
.arrow{ color:#cbd5e1; font-size:20px; line-height:1; }
.timeline{ position:relative; padding-left:14px; }
.timeline:before{ content:''; position:absolute; left:6px; top:0; bottom:0; width:2px; background: linear-gradient(#e5e7eb,#f1f5f9); }
.tl-item{ position:relative; display:flex; gap:12px; margin-bottom:14px; }
.tl-dot{ position:absolute; left:-2px; top:4px; width:10px; height:10px; border-radius:50%; background:linear-gradient(180deg,#a5b4fc,#60a5fa); border:2px solid #fff; box-shadow:0 0 0 2px #e5e7eb; }
.tl-card{ margin-left:16px; background:#fff; border:1px solid #eef1f7; border-radius:12px; padding:12px; box-shadow:0 8px 18px rgba(2,6,23,.04); width:100%; }
.tl-title{ font-weight:700; color:#0f172a; margin-bottom:4px; }
.tl-meta{ color:#64748b; font-size:12px; }

.toggle-container {
  display: flex;
  text-align:right;
  align-items: center;
}

.toggle-container button {
  padding: 8px 10px;
  border: 1px solid #dadada;
  background-color: #ffffff;
  border-radius: 20px;
  color: #333; 
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease-in-out;
  margin-right: 10px;
  font-weight: bold;
}
.toggle-container button:hover {background-color: #efefef;}
</style>
