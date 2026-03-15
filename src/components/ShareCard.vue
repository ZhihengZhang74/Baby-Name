<template>
  <section v-if="candidate" class="share-section">
    <div class="section-header">
      <div>
        <p class="eyebrow">Share</p>
        <h3>分享卡预览</h3>
      </div>
      <el-select v-model="template" style="width: 180px">
        <el-option label="传统雅致版" value="classic" />
        <el-option label="轻社交爆款版" value="social" />
      </el-select>
    </div>

    <div class="share-grid">
      <div class="share-preview" :class="template">
        <div class="preview-top">
          <span class="brand">千载吉名</span>
          <span class="route">{{ candidate.styleProfile }}</span>
        </div>
        <div class="preview-main">
          <p class="name">{{ candidate.name }}</p>
          <p class="summary">{{ candidate.plainSummary }}</p>
        </div>
        <div class="preview-footer">
          <span>现代感 {{ candidate.modernScore.toFixed(1) }}</span>
          <span>{{ footerText }}</span>
        </div>
      </div>

      <el-card class="copy-card">
        <div class="copy-block">
          <div class="copy-title">推荐分享文案</div>
          <p>{{ shareText }}</p>
        </div>
        <div class="copy-actions">
          <el-button class="ghost-btn" @click="copyShareText">复制文案</el-button>
          <el-button type="primary" @click="shareCard">系统分享</el-button>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  candidate: {
    type: Object,
    default: null
  }
})

const template = ref('classic')

const footerText = computed(() => {
  if (template.value === 'social') {
    return '把传统文化重新讲给当代父母'
  }
  return '为年轻家庭定制的命名灵感'
})

const shareText = computed(() => {
  if (!props.candidate) return ''
  return `刚在「千载吉名」里筛到一个很喜欢的名字：${props.candidate.name}。${props.candidate.plainSummary}｜风格：${props.candidate.styleProfile}｜实用提醒：${props.candidate.practicalHints.pronunciationRisk}`
})

const copyShareText = async () => {
  await navigator.clipboard.writeText(shareText.value)
  ElMessage.success('分享文案已复制')
}

const shareCard = async () => {
  if (!navigator.share) {
    await copyShareText()
    ElMessage.info('当前浏览器不支持系统分享，已改为复制文案')
    return
  }

  try {
    await navigator.share({
      title: props.candidate?.name,
      text: shareText.value
    })
  } catch (error) {
    // Ignore share cancellation.
  }
}
</script>

<style scoped>
.share-section {
  margin-top: 28px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #b36a35;
}

.section-header h3 {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  color: #732615;
  font-size: 28px;
}

.share-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 16px;
}

.share-preview {
  min-height: 320px;
  padding: 28px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.share-preview.classic {
  background:
    radial-gradient(circle at top right, rgba(242, 211, 179, 0.9), transparent 36%),
    linear-gradient(135deg, #fff7ef, #f7eee8);
  color: #6d3022;
}

.share-preview.social {
  background:
    radial-gradient(circle at top left, rgba(252, 216, 157, 0.95), transparent 35%),
    linear-gradient(135deg, #8a3d25, #cc7c36);
  color: #fff8f2;
}

.preview-top,
.preview-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.brand,
.route {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
}

.preview-main {
  margin: 28px 0;
}

.name {
  margin: 0 0 16px;
  font-family: 'Noto Serif SC', serif;
  font-size: 64px;
  letter-spacing: 8px;
}

.summary {
  margin: 0;
  max-width: 360px;
  line-height: 1.8;
  font-size: 16px;
}

.copy-card {
  border-radius: 24px;
  border: 1px solid rgba(174, 83, 39, 0.12);
}

.copy-block {
  margin-bottom: 20px;
}

.copy-title {
  margin-bottom: 10px;
  color: #8d3320;
  font-weight: 700;
}

.copy-block p {
  margin: 0;
  line-height: 1.8;
  color: #5d524c;
}

.copy-actions {
  display: flex;
  gap: 12px;
}

.ghost-btn {
  border-radius: 14px;
}

@media (max-width: 900px) {
  .share-grid {
    grid-template-columns: 1fr;
  }

  .name {
    font-size: 46px;
  }

  .copy-actions {
    flex-direction: column;
  }
}
</style>
