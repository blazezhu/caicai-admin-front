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
      <el-table-column align="center" label="图标" prop="icon" width="80">
        <template #default="scope">
          <span v-if="scope.row.icon" class="icon-emoji">{{ scope.row.icon }}</span>
        </template>
      </el-table-column>
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
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入类别名称" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <div class="icon-field">
          <div class="icon-input-row">
            <div class="icon-preview-box" :class="{ 'is-empty': !formData.icon }">
              <span v-if="formData.icon" class="preview-emoji">{{ formData.icon }}</span>
              <span v-else class="preview-placeholder">-</span>
            </div>
            <el-input v-model="formData.icon" placeholder="粘贴 Emoji 或手动输入" clearable style="flex: 1"
              @input="onIconInput" />
            <el-button type="primary" plain @click="showIconPicker = true">
              <Icon icon="ep:search" class="mr-2px" />选择图标
            </el-button>
          </div>
        </div>
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

  <!-- Emoji 图标选择弹窗 -->
  <el-dialog v-model="showIconPicker" title="选择图标（Emoji）" width="500px" destroy-on-close append-to-body>
    <div class="emoji-picker">
      <!-- 收入类别 -->
      <div class="emoji-group-title">
        <span class="income-dot"></span>
        收入类别
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">学习成长</div>
        <div class="emoji-grid">
          <span v-for="e in studyEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">运动健康</div>
        <div class="emoji-grid">
          <span v-for="e in sportEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">生活习惯</div>
        <div class="emoji-grid">
          <span v-for="e in habitEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">家庭贡献</div>
        <div class="emoji-grid">
          <span v-for="e in familyEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">特殊奖励</div>
        <div class="emoji-grid">
          <span v-for="e in rewardEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>

      <!-- 支出类别 -->
      <div class="emoji-group-title" style="margin-top: 20px">
        <span class="expense-dot"></span>
        支出类别
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">零食饮料</div>
        <div class="emoji-grid">
          <span v-for="e in snackEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">娱乐活动</div>
        <div class="emoji-grid">
          <span v-for="e in entertainmentEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">玩具文具</div>
        <div class="emoji-grid">
          <span v-for="e in toyEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">虚拟特权</div>
        <div class="emoji-grid">
          <span v-for="e in vipEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">大额愿望池</div>
        <div class="emoji-grid">
          <span v-for="e in wishEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
      <div class="emoji-section">
        <div class="emoji-section-title">行为扣除</div>
        <div class="emoji-grid">
          <span v-for="e in deductEmojis" :key="e" class="emoji-item" :class="{ selected: formData.icon === e }"
            @click="selectIcon(e)">{{ e }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import * as CategoryApi from '@/api/kids/category'
import type { CategoryVO } from '@/api/kids/category'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'KidsCategory' })

