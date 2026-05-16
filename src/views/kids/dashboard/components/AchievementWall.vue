<template>
  <div class="achievement-wall">
    <h3 class="section-title">成就徽章</h3>
    <div class="achievement-stats">
      <span class="unlocked-count">{{ unlockedCount }}</span>
      <span class="total-count">/ {{ achievements.length }} 已解锁</span>
    </div>
    <div class="achievement-grid" :class="{ 'has-scroll': achievements.length > 12 }">
      <div
        v-for="achievement in displayAchievements"
        :key="achievement.code"
        class="achievement-item"
        :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
        :title="achievement.description"
      >
        <span class="achievement-icon">{{ achievement.icon }}</span>
        <span class="achievement-name">{{ achievement.name }}</span>
        <div v-if="!achievement.unlocked" class="achievement-lock">
          <Icon icon="ep:lock" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Achievement } from '@/api/kids/dashboard'

defineOptions({ name: 'AchievementWall' })

const props = withDefaults(
  defineProps<{
    achievements: Achievement[]
  }>(),
  {
    achievements: () => []
  }
)

const unlockedCount = computed(() => {
  return props.achievements.filter((a) => a.unlocked).length
})

// 显示所有成就，支持滚动
const displayAchievements = computed(() => {
  return props.achievements
})
</script>

<style lang="scss" scoped>
.achievement-wall {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.achievement-stats {
  margin-bottom: 10px;

  .unlocked-count {
    font-size: 20px;
    font-weight: 700;
    color: #f56c6c;
  }

  .total-count {
    font-size: 12px;
    color: #909399;
  }
}

.achievement-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
  align-content: start;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
  }
}

.achievement-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 12px;
  background: #f5f7fa;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 70px;

  &.unlocked {
    background: linear-gradient(135deg, #fef0f0 0%, #fdf6ec 100%);
    border: 2px solid #f56c6c;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
    }
  }

  &.locked {
    opacity: 0.5;
    filter: grayscale(1);
  }
}

.achievement-icon {
  font-size: 28px;
  margin-bottom: 4px;
  line-height: 1;
}

.achievement-name {
  font-size: 11px;
  color: #606266;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.achievement-lock {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  color: #c0c4cc;
}
</style>
