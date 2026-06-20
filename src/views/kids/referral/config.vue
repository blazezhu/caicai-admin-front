<template>
  <ContentWrap>
    <div class="mb-15px flex flex-wrap gap-15px items-center">
      <el-button type="primary" plain @click="handleCreate">
        <Icon class="mr-5px" icon="ep:plus" />
        新增配置
      </el-button>
      <el-button type="primary" plain @click="getList">
        <Icon class="mr-5px" icon="ep:refresh" />
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column align="center" label="档位" prop="tier" width="100" />
      <el-table-column align="center" label="邀请人数要求" prop="requiredCount" width="140" />
      <el-table-column align="center" label="奖励天数" prop="bonusDays" width="120" />
      <el-table-column align="left" label="备注" prop="remark" min-width="200" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="160" />
      <el-table-column align="center" label="操作" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
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

  <!-- 新增/编辑弹窗 -->
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="500px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="档位" prop="tier">
        <el-input-number v-model="form.tier" :min="1" :max="99" />
      </el-form-item>
      <el-form-item label="邀请人数" prop="requiredCount">
        <el-input-number v-model="form.requiredCount" :min="1" :max="999" />
      </el-form-item>
      <el-form-item label="奖励天数" prop="bonusDays">
        <el-input-number v-model="form.bonusDays" :min="1" :max="9999" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" :maxlength="255" placeholder="可选" />
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
import * as ReferralApi from '@/api/kids/referral'
import type { ReferralConfigVO } from '@/api/kids/referral'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'KidsReferralConfig' })

const loading = ref(true)
const list = ref<ReferralConfigVO[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: undefined as number | undefined,
  tier: 1,
  requiredCount: 1,
  bonusDays: 30,
  remark: '',
})

const rules = {
  tier: [{ required: true, message: '请输入档位', trigger: 'blur' }],
  requiredCount: [{ required: true, message: '请输入邀请人数', trigger: 'blur' }],
  bonusDays: [{ required: true, message: '请输入奖励天数', trigger: 'blur' }],
}

const getList = async () => {
  loading.value = true
  try {
    const result = await ReferralApi.getReferralConfigPage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.tier = (list.value.length || 0) + 1
  form.requiredCount = 1
  form.bonusDays = 30
  form.remark = ''
}

const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: ReferralConfigVO) => {
  isEdit.value = true
  form.id = row.id
  form.tier = row.tier
  form.requiredCount = row.requiredCount
  form.bonusDays = row.bonusDays
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await ReferralApi.updateReferralConfig({
        id: form.id!,
        tier: form.tier,
        requiredCount: form.requiredCount,
        bonusDays: form.bonusDays,
        remark: form.remark || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await ReferralApi.createReferralConfig({
        tier: form.tier,
        requiredCount: form.requiredCount,
        bonusDays: form.bonusDays,
        remark: form.remark || undefined,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该配置？', '提示', { type: 'warning' })
    await ReferralApi.deleteReferralConfig(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
