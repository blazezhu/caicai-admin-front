<template>
  <div class="wish-progress-list">
    <h3 class="section-title">我的心愿</h3>
    <div v-if="wishes.length === 0" class="empty-state">
      <span class="empty-icon">🎁</span>
      <p>还没有心愿，快去创建一个吧！</p>
    </div>
    <div v-else class="wish-list">
      <div v-for="wish in wishes" :key="wish.wishId" class="wish-item">
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
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #909399;

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.wish-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wish-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(4px);
  }
}

.wish-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wish-info {
  flex: 1;
  min-width: 0;
}

.wish-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wish-progress-bar {
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.wish-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease-out;

  &.achieved {
    background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
  }
}

.wish-points {
  font-size: 12px;
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
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  min-width: 50px;
  text-align: right;

  &.achieved {
    color: #67c23a;
  }
}
</style>
