<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <div class="mb-15px flex flex-wrap gap-15px items-center">
      <el-tabs v-model="statusFilter" @tab-change="handleStatusChange" class="flex-1">
        <el-tab-pane label="全部" :name="0" />
        <el-tab-pane label="待处理" :name="1" />
        <el-tab-pane label="已回复" :name="2" />
        <el-tab-pane label="已关闭" :name="3" />
      </el-tabs>
      <el-button type="primary" plain @click="getList">
        <Icon class="mr-5px" icon="ep:refresh" />
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="filteredList" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="用户" prop="userNickname" width="120">
        <template #default="scope">
          <span>{{ scope.row.userId || '游客' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="反馈内容" prop="content" min-width="200" />
      <el-table-column align="center" label="联系方式" prop="contact" width="140">
        <template #default="scope">
          <span class="text-gray-500">{{ scope.row.contact || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="warning">待处理</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success">已回复</el-tag>
          <el-tag v-else type="info">已关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="left" label="回复内容" prop="reply" min-width="160">
        <template #default="scope">
          <span v-if="scope.row.reply" class="text-green-500">{{ scope.row.reply }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提交时间" prop="createTime" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 1"
            link
            type="primary"
            @click="handleReply(scope.row)"
          >
            回复
          </el-button>
          <el-button
            v-if="scope.row.status !== 3"
            link
            type="warning"
            @click="handleClose(scope.row.id)"
          >
            关闭
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 回复弹窗 -->
  <el-dialog v-model="replyDialogVisible" title="回复反馈" width="560px" destroy-on-close>
    <div v-if="currentFeedback" class="feedback-context">
      <div class="context-label">用户反馈：</div>
      <div class="context-content">{{ currentFeedback.content }}</div>
      <div class="context-meta">
        <span>联系方式：{{ currentFeedback.contact || '无' }}</span>
        <span>提交时间：{{ formatDate(currentFeedback.createTime) }}</span>
      </div>
    </div>
    <el-form ref="replyFormRef" :model="replyForm" label-width="80px" class="mt-20px">
      <el-form-item label="回复内容" prop="reply" :rules="[{ required: true, message: '请输入回复内容', trigger: 'blur' }]">
        <el-input
          v-model="replyForm.reply"
          type="textarea"
          :rows="4"
          :maxlength="500"
          show-word-limit
          placeholder="请输入回复内容..."
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="replyDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleReplySubmit">确定回复</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import * as FeedbackApi from '@/api/kids/feedback'
import type { FeedbackVO } from '@/api/kids/feedback'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'KidsFeedback' })

const loading = ref(true)
const list = ref<FeedbackVO[]>([])
const statusFilter = ref(0)
const replyDialogVisible = ref(false)
const submitLoading = ref(false)
const replyFormRef = ref()
const currentFeedback = ref<FeedbackVO | null>(null)

const replyForm = reactive({
  id: undefined as number | undefined,
  reply: ''
})

const filteredList = computed(() => {
  if (statusFilter.value === 0) {
    return list.value
  }
  return list.value.filter(item => item.status === statusFilter.value)
})

const getList = async () => {
  loading.value = true
  try {
    list.value = await FeedbackApi.getFeedbackList()
  } finally {
    loading.value = false
  }
}

const handleStatusChange = () => {
  // computed property handles filtering automatically
}

const handleReply = (row: FeedbackVO) => {
  currentFeedback.value = row
  replyForm.id = row.id
  replyForm.reply = ''
  replyDialogVisible.value = true
}

const handleReplySubmit = async () => {
  await replyFormRef.value.validate()
  submitLoading.value = true
  try {
    await FeedbackApi.replyFeedback({
      id: replyForm.id!,
      reply: replyForm.reply
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleClose = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定关闭该反馈？', '提示', { type: 'warning' })
    await FeedbackApi.closeFeedback(id)
    ElMessage.success('已关闭')
    getList()
  } catch {}
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该反馈？此操作不可恢复！', '危险操作', { type: 'warning' })
    await FeedbackApi.deleteFeedback(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.feedback-context {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;

  .context-label {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .context-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .context-meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    gap: 20px;
  }
}
</style>
