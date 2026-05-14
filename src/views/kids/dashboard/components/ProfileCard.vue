<template>
  <div class="profile-card">
    <div class="avatar-wrapper">
      <el-avatar :size="80" :src="avatar" fit="cover">
        {{ nickname?.charAt(0) || '?' }}
      </el-avatar>
      <div class="level-badge">{{ levelIcon }}</div>
    </div>
    <div class="user-info">
      <h2 class="nickname">{{ nickname || '小朋友' }}</h2>
      <div class="level-name">{{ levelName }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'ProfileCard' })

withDefaults(
  defineProps<{
    nickname?: string
    avatar?: string
    levelName?: string
    levelIcon?: string
  }>(),
  {
    nickname: '小朋友',
    avatar: '',
    levelName: '小小能手',
    levelIcon: '🌱'
  }
)
</script>

<style lang="scss" scoped>
.profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.avatar-wrapper {
  position: relative;

  .level-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: 24px;
    background: #fff;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.user-info {
  flex: 1;

  .nickname {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 600;
  }

  .level-name {
    font-size: 14px;
    opacity: 0.9;
  }
}
</style>
