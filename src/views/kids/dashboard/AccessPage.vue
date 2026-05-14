<template>
  <ContentWrap>
    <div class="access-container">
      <el-card class="access-card">
        <template #header>
          <div class="card-header">
            <Icon class="mr-10px" icon="ep:tickets" size="24" />
            <span>儿童大屏 - 生成访问码</span>
          </div>
        </template>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="选择账本" prop="bookId">
            <el-select
              v-model="form.bookId"
              placeholder="请选择要查看的账本"
              class="!w-full"
              filterable
            >
              <el-option
                v-for="book in bookList"
                :key="book.id"
                :label="book.name"
                :value="book.id"
              >
                <div class="book-option">
                  <span>{{ book.name }}</span>
                  <span class="book-balance">{{ book.currentBalance }} {{ pointTypeLabel(book.pointType, book.pointUnit) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="过期时间" prop="expireMinutes">
            <el-select v-model="form.expireMinutes" placeholder="选择访问码有效期" class="!w-full">
              <el-option :value="30" label="30分钟" />
              <el-option :value="60" label="1小时" />
              <el-option :value="120" label="2小时" />
              <el-option :value="360" label="6小时" />
              <el-option :value="1440" label="24小时" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="generating" @click="handleGenerate">
              <Icon class="mr-5px" icon="ep:magic-stick" />
              生成访问码
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 访问码展示 -->
        <div v-if="accessCode" class="code-display">
          <el-divider content-position="center">访问码</el-divider>
          <div class="code-box">
            <div class="code-value">{{ accessCode.code }}</div>
            <div class="code-info">
              <p>有效期至：{{ formatDateTime(accessCode.expiredTime) }}</p>
              <p>请将此访问码告诉孩子，让孩子在大屏页面输入</p>
            </div>
            <div class="code-actions">
              <el-button type="primary" @click="handleCopy">
                <Icon class="mr-5px" icon="ep:document-copy" />
                复制访问码
              </el-button>
              <el-button @click="handleCopyUrl">
                <Icon class="mr-5px" icon="ep:link" />
                复制链接
              </el-button>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <el-divider content-position="center">使用说明</el-divider>
        <div class="usage-guide">
          <el-steps direction="vertical" :space="60" :active="3">
            <el-step title="步骤1" description="在管理后台选择孩子的账本，生成访问码" />
            <el-step title="步骤2" description="将访问码告诉孩子（或复制链接）" />
            <el-step title="步骤3" description="孩子在大屏页面输入访问码" />
            <el-step title="步骤4" description="查看自己的积分、愿望、计划完成情况" />
          </el-steps>
        </div>
      </el-card>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import * as BookApi from '@/api/kids/book'
import * as DashboardApi from '@/api/kids/dashboard'

defineOptions({ name: 'KidsDashboardAccess' })

const loading = ref(false)
const generating = ref(false)
const bookList = ref<BookApi.AccountBookVO[]>([])
const accessCode = ref<DashboardApi.AccessCodeResp | null>(null)

const formRef = ref()
const form = reactive({
  bookId: undefined as number | undefined,
  expireMinutes: 60
})

const rules = {
  bookId: [{ required: true, message: '请选择账本', trigger: 'change' }]
}

const pointTypeLabel = (type: number, unit?: string) => {
  const map: Record<number, string> = { 1: '小红花', 2: '星星', 3: '积分', 4: '' }
  if (type === 4 && unit) return unit
  return map[type] ?? '积分'
}

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadBooks = async () => {
  loading.value = true
  try {
    const data = await BookApi.getAccountBookPage({
      pageNo: 1,
      pageSize: 100
    })
    bookList.value = data.list || []
  } catch (e) {
    console.error('加载账本列表失败', e)
  } finally {
    loading.value = false
  }
}

const handleGenerate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  generating.value = true
  try {
    const data = await DashboardApi.generateAccessCode({
      bookId: form.bookId!,
      expireMinutes: form.expireMinutes
    })
    accessCode.value = data
    ElMessage.success('访问码生成成功')
  } catch (e) {
    console.error('生成访问码失败', e)
    ElMessage.error('生成访问码失败')
  } finally {
    generating.value = false
  }
}

const handleCopy = async () => {
  if (!accessCode.value) return
  try {
    await navigator.clipboard.writeText(accessCode.value.code)
    ElMessage.success('访问码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleCopyUrl = async () => {
  if (!accessCode.value) return
  try {
    await navigator.clipboard.writeText(accessCode.value.h5Link)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

onMounted(() => {
  loadBooks()
})
</script>

<style lang="scss" scoped>
.access-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.access-card {
  .card-header {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
  }
}

.book-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .book-balance {
    color: #909399;
    font-size: 12px;
  }
}

.code-display {
  margin-top: 20px;
}

.code-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: #fff;

  .code-value {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: 8px;
    font-family: 'Courier New', monospace;
    margin-bottom: 15px;
  }

  .code-info {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 20px;

    p {
      margin: 5px 0;
    }
  }

  .code-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}

.usage-guide {
  padding: 10px 0;
}
</style>
