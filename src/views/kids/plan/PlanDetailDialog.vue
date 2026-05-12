<template>
  <el-dialog
    v-model="visible"
    title="计划详情"
    width="700px"
    destroy-on-close
    append-to-body
  >
    <div v-if="plan" class="plan-detail">
      <div class="detail-header">
        <h3>{{ plan.name }}</h3>
        <div class="tags">
          <el-tag v-if="plan.frequencyType === 1" type="success">每日</el-tag>
          <el-tag v-else-if="plan.frequencyType === 2" type="primary">每周</el-tag>
          <el-tag v-else-if="plan.frequencyType === 3" type="warning">每月</el-tag>
          <el-tag v-else type="info">每年</el-tag>

          <el-tag v-if="plan.visibility === 1" type="success">公开</el-tag>
          <el-tag v-else type="info">私有</el-tag>

          <el-tag v-if="plan.isActive === 1" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>

          <el-tag v-if="plan.isSystem === 1" type="warning">系统预设</el-tag>
        </div>
      </div>

      <div v-if="plan.description" class="detail-section">
        <h4>描述</h4>
        <p>{{ plan.description }}</p>
      </div>

      <div class="detail-section">
        <h4>动作列表 ({{ plan.actions?.length || 0 }})</h4>
        <div class="action-list">
          <div v-for="(action, index) in plan.actions" :key="index" class="action-item">
            <div class="action-header">
              <span class="action-name">{{ action.actionName }}</span>
              <span class="action-points">
                <span class="complete-points">完成: {{ action.pointOnComplete > 0 ? '+' : '' }}{{ action.pointOnComplete }}</span>
                <span class="incomplete-points">未完成: {{ action.pointOnIncomplete > 0 ? '+' : '' }}{{ action.pointOnIncomplete }}</span>
              </span>
            </div>
            <div class="action-meta">
              类别: {{ action.categoryName }}
              <span v-if="action.hasBranch === 1" class="branch-badge">有分支</span>
            </div>

            <!-- 分支列表 -->
            <div v-if="action.hasBranch === 1 && action.branches?.length" class="branch-list">
              <div v-for="(branch, bIndex) in action.branches" :key="bIndex" class="branch-item">
                <span class="branch-name">
                  {{ branch.branchName }}
                  <el-tag v-if="branch.isDefault === 1" size="small" type="warning">默认</el-tag>
                </span>
                <span class="branch-points">
                  {{ branch.pointDelta > 0 ? '+' : '' }}{{ branch.pointDelta }}
                </span>
                <span v-if="branch.conditionDesc" class="branch-condition">{{ branch.conditionDesc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>基本信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">{{ plan.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ plan.updatedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="plan.creatorName" label="创建者">{{ plan.creatorName }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as PlanApi from '@/api/kids/plan'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const plan = ref<PlanApi.Plan>()

const getDetail = async () => {
  try {
    plan.value = await PlanApi.getPlanDetail(props.id)
  } catch (e) {
    console.error('获取详情失败', e)
  }
}

watch(visible, (val) => {
  if (val) {
    getDetail()
  }
})
</script>

<style lang="scss" scoped>
.plan-detail {
  .detail-header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 12px;
      font-size: 20px;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .detail-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #333;
      border-left: 3px solid #ff8c61;
      padding-left: 8px;
    }

    p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-item {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px 16px;
  }

  .action-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .action-name {
    font-weight: 500;
    font-size: 15px;
  }

  .action-points {
    font-size: 13px;

    .complete-points {
      color: #67c23a;
      margin-right: 8px;
    }

    .incomplete-points {
      color: #909399;
    }
  }

  .action-meta {
    font-size: 13px;
    color: #909399;
  }

  .branch-badge {
    background: #fff3e0;
    color: #ff8c61;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    margin-left: 8px;
  }

  .branch-list {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #e4e7ed;
  }

  .branch-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    font-size: 13px;
  }

  .branch-name {
    flex: 1;
    color: #666;
  }

  .branch-points {
    color: #ff8c61;
    font-weight: 500;
  }

  .branch-condition {
    color: #909399;
    font-size: 12px;
  }
}
</style>
