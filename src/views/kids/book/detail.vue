<template>
  <ContentWrap>
    <div class="mb-20px">
      <el-button @click="handleBack">
        <Icon class="mr-5px" icon="ep:arrow-left" />
        返回
      </el-button>
    </div>

    <!-- 账本基本信息 -->
    <el-descriptions v-if="book" :column="2" border label-class-name="desc-label" title="账本信息">
      <el-descriptions-item label="账本ID">{{ book.id }}</el-descriptions-item>
      <el-descriptions-item label="账本名称">{{ book.name }}</el-descriptions-item>
      <el-descriptions-item label="积分类型">{{ pointTypeLabel(book.pointType) }}</el-descriptions-item>
      <el-descriptions-item label="积分单位">{{ book.pointUnit || '-' }}</el-descriptions-item>
      <el-descriptions-item label="总收入">{{ book.totalIncome }}</el-descriptions-item>
      <el-descriptions-item label="总支出">{{ book.totalExpense }}</el-descriptions-item>
      <el-descriptions-item label="当前余额">{{ book.currentBalance }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="book.status === 1" type="success">正常</el-tag>
        <el-tag v-else type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="所有者用户ID">{{ book.ownerUserId }}</el-descriptions-item>
      <el-descriptions-item label="描述">{{ book.description || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 最近积分记录 -->
    <div class="mt-20px">
      <div class="mb-10px font-bold">最近积分记录</div>
      <el-table v-loading="recordLoading" :data="recordList" :stripe="true" :show-overflow-tooltip="true">
        <el-table-column align="center" label="编号" prop="id" width="80" />
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
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as BookApi from '@/api/kids/book'
import * as RecordApi from '@/api/kids/record'
import { useRouter, useRoute } from 'vue-router'

defineOptions({ name: 'KidsBookDetail' })

const router = useRouter()
const route = useRoute()

const book = ref<BookApi.AccountBookVO | null>(null)
const recordLoading = ref(false)
const recordList = ref([])

const pointTypeLabel = (type: number) => {
  const map: Record<number, string> = { 1: '小红花', 2: '星星', 3: '积分', 4: '自定义' }
  return map[type] ?? '未知'
}

const sourceLabel = (source: number) => {
  const map: Record<number, string> = { 1: '手动', 2: '模板', 3: 'AI' }
  return map[source] ?? '未知'
}

const handleBack = () => {
  router.back()
}

const getBook = async (id: number) => {
  book.value = await BookApi.getAccountBook(id)
}

const getRecords = async (id: number) => {
  recordLoading.value = true
  try {
    const data = await RecordApi.getPointRecordPage({ pageNo: 1, pageSize: 20, bookId: id })
    recordList.value = data.list
  } finally {
    recordLoading.value = false
  }
}

onMounted(async () => {
  const id = Number(route.query.id)
  if (!id) return
  await getBook(id)
  await getRecords(id)
})
</script>
