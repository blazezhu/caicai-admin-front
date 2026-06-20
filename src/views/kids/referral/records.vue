<template>
  <ContentWrap>
    <div class="mb-15px flex flex-wrap gap-15px items-center">
      <el-button type="primary" plain @click="getList">
        <Icon class="mr-5px" icon="ep:refresh" />
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="邀请人ID" prop="inviterId" width="120" />
      <el-table-column align="center" label="被邀请人ID" prop="inviteeId" width="120" />
      <el-table-column align="center" label="奖励天数" prop="bonusDays" width="120">
        <template #default="scope">
          <el-tag type="success">+{{ scope.row.bonusDays }}天</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
    </el-table>

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
</template>

<script lang="ts" setup>
import * as ReferralApi from '@/api/kids/referral'
import type { ReferralRecordVO } from '@/api/kids/referral'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'KidsReferralRecords' })

const loading = ref(true)
const list = ref<ReferralRecordVO[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

const getList = async () => {
  loading.value = true
  try {
    const result = await ReferralApi.getReferralRecordPage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
