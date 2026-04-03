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
      <el-form-item label="账本ID" prop="bookId">
        <el-input
          v-model="queryParams.bookId"
          class="!w-240px"
          clearable
          placeholder="请输入账本ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="方向" prop="direction">
        <el-select
          v-model="queryParams.direction"
          class="!w-240px"
          clearable
          placeholder="请选择方向"
        >
          <el-option label="收入" :value="1" />
          <el-option label="支出" :value="2" />
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
      <el-table-column align="center" label="账本ID" prop="bookId" width="100" />
      <el-table-column align="center" label="操作用户ID" prop="operatorUserId" width="120" />
      <el-table-column align="center" label="目标用户ID" prop="targetUserId" width="120" />
      <el-table-column align="center" label="方向" prop="direction" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.direction === 1" type="success">收入</el-tag>
          <el-tag v-else type="danger">支出</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="积分数" prop="amount" width="100" />
      <el-table-column align="center" label="余额" prop="balanceAfter" width="100" />
      <el-table-column align="center" label="备注" prop="remark" />
      <el-table-column align="center" label="来源" prop="source" width="80">
        <template #default="scope">
          <span>{{ sourceLabel(scope.row.source) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="记录时间"
        prop="recordTime"
        :formatter="dateFormatter"
        width="180"
      />
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
import { dateFormatter } from '@/utils/formatTime'
import * as RecordApi from '@/api/kids/record'

defineOptions({ name: 'KidsRecord' })

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  bookId: undefined,
  direction: undefined
})
const queryFormRef = ref()

const sourceLabel = (source: number) => {
  const map: Record<number, string> = { 1: '手动', 2: '模板', 3: 'AI' }
  return map[source] ?? '未知'
}

const getList = async () => {
  loading.value = true
  try {
    const data = await RecordApi.getPointRecordPage(queryParams)
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

onMounted(() => {
  getList()
})
</script>