const loading = ref(true)
const list = ref<CategoryVO[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref()
const showIconPicker = ref(false)

// ============ 收入类别 Emoji ============
// 学习成长
const studyEmojis = [
  '📚', '📖', '📝', '✏️', '🎓', '🏫', '🔬', '🔭',
  '🧮', '🧪', '🧬', '🔬', '📐', '📏', '🖊️', '🖋️',
  '🎒', '🎒', '📜', '💻', '🖥️', '⌨️', '🖱️', '🖨️',
  '🌐', '📡', '🔍', '🔎', '📓', '📔', '📒', '📕',
]
// 运动健康
const sportEmojis = [
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏓', '🏸', '🏌️',
  '⛳', '🎣', '🚴', '🏃', '🧗', '🏊', '🤸', '🏋️',
  '🧘', '🧠', '💪', '🏅', '🎖️', '🏆', '🥇', '🥈',
  '🥉', '🎽', '🧤', '🎿', '⛷️', '🏂', '🛹', '🎳',
]
// 生活习惯
const habitEmojis = [
  '🧹', '🧺', '🧼', '🚿', '🪥', '🧽', '🪒', '💆',
  '🧴', '🧷', '🧺', '🧻', '🪣', '🧸', '🛏️', '🛌',
  '🌙', '🌞', '⏰', '🕐', '🕑', '🕒', '🕓', '🕕',
  '📅', '🗓️', '🗒️', '✅', '☑️', '✔️', '🔔', '🛎️',
]
// 家庭贡献
const familyEmojis = [
  '🍳', '🥗', '🍲', '🧁', '🍰', '🥧', '🧁', '🍳',
  '🧹', '🪥', '🧻', '🧺', '👕', '👗', '🧦', '👟',
  '🌱', '🌻', '🌷', '🌹', '🌺', '🪴', '🌿', '🍀',
  '🐕', '🐈', '🐹', '🐰', '🐠', '🦜', '🐾', '🏠',
]
// 特殊奖励
const rewardEmojis = [
  '🌟', '💫', '✨', '🎁', '🎀', '🎊', '🎉', '🎈',
  '🏆', '🥇', '🏅', '🎖️', '💎', '💰', '🪙', '🪙',
  '🎯', '🎲', '🎰', '🃏', '♠️', '♥️', '♦️', '♣️',
  '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎹', '🎺',
]

// ============ 支出类别 Emoji ============
// 零食饮料
const snackEmojis = [
  '🍔', '🍟', '🍕', '🌭', '🍗', '🍖', '🍤', '🍜',
  '🍝', '🍛', '🍣', '🍱', '🍙', '🍘', '🍥', '🍢',
  '🍡', '🍦', '🍧', '🍨', '🍩', '🍪', '🍰', '🎂',
  '🍫', '🍬', '🍭', '🍿', '🍮', '🍯', '🧁', '🥧',
  '🥤', '🧃', '🥛', '🍼', '☕', '🍵', '🧋', '🧃',
  '🧁', '🥤', '🧋', '🍹', '🍷', '🍸', '🍺', '🍻',
]
// 娱乐活动
const entertainmentEmojis = [
  '🎮', '🎲', '🧩', '🎯', '🎳', '🏓', '🎱', '🎮',
  '🎧', '🎵', '🎶', '🎤', '🎧', '🎷', '🎸', '🎹',
  '🎺', '🎻', '🪘', '🥁', '🎬', '🎥', '🎞️', '📽️',
  '🎭', '🎪', '🎨', '🎯', '🎰', '🎡', '🎢', '🎠',
  '🎡', '🎢', '🎠', '🛝', '🛼', '🛹', '🛼', '🎿',
]
// 玩具文具
const toyEmojis = [
  '🎁', '🎀', '🎈', '🎊', '🎉', '🎃', '🎄', '🎋',
  '🎍', '🎎', '🎏', '🎐', '🪅', '🪆', '🧧', '🎎',
  '✂️', '📐', '📏', '✏️', '🖊️', '🖋️', '🖌️', '🖍️',
  '📎', '📌', '📍', '📏', '✂️', '🔍', '📚', '📖',
  '🎒', '🧸', '🪀', '🪁', '🎾', '⚽', '🏀', '🎳',
]
// 虚拟特权
const vipEmojis = [
  '👑', '💎', '🪙', '💰', '💵', '💴', '💶', '💷',
  '🪙', '💳', '💳', '🪪', '🎫', '🎟️', '🎫', '🪪',
  '📱', '💻', '🖥️', '⌚', '⌚', '⌨️', '🖱️', '🖨️',
  '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦',
  '📺', '📻', '🎮', '🕹️', '🎮', '🕹️', '🎧', '🎮',
]
// 大额愿望池
const wishEmojis = [
  '🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻',
  '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘',
  '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨',
  '🎁', '🎀', '💝', '💖', '💗', '💓', '💞', '💕',
  '✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛳️',
]
// 行为扣除
const deductEmojis = [
  '❌', '❌', '❎', '⛔', '🚫', '⛔', '🛑', '📛',
  '💔', '❤️‍🩹', '💔', '💔', '🔇', '🔕', '📵', '🚭',
  '😠', '😡', '😤', '🙁', '😞', '😔', '😢', '😭',
  '😱', '😨', '😰', '😥', '😓', '🤯', '😵', '💀',
  '⚠️', '⚡', '🔥', '💣', '☠️', '💀', '👎', '👎',
]

const formData = reactive<{
  id?: number
  name: string
  icon: string
  direction?: number
  isSystem: number
  sort: number
}>({
  id: undefined,
  name: '',
  icon: '',
  direction: undefined,
  isSystem: 0,
  sort: 0
})
const formRules = {
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
  direction: [{ required: true, message: '请选择方向', trigger: 'change' }],
  isSystem: [{ required: true, message: '请选择是否系统预设', trigger: 'change' }]
}

// Emoji 输入时截取第一个字符（支持粘贴多个）
const onIconInput = () => {
  if (formData.icon.length > 2) {
    formData.icon = formData.icon.charAt(0)
  }
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
  Object.assign(formData, {
    id: undefined,
    name: '',
    icon: '',
    direction: undefined,
    isSystem: 0,
    sort: 0
  })
  dialogVisible.value = true
}

const handleEdit = (row: CategoryVO) => {
  dialogTitle.value = '编辑类别'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    icon: row.icon || '',
    direction: row.direction,
    isSystem: row.isSystem,
    sort: row.sort ?? 0
  })
  dialogVisible.value = true
}

const selectIcon = (emoji: string) => {
  formData.icon = emoji
  showIconPicker.value = false
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (formData.id) {
      await CategoryApi.updateCategory({
        id: formData.id,
        name: formData.name,
        icon: formData.icon || undefined,
        direction: formData.direction!,
        sort: formData.sort
      })
      ElMessage.success('更新成功')
    } else {
      await CategoryApi.createCategory({
        name: formData.name,
        icon: formData.icon || undefined,
        direction: formData.direction!,
        isSystem: formData.isSystem,
        sort: formData.sort
      })
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

<style lang="scss" scoped>
.icon-emoji {
  font-size: 24px;
}

.icon-field {
  width: 100%;
}

.icon-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-preview-box {
  width: 52px;
  height: 52px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  font-size: 28px;
  cursor: default;
  flex-shrink: 0;
}

.icon-preview-box.is-empty {
  font-size: 12px;
  color: #c0c4cc;
}

.preview-placeholder {
  font-size: 12px;
  color: #c0c4cc;
}

.icon-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.emoji-picker {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.emoji-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.income-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;
  flex-shrink: 0;
}

.expense-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  flex-shrink: 0;
}

.emoji-section {
  margin-bottom: 14px;
}

.emoji-section-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  font-weight: 500;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
}

.emoji-item {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
  user-select: none;
}

.emoji-item:hover {
  background: #fff1ed;
  transform: scale(1.08);
}

.emoji-item.selected {
  background: #ff8c61;
  border-color: #ff8c61;
}

.emoji-item:active {
  transform: scale(0.95);
}
</style>
