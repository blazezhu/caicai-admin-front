<template>
  <ContentWrap>
    <div v-loading="loading" class="kids-statistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card stat-card--blue">
            <div class="stat-card__value">{{ overview.totalBooks }}</div>
            <div class="stat-card__label">总账本数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--green">
            <div class="stat-card__value">{{ overview.totalRecords }}</div>
            <div class="stat-card__label">总记录数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--orange">
            <div class="stat-card__value">{{ overview.totalUsers }}</div>
            <div class="stat-card__label">总用户数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card--purple">
            <div class="stat-card__value">{{ overview.activeBooks }}</div>
            <div class="stat-card__label">本月活跃账本</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as StatisticsApi from '@/api/kids/statistics'
import type { OverviewVO } from '@/api/kids/statistics'

defineOptions({ name: 'KidsStatistics' })

const loading = ref(true)
const overview = ref<OverviewVO>({
  totalBooks: 0,
  totalRecords: 0,
  totalUsers: 0,
  activeBooks: 0
})

const getOverview = async () => {
  loading.value = true
  try {
    overview.value = await StatisticsApi.getOverview()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getOverview()
})
</script>

<style scoped>
.kids-statistics {
  padding: 10px 0;
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
</style>
