<template>
  <ContentWrap>
    <div v-loading="loading" class="ad-statistics">
      <!-- 概览卡片 -->
      <el-row :gutter="20" class="stat-row">
        <el-col :span="6">
          <div class="stat-card stat-card--purple">
            <div class="stat-card__value">{{ overview.todayVideoViews }}</div>
            <div class="stat-card__label">今日视频观看</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--blue">
            <div class="stat-card__value">{{ overview.totalVideoViews }}</div>
            <div class="stat-card__label">累计视频观看</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--green">
            <div class="stat-card__value">{{ overview.todayBannerViews }}</div>
            <div class="stat-card__label">今日Banner展示</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--orange">
            <div class="stat-card__value">{{ overview.totalUsers }}</div>
            <div class="stat-card__label">活跃用户数</div>
          </div>
        </el-col>
      </el-row>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form inline :model="queryParams" class="filter-form">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 每日趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>每日广告观看趋势</span>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>

      <!-- 各功能奖励统计 -->
      <el-row :gutter="20" class="reward-row">
        <el-col :span="8">
          <el-card class="reward-card">
            <template #header>
              <div class="card-header">
                <span>语音记账奖励</span>
              </div>
            </template>
            <div class="reward-content">
              <div class="reward-item">
                <span class="reward-label">观看次数：</span>
                <span class="reward-value">{{ rewardStats.voiceRecord.views }}</span>
              </div>
              <div class="reward-item">
                <span class="reward-label">发放奖励：</span>
                <span class="reward-value">{{ rewardStats.voiceRecord.rewards }} 次</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="reward-card">
            <template #header>
              <div class="card-header">
                <span>愿望池奖励</span>
              </div>
            </template>
            <div class="reward-content">
              <div class="reward-item">
                <span class="reward-label">观看次数：</span>
                <span class="reward-value">{{ rewardStats.wish.views }}</span>
              </div>
              <div class="reward-item">
                <span class="reward-label">发放奖励：</span>
                <span class="reward-value">{{ rewardStats.wish.rewards }} 个</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="reward-card">
            <template #header>
              <div class="card-header">
                <span>计划功能奖励</span>
              </div>
            </template>
            <div class="reward-content">
              <div class="reward-item">
                <span class="reward-label">观看次数：</span>
                <span class="reward-value">{{ rewardStats.planCount.views }}</span>
              </div>
              <div class="reward-item">
                <span class="reward-label">发放奖励：</span>
                <span class="reward-value">{{ rewardStats.planCount.rewards }} 个</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近观看记录 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>最近观看记录</span>
          </div>
        </template>
        <el-table :data="recordList" v-loading="tableLoading">
          <el-table-column label="用户ID" prop="userId" width="100" />
          <el-table-column label="广告类型" prop="adType" width="120">
            <template #default="{ row }">
              <el-tag :type="row.adType === 'reward_video' ? 'success' : 'primary'">
                {{ row.adType === 'reward_video' ? '激励视频' : 'Banner' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="奖励类型" prop="rewardType" width="120">
            <template #default="{ row }">
              {{ getRewardTypeName(row.rewardType) }}
            </template>
          </el-table-column>
          <el-table-column label="页面" prop="page" width="100" />
          <el-table-column label="观看时间" prop="watchedAt" width="180" />
        </el-table>
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          class="pagination"
        />
      </el-card>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { formatTime } from '@/utils'

defineOptions({ name: 'AdStatistics' })

const loading = ref(false)
const tableLoading = ref(false)
const dateRange = ref<[string, string]>([])
const chartRef = ref<HTMLElement>()

const queryParams = reactive({
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const overview = ref({
  todayVideoViews: 0,
  totalVideoViews: 0,
  todayBannerViews: 0,
  totalUsers: 0
})

const rewardStats = reactive({
  voiceRecord: { views: 0, rewards: 0 },
  wish: { views: 0, rewards: 0 },
  planCount: { views: 0, rewards: 0 },
  dashboard: { views: 0, rewards: 0 },
  shareBook: { views: 0, rewards: 0 }
})

const recordList = ref<any[]>([])

function getRewardTypeName(type) {
  const map = {
    voiceRecord: '语音记账',
    wish: '愿望池',
    planTime: '计划时间',
    planCount: '计划数量',
    dashboard: '大屏功能',
    shareBook: '分享账本'
  }
  return map[type] || '-'
}

function handleDateChange(val) {
  if (val) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

function handleQuery() {
  pagination.pageNo = 1
  loadData()
}

function handleReset() {
  dateRange.value = ['', '']
  queryParams.startDate = ''
  queryParams.endDate = ''
  pagination.pageNo = 1
  loadData()
}

function handleSizeChange() {
  loadRecordList()
}

function handlePageChange() {
  loadRecordList()
}

async function loadOverview() {
  // TODO: 调用后端接口获取概览数据
  // 目前使用模拟数据
  overview.value = {
    todayVideoViews: 156,
    totalVideoViews: 4523,
    todayBannerViews: 892,
    totalUsers: 328
  }
}

async function loadRewardStats() {
  // TODO: 调用后端接口获取奖励统计数据
  rewardStats.voiceRecord = { views: 1256, rewards: 6280 }
  rewardStats.wish = { views: 892, rewards: 892 }
  rewardStats.planCount = { views: 456, rewards: 456 }
  rewardStats.dashboard = { views: 234, rewards: 1638 }
  rewardStats.shareBook = { views: 89, rewards: 8 }
}

async function loadRecordList() {
  tableLoading.value = true
  try {
    // TODO: 调用后端接口获取记录列表
    // 目前使用模拟数据
    recordList.value = [
      { userId: 1001, adType: 'reward_video', rewardType: 'voiceRecord', page: 'home', watchedAt: '2026-05-18 18:30:25' },
      { userId: 1002, adType: 'reward_video', rewardType: 'wish', page: 'wish', watchedAt: '2026-05-18 18:25:10' },
      { userId: 1003, adType: 'banner', rewardType: null, page: 'home', watchedAt: '2026-05-18 18:20:00' },
      { userId: 1004, adType: 'reward_video', rewardType: 'dashboard', page: 'dashboard', watchedAt: '2026-05-18 18:15:30' },
      { userId: 1005, adType: 'reward_video', rewardType: 'planCount', page: 'plan', watchedAt: '2026-05-18 18:10:15' }
    ]
    pagination.total = 5
  } finally {
    tableLoading.value = false
  }
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      loadOverview(),
      loadRewardStats(),
      loadRecordList()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 设置默认日期范围为最近7天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  dateRange.value = [formatTime(start, 'yyyy-MM-dd'), formatTime(end, 'yyyy-MM-dd')]
  queryParams.startDate = dateRange.value[0]
  queryParams.endDate = dateRange.value[1]

  loadData()
})
</script>

<style scoped>
.ad-statistics {
  padding: 10px 0;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #fff;
}

.stat-card__value {
  font-size: 36px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-card__label {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.stat-card--blue {
  background: #409eff;
}

.stat-card--green {
  background: #67c23a;
}

.stat-card--orange {
  background: #e6a23c;
}

.stat-card--purple {
  background: #9b59b6;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.reward-row {
  margin-bottom: 20px;
}

.reward-card {
  height: 100%;
}

.card-header {
  font-weight: bold;
}

.reward-content {
  padding: 10px 0;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.reward-item:last-child {
  border-bottom: none;
}

.reward-label {
  color: #666;
}

.reward-value {
  font-weight: bold;
  color: #409eff;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
