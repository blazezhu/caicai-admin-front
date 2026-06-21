<template>
  <ContentWrap>
    <el-form
      ref="formRef"
      :model="formData"
      label-width="150px"
      v-loading="formLoading"
    >
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>广告功能配置</span>
          </div>
        </template>

        <el-form-item label="广告功能开关">
          <el-switch
            v-model="adEnabled"
            active-text="开启广告"
            inactive-text="免广告（关闭）"
          />
          <el-text class="w-full" size="small" type="info">
            开启后向用户展示广告；关闭后所有用户都享受免广告体验
          </el-text>
        </el-form-item>
      </el-card>

      <el-card shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>邀请推广配置</span>
          </div>
        </template>

        <el-form-item label="邀请功能开关">
          <el-switch
            v-model="referralEnabled"
            active-text="开启邀请"
            inactive-text="关闭邀请"
          />
          <el-text class="w-full" size="small" type="info">
            开启后小程序"我的"页面显示"邀请好友"按钮；关闭后隐藏该按钮
          </el-text>
        </el-form-item>
      </el-card>

      <el-card shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>用户协议</span>
          </div>
        </template>

        <el-form-item label="协议内容">
          <div class="editor-container">
            <Editor
              v-model="termsContent"
              :editor-config="editorConfig"
              style="height: 400px"
            />
          </div>
        </el-form-item>
      </el-card>

      <el-card shadow="never" class="mt-16px">
        <template #header>
          <div class="card-header">
            <span>隐私政策</span>
          </div>
        </template>

        <el-form-item label="政策内容">
          <div class="editor-container">
            <Editor
              v-model="privacyContent"
              :editor-config="editorConfig"
              style="height: 400px"
            />
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
import { ref, reactive, onBeforeUnmount, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ConfigApi from '@/api/kids/config'
import { Editor } from '@/components/Editor'
import { createEditorConfig } from '@/views/mp/draft/editor-config'

defineOptions({ name: 'KidsConfig' })

const formLoading = ref(false)
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
    const [adData, referralData, termsData, privacyData] = await Promise.all([
      ConfigApi.getAdConfig(),
      ConfigApi.getReferralConfig(),
      ConfigApi.getTermsConfig(),
      ConfigApi.getPrivacyConfig(),
    ])
    if (adData) adEnabled.value = adData.configValue === 'true'
    if (referralData) referralEnabled.value = referralData.configValue === 'true'
    if (termsData) termsContent.value = termsData.configValue || ''
    if (privacyData) privacyContent.value = privacyData.configValue || ''
  } finally {
    formLoading.value = false
  }
}

/** 保存配置 */
const onSubmit = async () => {
  formLoading.value = true
  try {
    await Promise.all([
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
