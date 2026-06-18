<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <div class="mb-15px flex flex-wrap gap-15px items-center">
      <el-tabs v-model="statusFilter" @tab-change="handleStatusChange" class="flex-1">
        <el-tab-pane label="全部" :name="-1" />
        <el-tab-pane label="上线" :name="1" />
        <el-tab-pane label="下线" :name="0" />
      </el-tabs>
      <el-button type="primary" plain @click="handleCreate">
        <Icon class="mr-5px" icon="ep:plus" />
        新增公告
      </el-button>
      <el-button type="primary" plain @click="getList">
        <Icon class="mr-5px" icon="ep:refresh" />
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="left" label="标题" prop="title" min-width="200" />
      <el-table-column align="center" label="类型" prop="type" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 1" type="info">通知</el-tag>
          <el-tag v-else-if="scope.row.type === 2" type="success">活动</el-tag>
          <el-tag v-else type="warning">更新日志</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">上线</el-tag>
          <el-tag v-else type="info">下线</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column align="center" label="生效时间" prop="startTime" width="160">
        <template #default="scope">
          {{ scope.row.startTime || '立即生效' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="失效时间" prop="endTime" width="160">
        <template #default="scope">
          {{ scope.row.endTime || '永久有效' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="160" />
      <el-table-column align="center" label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            link
            type="success"
            @click="handleOnline(scope.row.id)"
          >
            上线
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            link
            type="warning"
            @click="handleOffline(scope.row.id)"
          >
            下线
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-15px flex justify-end">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </div>
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '新增公告'" width="600px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" :maxlength="100" show-word-limit placeholder="请输入公告标题" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入公告内容"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型">
          <el-option label="通知" :value="1" />
          <el-option label="活动" :value="2" />
          <el-option label="更新日志" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" />
      </el-form-item>
      <el-form-item label="生效时间">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          placeholder="不填则立即生效"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="失效时间">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          placeholder="不填则永久有效"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import * as AnnouncementApi from '@/api/kids/announcement'
import type { AnnouncementVO } from '@/api/kids/announcement'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'KidsAnnouncement' })

const loading = ref(true)
const list = ref<AnnouncementVO[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const statusFilter = ref(-1)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  content: '',
  type: 1,
  sort: 0,
  startTime: '',
  endTime: '',
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
}

const getList = async () => {
  loading.value = true
  try {
    const params: AnnouncementApi.AnnouncementPageReq = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }
    if (statusFilter.value >= 0) {
      params.status = statusFilter.value
    }
    const result = await AnnouncementApi.getAnnouncementPage(params)
    list.value = result.list || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

const handleStatusChange = () => {
  pageNo.value = 1
  getList()
}

const resetForm = () => {
  form.id = undefined
  form.title = ''
  form.content = ''
  form.type = 1
  form.sort = 0
  form.startTime = ''
  form.endTime = ''
}

const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: AnnouncementVO) => {
  isEdit.value = true
  form.id = row.id
  form.title = row.title
  form.content = row.content
  form.type = row.type
  form.sort = row.sort
  form.startTime = row.startTime || ''
  form.endTime = row.endTime || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await AnnouncementApi.updateAnnouncement({
        id: form.id!,
        title: form.title,
        content: form.content,
        type: form.type,
        sort: form.sort,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await AnnouncementApi.createAnnouncement({
        title: form.title,
        content: form.content,
        type: form.type,
        sort: form.sort,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleOnline = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定上线该公告？', '提示', { type: 'info' })
    await AnnouncementApi.onlineAnnouncement(id)
    ElMessage.success('已上线')
    getList()
  } catch {}
}

const handleOffline = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定下线该公告？下线后客户端将不再展示', '提示', { type: 'warning' })
    await AnnouncementApi.offlineAnnouncement(id)
    ElMessage.success('已下线')
    getList()
  } catch {}
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该公告？此操作不可恢复！', '危险操作', { type: 'warning' })
    await AnnouncementApi.deleteAnnouncement(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
