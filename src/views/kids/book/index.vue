<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="账本名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入账本名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
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
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="账本名称" prop="name" />
      <el-table-column align="center" label="积分类型" prop="pointType" width="120">
        <template #default="scope">
          <span>{{ pointTypeLabel(scope.row.pointType) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="当前余额" prop="currentBalance" width="120" />
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column align="center" label="操作" width="160">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row.id)">详情</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { dateFormatter } from '@/utils/formatTime'
import * as BookApi from '@/api/kids/book'
import { useRouter } from 'vue-router'

defineOptions({ name: 'KidsBook' })

const router = useRouter()
const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined
})
const queryFormRef = ref()

const pointTypeLabel = (type: number) => {
  const map: Record<number, string> = { 1: '小红花', 2: '星星', 3: '积分', 4: '自定义' }
  return map[type] ?? '未知'
}

const getList = async () => {
  loading.value = true
  try {
    const data = await BookApi.getAccountBookPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const handleDetail = (id: number) => {
  router.push({ path: '/kids/book/detail', query: { id } })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该账本？', '提示', { type: 'warning' })
    await BookApi.deleteAccountBook(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
