<template>
  <ContentWrap>
    <el-form
      ref="formRef"
      :model="formData"
      label-width="150px"
      v-loading="formLoading"
    >
      <!-- 运营模式配置 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>运营模式配置</span>
          </div>
        </template>

        <el-form-item label="运营模式">
          <el-radio-group v-model="operationMode">
            <el-radio value="internal_test">内测</el-radio>
            <el-radio value="public_test">公测</el-radio>
            <el-radio value="official">正式上线</el-radio>
          </el-radio-group>
          <el-text class="w-full" size="small" type="info">
            内测模式限制注册人数；公测和正式上线无限制
          </el-text>
        </el-form-item>

        <el-form-item v-if="operationMode === 'internal_test'" label="最大注册人数">
          <el-input-number v-model="internalTestLimit" :min="1" :max="99999" />
          <el-text class="w-full" size="small" type="info">
            超过此人数后新用户无法注册，已有用户不受影响
          </el-text>
        </el-form-item>
      </el-card>

      <!-- 邀请推广和广告配置（仅公测/正式上线显示） -->
      <el-card v-if="operationMode !== 'internal_test'" shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>功能开关</span>
          </div>
        </template>

        <el-form-item label="邀请推广">
          <el-switch v-model="referralEnabled" active-text="开启" inactive-text="关闭" />
        </el-form-item>

        <el-form-item label="广告功能">
          <el-switch v-model="adEnabled" active-text="开启" inactive-text="关闭" />
        </el-form-item>
      </el-card>

      <!-- 用户协议 -->
      <el-card shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>用户协议</span>
          </div>
        </template>

        <el-form-item label="协议内容">
          <div class="editor-container">
            <Editor v-model="termsContent" :editor-config="editorConfig" style="height: 400px" />
          </div>
        </el-form-item>
      </el-card>

      <!-- 隐私政策 -->
      <el-card shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>隐私政策</span>
          </div>
        </template>

        <el-form-item label="政策内容">
          <div class="editor-container">
            <Editor v-model="privacyContent" :editor-config="editorConfig" style="height: 400px" />
          </div>
        </el-form-item>
      </el-card>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ConfigApi from '@/api/kids/config'
import { Editor } from '@/components/Editor'
import { createEditorConfig } from '@/views/mp/draft/editor-config'

defineOptions({ name: 'KidsConfig' })

const formLoading = ref(false)
const operationMode = ref('internal_test')
const internalTestLimit = ref(90)
const adEnabled = ref(true)
const referralEnabled = ref(false)
const termsContent = ref('')
const privacyContent = ref('')
const formRef = ref()

const editorConfig = createEditorConfig()

/** 加载所有配置 */
const loadAllConfig = async () => {
  formLoading.value = true
  try {
    const [adData, referralData, termsData, privacyData, systemData, limitData] = await Promise.all([
      ConfigApi.getAdConfig(),
      ConfigApi.getReferralConfig(),
      ConfigApi.getTermsConfig(),
      ConfigApi.getPrivacyConfig(),
      ConfigApi.getSystemConfig(),
      ConfigApi.getInternalTestLimit(),
    ])
    if (adData) adEnabled.value = adData.configValue === 'true'
    if (referralData) referralEnabled.value = referralData.configValue === 'true'
    if (termsData) termsContent.value = termsData.configValue || ''
    if (privacyData) privacyContent.value = privacyData.configValue || ''
    if (systemData) operationMode.value = systemData.configValue || 'internal_test'
    if (limitData) internalTestLimit.value = parseInt(limitData.configValue) || 90
  } finally {
    formLoading.value = false
  }
}

/** 保存配置 */
const onSubmit = async () => {
  formLoading.value = true
  try {
    await Promise.all([
      ConfigApi.saveSystemConfig({ configKey: 'operation_mode', configValue: operationMode.value, valueType: 'string' }),
      ConfigApi.saveSystemConfig({ configKey: 'internal_test_limit', configValue: String(internalTestLimit.value), valueType: 'number' }),
      ConfigApi.saveAdConfig({ configKey: 'ad_enabled', configValue: adEnabled.value ? 'true' : 'false', valueType: 'boolean' }),
      ConfigApi.saveReferralConfig({ configKey: 'referral_enabled', configValue: referralEnabled.value ? 'true' : 'false', valueType: 'boolean' }),
      ConfigApi.saveTermsConfig({ configKey: 'terms_of_service', configValue: termsContent.value, valueType: 'html' }),
      ConfigApi.savePrivacyConfig({ configKey: 'privacy_policy', configValue: privacyContent.value, valueType: 'html' }),
    ])
    ElMessage.success('保存成功')
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  loadAllConfig()
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

.mt-16px {
  margin-top: 16px;
}

.editor-container {
  width: 100%;
}
</style>
