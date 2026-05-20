<template>
  <ContentWrap>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      v-loading="formLoading"
    >
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>广告功能配置</span>
          </div>
        </template>

        <el-form-item label="广告功能开关" prop="configValue">
          <el-switch
            v-model="adEnabled"
            active-text="开启广告"
            inactive-text="免广告（关闭）"
            @change="handleAdSwitchChange"
          />
          <el-text class="w-full" size="small" type="info">
            开启后向用户展示广告；关闭后所有用户都享受免广告体验（类似自动会员）
          </el-text>
        </el-form-item>

        <el-form-item label="当前状态">
          <el-tag :type="adEnabled ? 'success' : 'warning'" size="large">
            {{ adEnabled ? '广告功能已开启' : '免广告模式已开启' }}
          </el-tag>
        </el-form-item>
      </el-card>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ConfigApi from '@/api/kids/config'

defineOptions({ name: 'KidsConfig' })

const formLoading = ref(false)
const formData = ref({
  configKey: 'ad_enabled',
  configValue: 'true',
  valueType: 'boolean',
  remark: ''
})
const adEnabled = ref(true)
const formRef = ref()

const formRules = reactive({})

/** 获取广告配置 */
const getConfig = async () => {
  formLoading.value = true
  try {
    const data = await ConfigApi.getAdConfig()
    if (data) {
      formData.value = data
      adEnabled.value = data.configValue === 'true'
    }
  } finally {
    formLoading.value = false
  }
}

/** 保存广告配置 */
const onSubmit = async () => {
  formLoading.value = true
  try {
    await ConfigApi.saveAdConfig({
      configKey: formData.value.configKey,
      configValue: adEnabled.value ? 'true' : 'false',
      valueType: 'boolean',
      remark: formData.value.remark
    })
    ElMessage.success('保存成功')
  } finally {
    formLoading.value = false
  }
}

/** 广告开关变化时更新配置值 */
const handleAdSwitchChange = (value: boolean) => {
  formData.value.configValue = value ? 'true' : 'false'
}

onMounted(() => {
  getConfig()
})
</script>

<style scoped>
.card-header {
  font-weight: bold;
  font-size: 16px;
}

.w-full {
  display: block;
  margin-top: 8px;
}
</style>
