<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <div class="mb-15px">
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class="-mb-15px"
      >
        <el-form-item label="计划名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入计划名称"
            clearable
            class="!w-240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-select v-model="queryParams.isActive" placeholder="请选择状态" clearable class="!w-140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <Icon class="mr-5px" icon="ep:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表头部操作栏 -->
    <div class="mb-15px">
      <el-button type="primary" @click="handleCreate">
        <Icon class="mr-5px" icon="ep:plus" />
        新增计划
      </el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="计划名称" prop="name" min-width="150" />
      <el-table-column align="center" label="频率" prop="frequencyType" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.frequencyType === 1" type="success">每日</el-tag>
          <el-tag v-else-if="scope.row.frequencyType === 2" type="primary">每周</el-tag>
          <el-tag v-else-if="scope.row.frequencyType === 3" type="warning">每月</el-tag>
          <el-tag v-else type="info">每年</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="动作数" prop="actionCount" width="100">
        <template #default="scope">
          {{ scope.row.actions?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="可见性" prop="visibility" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.visibility === 1" type="success">公开</el-tag>
          <el-tag v-else type="info">私有</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="系统预设" prop="isSystem" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.isSystem === 1" type="warning">系统预设</el-tag>
          <el-tag v-else>用户创建</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="isActive" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.isActive === 1" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createdAt" width="180" />
      <el-table-column align="center" label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <PlanFormDialog
    v-model="dialogVisible"
    :type="dialogType"
    :id="dialogId"
    @success="getList"
  />

  <!-- 查看详情弹窗 -->
  <PlanDetailDialog
    v-model="detailVisible"
    :id="detailId"
  />
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import PlanFormDialog from './PlanFormDialog.vue'
import PlanDetailDialog from './PlanDetailDialog.vue'
import * as PlanApi from '@/api/kids/plan'

defineOptions({ name: 'KidsPlan' })

const loading = ref(true)
const list = ref<PlanApi.Plan[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  isActive: undefined
})

const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const dialogId = ref<number>()

const detailVisible = ref(false)
const detailId = ref<number>()

const queryFormRef = ref()

/** 查询计划列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await PlanApi.getPlanList(queryParams)
    list.value = response.list || []
    total.value = response.total || 0
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const handleResetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 新增按钮操作 */
const handleCreate = () => {
  dialogType.value = 'create'
  dialogId.value = undefined
  dialogVisible.value = true
}

/** 编辑按钮操作 */
const handleEdit = (row: PlanApi.Plan) => {
  dialogType.value = 'edit'
  dialogId.value = row.id
  dialogVisible.value = true
}

/** 查看按钮操作 */
const handleView = (row: PlanApi.Plan) => {
  detailId.value = row.id
  detailVisible.value = true
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该计划？删除后不可恢复。', '提示', { type: 'warning' })
    await PlanApi.deletePlan(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
