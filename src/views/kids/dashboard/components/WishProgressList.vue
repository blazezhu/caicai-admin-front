<template>
  <div class="wish-progress-list">
    <h3 class="section-title">我的心愿</h3>
    <div v-if="wishes.length === 0" class="empty-state">
      <span class="empty-icon">🎁</span>
      <p>还没有心愿</p>
    </div>
    <div v-else class="wish-list">
      <div v-for="wish in wishes.slice(0, 3)" :key="wish.wishId" class="wish-item">
        <div class="wish-icon">{{ wish.icon || '🎁' }}</div>
        <div class="wish-info">
          <div class="wish-name">{{ wish.wishName }}</div>
          <div class="wish-progress-bar">
            <div
              class="wish-progress-fill"
              :style="{ width: wish.progressPercent + '%' }"
              :class="{ achieved: wish.achieved }"
            ></div>
          </div>
          <div class="wish-points">
            <span class="current">{{ wish.currentPoints }}</span>
            <span class="separator">/</span>
            <span class="target">{{ wish.targetPoints }}</span>
          </div>
        </div>
        <div class="wish-percent" :class="{ achieved: wish.achieved }">
          {{ wish.progressPercent }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { WishProgress } from '@/api/kids/dashboard'

defineOptions({ name: 'WishProgressList' })

withDefaults(
  defineProps<{
    wishes: WishProgress[]
  }>(),
  {
    wishes: () => []
  }
)
</script>

<style lang="scss" scoped>
.wish-progress-list {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #909399;

  .empty-icon {
    font-size: 36px;
    display: block;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.wish-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.wish-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 10px;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(2px);
  }
}

.wish-icon {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.wish-info {
  flex: 1;
  min-width: 0;
}

.wish-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wish-progress-bar {
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 2px;
}

.wish-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.5s ease-out;

  &.achieved {
    background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
  }
}

.wish-points {
  font-size: 11px;
  color: #909399;

  .current {
    color: #667eea;
    font-weight: 600;
  }

  .separator {
    margin: 0 2px;
  }

  .target {
    color: #c0c4cc;
  }
}

.wish-percent {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  min-width: 42px;
  text-align: right;

  &.achieved {
    color: #67c23a;
  }
}
</style>
