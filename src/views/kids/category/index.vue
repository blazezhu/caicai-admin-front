<template>
  <ContentWrap>
    <div class="mb-15px">
      <el-button type="primary" @click="handleCreate">
        <Icon class="mr-5px" icon="ep:plus" />
        新增类别
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="名称" prop="name" />
      <el-table-column align="center" label="方向" prop="direction" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.direction === 1" type="success">收入</el-tag>
          <el-tag v-else type="danger">支出</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否系统预设" prop="isSystem" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.isSystem === 1" type="warning">系统预设</el-tag>
          <el-tag v-else>用户自定义</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column align="center" label="操作" width="160">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入类别名称" />
      </el-form-item>
      <el-form-item label="方向" prop="direction">
        <el-select v-model="formData.direction" placeholder="请选择方向">
          <el-option label="收入" :value="1" />
          <el-option label="支出" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否系统预设" prop="isSystem">
        <el-select v-model="formData.isSystem" placeholder="请选择">
          <el-option label="系统预设" :value="1" />
          <el-option label="用户自定义" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" />
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
import * as CategoryApi from '@/api/kids/category'
import type { CategoryVO } from '@/api/kids/category'

defineOptions({ name: 'KidsCategory' })

const loading = ref(true)
const list = ref<CategoryVO[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref()
const formData = reactive<Partial<CategoryVO>>({
  id: undefined,
  name: '',
  direction: undefined,
  isSystem: 0,
  sort: 0
})
const formRules = {
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
  direction: [{ required: true, message: '请选择方向', trigger: 'change' }],
  isSystem: [{ required: true, message: '请选择是否系统预设', trigger: 'change' }]
}

const getList = async () => {
  loading.value = true
  try {
    list.value = await CategoryApi.getCategoryList()
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  dialogTitle.value = '新增类别'
  Object.assign(formData, { id: undefined, name: '', direction: undefined, isSystem: 0, sort: 0 })
  dialogVisible.value = true
}

const handleEdit = (row: CategoryVO) => {
  dialogTitle.value = '编辑类别'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (formData.id) {
      await CategoryApi.updateCategory(formData)
      ElMessage.success('更新成功')
    } else {
      await CategoryApi.createCategory(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该类别？', '提示', { type: 'warning' })
    await CategoryApi.deleteCategory(id)
    ElMessage.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
