<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    destroy-on-close
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="计划名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入计划名称" />
      </el-form-item>

      <el-form-item label="计划描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入计划描述" />
      </el-form-item>

      <el-form-item label="执行频率" prop="frequencyType">
        <el-radio-group v-model="formData.frequencyType">
          <el-radio :label="1">每日</el-radio>
          <el-radio :label="2">每周</el-radio>
          <el-radio :label="3">每月</el-radio>
          <el-radio :label="4">每年</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="可见性" prop="visibility">
        <el-radio-group v-model="formData.visibility">
          <el-radio :label="1">公开（可被其他用户引入）</el-radio>
          <el-radio :label="2">私有（仅自己可用）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否启用" prop="isActive">
        <el-radio-group v-model="formData.isActive">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否系统预设" prop="isSystem">
        <el-radio-group v-model="formData.isSystem">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 动作列表 -->
      <el-form-item label="计划动作">
        <div class="action-list">
          <div v-for="(action, index) in formData.actions" :key="index" class="action-item">
            <div class="action-header">
              <span>动作 {{ index + 1 }}</span>
              <el-button link type="danger" @click="removeAction(index)">删除</el-button>
            </div>

            <div class="inner-form">
              <div class="form-row">
                <label class="form-label">动作名称</label>
                <el-form-item :prop="`actions.${index}.actionName`" :rules="{ required: true, message: '请输入动作名称', trigger: 'blur' }" class="form-field">
                  <el-input v-model="action.actionName" placeholder="如：按时睡觉" />
                </el-form-item>
              </div>

              <div class="form-row">
                <label class="form-label">关联类别</label>
                <el-form-item :prop="`actions.${index}.categoryId`" class="form-field">
                  <el-select v-model="action.categoryId" placeholder="请选择类别" class="!w-full">
                    <el-option
                      v-for="cat in categoryList"
                      :key="cat.id"
                      :label="cat.name"
                      :value="cat.id"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="form-row-inline">
                <div class="form-row">
                  <label class="form-label">完成积分</label>
                  <el-form-item :prop="`actions.${index}.pointOnComplete`" class="form-field compact">
                    <el-input-number v-model="action.pointOnComplete" :min="-999" :max="999" />
                  </el-form-item>
                </div>

                <div class="form-row">
                  <label class="form-label">未完成积分</label>
                  <el-form-item :prop="`actions.${index}.pointOnIncomplete`" class="form-field compact">
                    <el-input-number v-model="action.pointOnIncomplete" :min="-999" :max="999" />
                  </el-form-item>
                </div>
              </div>

              <div class="form-row">
                <label class="form-label">启用分支</label>
                <el-form-item class="form-field">
                  <el-switch v-model="action.hasBranch" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </div>

              <div v-if="action.hasBranch === 1" class="branch-section">
                <div class="branch-header">
                  <span>分支配置</span>
                  <el-button size="small" type="primary" plain @click="addBranch(index)">
                    <Icon class="mr-5px" icon="ep:plus" />添加分支
                  </el-button>
                </div>

                <div v-for="(branch, bIndex) in action.branches" :key="bIndex" class="branch-item">
                  <div class="form-row">
                    <label class="form-label">分支名称</label>
                    <el-form-item class="form-field">
                      <el-input v-model="branch.branchName" placeholder="如：9点前睡觉" />
                    </el-form-item>
                  </div>
                  <div class="form-row">
                    <label class="form-label">条件描述</label>
                    <el-form-item class="form-field">
                      <el-input v-model="branch.conditionDesc" placeholder="供用户参考的条件说明" />
                    </el-form-item>
                  </div>
                  <div class="form-row-inline">
                    <div class="form-row">
                      <label class="form-label">积分变化</label>
                      <el-form-item class="form-field compact">
                        <el-input-number v-model="branch.pointDelta" :min="-999" :max="999" />
                      </el-form-item>
                    </div>
                    <div class="form-row">
                      <label class="form-label">默认选项</label>
                      <el-form-item class="form-field compact">
                        <el-switch v-model="branch.isDefault" :active-value="1" :inactive-value="0" />
                      </el-form-item>
                    </div>
                  </div>
                  <el-button link type="danger" size="small" @click="removeBranch(index, bIndex)">删除分支</el-button>
                </div>
              </div>
            </div>
          </div>

          <el-button type="primary" plain @click="addAction">
            <Icon class="mr-5px" icon="ep:plus" />添加动作
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import * as PlanApi from '@/api/kids/plan'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String as () => 'create' | 'edit',
    default: 'create'
  },
  id: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const submitLoading = ref(false)
const categoryList = ref<any[]>([])

const dialogTitle = computed(() => props.type === 'create' ? '新增计划' : '编辑计划')

const formData = reactive({
  name: '',
  description: '',
  frequencyType: 1,
  visibility: 2,
  isActive: 1,
  isSystem: 0,
  actions: [] as any[]
})

const formRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  frequencyType: [{ required: true, message: '请选择执行频率', trigger: 'change' }]
}

// 添加动作
const addAction = () => {
  formData.actions.push({
    actionName: '',
    categoryId: categoryList.value[0]?.id,
    categoryName: categoryList.value[0]?.name,
    pointOnComplete: 5,
    pointOnIncomplete: 0,
    hasBranch: 0,
    branches: []
  })
}

// 删除动作
const removeAction = (index: number) => {
  formData.actions.splice(index, 1)
}

// 添加分支
const addBranch = (actionIndex: number) => {
  if (!formData.actions[actionIndex].branches) {
    formData.actions[actionIndex].branches = []
  }
  formData.actions[actionIndex].branches.push({
    branchName: '',
    conditionDesc: '',
    pointDelta: 0,
    isDefault: 0
  })
}

// 删除分支
const removeBranch = (actionIndex: number, branchIndex: number) => {
  formData.actions[actionIndex].branches.splice(branchIndex, 1)
}

// 获取类别列表
const getCategoryList = async () => {
  try {
    categoryList.value = await PlanApi.getCategoryList({})
  } catch (e) {
    console.error('获取类别列表失败', e)
  }
}

// 获取详情
const getDetail = async () => {
  if (!props.id) return
  try {
    const data = await PlanApi.getPlanDetail(props.id)
    Object.assign(formData, data)
  } catch (e) {
    console.error('获取详情失败', e)
  }
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    // 更新类别名称
    formData.actions.forEach(action => {
      const cat = categoryList.value.find(c => c.id === action.categoryId)
      action.categoryName = cat?.name || ''
    })

    if (props.type === 'create') {
      await PlanApi.createPlan(formData)
      ElMessage.success('创建成功')
    } else {
      await PlanApi.updatePlan({ ...formData, id: props.id })
      ElMessage.success('更新成功')
    }
    visible.value = false
    emit('success')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 监听visible变化
watch(visible, (val) => {
  if (val) {
    getCategoryList()
    if (props.type === 'edit' && props.id) {
      getDetail()
    } else {
      // 重置表单
      Object.assign(formData, {
        name: '',
        description: '',
        frequencyType: 1,
        visibility: 2,
        isActive: 1,
        isSystem: 0,
        actions: []
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.action-list {
  width: 100%;
}

.action-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.inner-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .form-label {
    width: 80px;
    flex-shrink: 0;
    font-size: 14px;
    color: #606266;
    text-align: right;
    padding-right: 12px;
  }

  .form-field {
    flex: 1;

    &.compact {
      flex: 0 0 auto;
    }
  }
}

.form-row-inline {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.branch-section {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.branch-item {
  background: #f9fafb;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}
</style>
