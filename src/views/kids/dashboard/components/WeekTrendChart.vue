<template>
  <div class="week-trend-chart">
    <h3 class="chart-title">本周积分趋势</h3>
    <div class="chart-container">
      <div
        v-for="(day, index) in data"
        :key="index"
        class="day-bar"
      >
        <div class="bar-wrapper">
          <div
            class="bar income-bar"
            :style="{ height: getBarHeight(day.income) + 'px' }"
            :title="'收入: ' + day.income"
          >
            <span v-if="day.income > 0" class="bar-value">+{{ day.income }}</span>
          </div>
          <div
            class="bar expense-bar"
            :style="{ height: getBarHeight(day.expense) + 'px' }"
            :title="'支出: ' + day.expense"
          >
            <span v-if="day.expense > 0" class="bar-value">-{{ day.expense }}</span>
          </div>
        </div>
        <span class="day-label">{{ day.dayLabel }}</span>
      </div>
    </div>
    <div class="chart-legend">
      <span class="legend-item">
        <span class="legend-dot income"></span> 收入
      </span>
      <span class="legend-item">
        <span class="legend-dot expense"></span> 支出
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { DayTrend } from '@/api/kids/dashboard'

defineOptions({ name: 'WeekTrendChart' })

const props = withDefaults(
  defineProps<{
    data: DayTrend[]
    maxHeight?: number
  }>(),
  {
    data: () => [],
    maxHeight: 100
  }
)

const maxValue = computed(() => {
  if (props.data.length === 0) return 10
  const max = Math.max(
    ...props.data.map((d) => Math.max(d.income, d.expense))
  )
  return max || 10
})

const getBarHeight = (value: number) => {
  if (maxValue.value === 0) return 0
  return Math.max((value / maxValue.value) * props.maxHeight, value > 0 ? 4 : 0)
}
</script>

<style lang="scss" scoped>
.week-trend-chart {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 140px;
  padding-bottom: 30px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    height: 1px;
    background: #ebeef5;
  }
}

.day-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100px;
}

.bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.income-bar {
  background: linear-gradient(180deg, #67c23a 0%, #85ce61 100%);

  .bar-value {
    color: #67c23a;
  }
}

.expense-bar {
  background: linear-gradient(180deg, #f56c6c 0%, #f78989 100%);

  .bar-value {
    color: #f56c6c;
  }
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.day-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;

  &.income {
    background: #67c23a;
  }

  &.expense {
    background: #f56c6c;
  }
}
</style>
