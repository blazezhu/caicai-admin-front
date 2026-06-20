// 儿童大屏独立应用 - 轻量版，不依赖管理后台框架
try {
const { createApp, ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue

const API_BASE = window.location.origin
// 自动检测 API 地址：优先用环境变量，否则用当前域名
const APP_API_BASE = window.DASHBOARD_API_BASE || API_BASE

// API 请求封装
async function apiGet(path, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${APP_API_BASE}/app-api${path}${query ? '?' + query : ''}`
  const res = await fetch(url, {
    headers: { 'tenant-id': '1' }
  })
  const data = await res.json()
  if (data.code !== 0 && data.code !== 200) throw new Error(data.msg || '请求失败')
  return data.data
}

async function apiPost(path, params = {}) {
  const url = `${APP_API_BASE}/app-api${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'tenant-id': '1' },
    body: JSON.stringify(params)
  })
  const data = await res.json()
  if (data.code !== 0 && data.code !== 200) throw new Error(data.msg || '请求失败')
  return data.data
}

const app = createApp({
  setup() {
    // === 状态 ===
    const pageLoading = ref(true)
    const isValidated = ref(false)
    const validating = ref(false)
    const validateError = ref('')
    const code = ref('')
    const bookId = ref(null)
    const ownerUserId = ref(null)
    const currentUserId = ref(null)
    const nickname = ref('')
    const refreshing = ref(false)

    // 数据
    const summary = ref({})
    const wishes = ref([])
    const planStatus = ref({ todayTotal: 0, todayCompleted: 0, todayRate: 0, weekCompleted: 0, weekTotal: 0, weekRate: 0, pendingToday: [], todayPlans: [] })
    const achievements = ref([])
    const encouragement = ref({ message: '', emoji: '', type: '' })

    // === 访问码验证 ===
    async function handleValidate() {
      if (!code.value || code.value.length !== 6) {
        validateError.value = '请输入6位访问码'
        return
      }
      validating.value = true
      validateError.value = ''
      pageLoading.value = false
      try {
        const result = await apiGet('/kids/dashboard/access-code/validate', { code: code.value })
        if (result.valid) {
          bookId.value = result.bookId
          ownerUserId.value = result.ownerUserId
          currentUserId.value = result.userId
          nickname.value = result.nickname || ''
          isValidated.value = true
          await loadData()
        } else {
          validateError.value = result.message || '访问码无效'
        }
      } catch (e) {
        validateError.value = e.message || '验证失败'
      } finally {
        validating.value = false
      }
    }

    // === 加载数据 ===
    async function loadData() {
      if (!bookId.value) return
      pageLoading.value = true
      try {
        const [s, w, p, a, e] = await Promise.all([
          apiGet('/kids/dashboard/summary', { bookId: bookId.value, userId: ownerUserId.value }),
          apiGet('/kids/dashboard/wish-progress', { bookId: bookId.value, userId: ownerUserId.value }),
          apiGet('/kids/dashboard/plan-status', { bookId: bookId.value, userId: ownerUserId.value }),
          apiGet('/kids/dashboard/achievements', { bookId: bookId.value, userId: ownerUserId.value }),
          apiGet('/kids/dashboard/encouragement', { bookId: bookId.value, userId: ownerUserId.value }),
        ])
        summary.value = s
        wishes.value = w
        planStatus.value = p
        achievements.value = a
        encouragement.value = e
      } catch (e) {
        console.error('加载数据失败', e)
      } finally {
        pageLoading.value = false
      }
    }

    async function handleRefresh() {
      refreshing.value = true
      await loadData()
      refreshing.value = false
    }

    // === 计划操作 ===
    async function handleCompleteAction(instanceId, actionId) {
      try {
        await apiPost('/kids/dashboard/complete-action', { instanceId, actionId, ownerUserId: ownerUserId.value })
        await loadData()
      } catch (e) {
        ElementPlus.ElMessage.error(e.message || '操作失败')
      }
    }

    async function handleUndoAction(instanceId, actionId) {
      try {
        await apiPost('/kids/dashboard/undo-action', { instanceId, actionId, ownerUserId: ownerUserId.value })
        await loadData()
      } catch (e) {
        ElementPlus.ElMessage.error(e.message || '撤销失败')
      }
    }

    // === 初始化 ===
    onMounted(() => {
      // 从 URL 参数获取访问码
      const params = new URLSearchParams(window.location.search)
      const urlCode = params.get('code')
      if (urlCode) {
        code.value = urlCode.toUpperCase()
        handleValidate()
      } else {
        pageLoading.value = false
      }
    })

    return {
      pageLoading, isValidated, validating, validateError, code,
      summary, wishes, planStatus, achievements, encouragement,
      nickname, refreshing,
      handleValidate, handleRefresh, handleCompleteAction, handleUndoAction,
    }
  }
})

app.use(ElementPlus, { locale: ElementPlusLocaleZhCn })
app.mount('#app')

} catch (e) {
  console.error('大屏初始化失败:', e)
  document.getElementById('app').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:#fff;text-align:center;padding:40px"><p style="font-size:18px;margin-bottom:12px">大屏加载失败</p><p style="font-size:14px;opacity:0.7">' + (e.message || '未知错误') + '</p><p style="font-size:13px;opacity:0.5;margin-top:16px">请刷新页面重试</p></div>'
}
