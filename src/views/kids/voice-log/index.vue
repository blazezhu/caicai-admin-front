<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
      <el-form-item label="账本ID" prop="bookId">
        <el-input v-model="queryParams.bookId" class="!w-180px" clearable placeholder="账本ID" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="记账状态" prop="accountingStatus">
        <el-select v-model="queryParams.accountingStatus" class="!w-140px" clearable placeholder="全部" @change="handleQuery">
          <el-option label="全部" :value="undefined" />
          <el-option label="记账成功" :value="1" />
          <el-option label="记账失败" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="出错阶段" prop="errorStage">
        <el-select v-model="queryParams.errorStage" class="!w-180px" clearable placeholder="全部" @change="handleQuery">
          <el-option label="全部" value="" />
          <el-option label="AI 解析阶段" value="AI_PARSE" />
          <el-option label="写入记录阶段" value="ACCOUNTING" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <!-- 统计摘要 -->
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-num">{{ summary.total }}</span>
        <span class="summary-label">总记录</span>
      </div>
      <div class="summary-item success">
        <span class="summary-num">{{ summary.success }}</span>
        <span class="summary-label">记账成功</span>
      </div>
      <div class="summary-item danger">
        <span class="summary-num">{{ summary.failed }}</span>
        <span class="summary-label">记账失败</span>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column align="center" label="ID" prop="id" width="80" />
      <el-table-column align="center" label="账本ID" prop="bookId" width="100" />
      <el-table-column align="center" label="操作用户" prop="userId" width="100">
        <template #default="{ row }">
          <span>{{ row.userId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="原始录入文字" prop="voiceText" min-width="200">
        <template #default="{ row }">
          <span class="voice-text">{{ row.voiceText || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="记账状态" prop="accountingStatus" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.accountingStatus === 1" type="success" size="small">记账成功</el-tag>
          <el-tag v-else type="danger" size="small">记账失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="出错阶段" prop="errorStageName" width="120">
        <template #default="{ row }">
          <span v-if="row.errorStageName">{{ row.errorStageName }}</span>
          <span v-else class="text-gray">-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="错误信息" prop="errorMessage" min-width="160">
        <template #default="{ row }">
          <span v-if="row.errorMessage" class="error-msg">{{ row.errorMessage }}</span>
          <span v-else class="text-gray">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="关联记录" prop="recordId" width="100">
        <template #default="{ row }">
          <el-link v-if="row.recordId" type="primary" :underline="false" @click="handleViewRecord(row.recordId)">
            #{{ row.recordId }}
          </el-link>
          <span v-else class="text-gray">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="时间" prop="createTime" width="170" />
      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 详情抽屉 -->
  <el-drawer v-model="detailVisible" :title="`日志详情 #${currentRow?.id}`" size="600px" direction="rtl">
    <div v-if="currentRow" class="detail-container">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="账本ID">{{ currentRow.bookId }}</el-descriptions-item>
        <el-descriptions-item label="操作用户ID">{{ currentRow.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="记账状态">
          <el-tag v-if="currentRow.accountingStatus === 1" type="success" size="small">记账成功</el-tag>
          <el-tag v-else type="danger" size="small">记账失败</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联积分记录ID">{{ currentRow.recordId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="出错阶段">{{ currentRow.errorStageName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误码">{{ currentRow.errorCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createTime }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <div class="detail-label">原始录入文字</div>
        <el-input type="textarea" :model-value="currentRow.voiceText" :rows="3" readonly class="full-textarea" />
      </div>

      <div class="detail-section">
        <div class="detail-label">错误信息</div>
        <el-input
          type="textarea"
          :model-value="currentRow.errorMessage || ''"
          :rows="4"
          readonly
          class="full-textarea"
          placeholder="无"
        />
      </div>

      <div class="detail-section">
        <div class="detail-label">
          AI 解析原始返回
          <el-button size="small" @click="formatAiRaw">格式化</el-button>
          <el-button size="small" @click="copyAiRaw">复制</el-button>
        </div>
        <el-input
          type="textarea"
          ref="aiRawTextareaRef"
          :model-value="currentRow.aiRawOutput || ''"
          :rows="12"
          readonly
          class="full-textarea ai-raw-textarea"
          placeholder="无"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import * as VoiceLogApi from '@/api/kids/voiceLog'
import type { VoiceLogVO } from '@/api/kids/voiceLog'

defineOptions({ name: 'KidsVoiceLog' })

const loading = ref(false)
const total = ref(0)
const list = ref<VoiceLogVO[]>([])
const queryFormRef = ref()
const detailVisible = ref(false)
const currentRow = ref<VoiceLogVO | null>(null)
const aiRawTextareaRef = ref()

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  bookId: undefined as number | undefined,
  accountingStatus: undefined as number | undefined,
  errorStage: undefined as string | undefined,
})

const summary = computed(() => {
  const success = list.value.filter((l) => l.accountingStatus === 1).length
  const failed = list.value.filter((l) => l.accountingStatus === 2).length
  return { total: total.value, success, failed }
})

const getList = async () => {
  loading.value = true
  try {
    const data = await VoiceLogApi.getVoiceLogPage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const handleDetail = (row: VoiceLogVO) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleViewRecord = (recordId: number) => {
  ElMessage.info(`跳转到积分记录 #${recordId} 详情（暂未实现）`)
}

const formatAiRaw = () => {
  if (!currentRow.value?.aiRawOutput) return
  try {
    const obj = JSON.parse(currentRow.value.aiRawOutput)
    const textarea = aiRawTextareaRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.value = JSON.stringify(obj, null, 2)
    }
  } catch {
    ElMessage.warning('不是有效的 JSON 格式')
  }
}

const copyAiRaw = async () => {
  if (!currentRow.value?.aiRawOutput) return
  try {
    await navigator.clipboard.writeText(currentRow.value.aiRawOutput)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.summary-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .summary-num {
    font-size: 20px;
    font-weight: 600;
    color: #409eff;
  }

  &.success .summary-num {
    color: #67c23a;
  }

  &.danger .summary-num {
    color: #f56c6c;
  }

  .summary-label {
    font-size: 14px;
    color: #909399;
  }
}

.voice-text {
  font-size: 13px;
  color: #606266;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.error-msg {
  font-size: 13px;
  color: #f56c6c;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.text-gray {
  color: #c0c4cc;
}

.detail-container {
  padding: 0 16px;
}

.detail-section {
  margin-top: 20px;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.full-textarea {
  :deep(.el-textarea__inner) {
    font-size: 13px;
    color: #606266;
    background: #f5f7fa;
    resize: none;
  }
}

.ai-raw-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #606266;
    background: #f5f7fa;
    resize: none;
    white-space: pre;
  }
}
</style>
