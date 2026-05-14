<template>
  <div class="achievement-wall">
    <h3 class="section-title">成就徽章</h3>
    <div class="achievement-stats">
      <span class="unlocked-count">{{ unlockedCount }}</span>
      <span class="total-count">/ {{ achievements.length }} 已解锁</span>
    </div>
    <div class="achievement-grid">
      <div
        v-for="achievement in achievements"
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
</script>

<style lang="scss" scoped>
.achievement-wall {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.achievement-stats {
  margin-bottom: 16px;

  .unlocked-count {
    font-size: 24px;
    font-weight: 700;
    color: #f56c6c;
  }

  .total-count {
    font-size: 14px;
    color: #909399;
  }
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.achievement-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  background: #f5f7fa;
  transition: all 0.3s;
  cursor: pointer;

  &.unlocked {
    background: linear-gradient(135deg, #fef0f0 0%, #fdf6ec 100%);
    border: 2px solid #f56c6c;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(245, 108, 108, 0.3);
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
}

.achievement-name {
  font-size: 11px;
  color: #606266;
  text-align: center;
  line-height: 1.2;
}

.achievement-lock {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
