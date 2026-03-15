<template>
  <div class="nickname-result-container">
    <!-- 骨架屏加载 -->
    <div v-if="loading && !nicknames.length" class="loading-state">
      <el-row :gutter="20" justify="center">
        <el-col :xs="12" :sm="8" :md="6" v-for="i in 4" :key="i" class="mb-4">
          <el-card class="nickname-card skeleton-card">
            <el-skeleton :rows="3" animated />
          </el-card>
        </el-col>
      </el-row>
      <div class="loading-tip">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在从萌萌词库中寻觅可爱小名...</span>
      </div>
    </div>

    <!-- 小名结果展示 -->
    <div v-else-if="nicknames.length" class="result-section">
      <div class="result-header">
        <h2 class="result-title">小名已就绪</h2>
        <p class="result-desc">以下是小名建议，看看哪个最合你心意</p>
      </div>

      <el-row :gutter="20" justify="center">
        <el-col 
          :xs="12" :sm="8" :md="6" 
          v-for="(item, index) in nicknames" 
          :key="index" 
          class="mb-4"
        >
          <el-card class="nickname-card" shadow="hover">
            <div class="nickname-header">
              <span class="nickname-text">{{ item.nickname }}</span>
              <el-button 
                text 
                @click="copyNickname(item.nickname)" 
                :icon="CopyDocument"
              >
                复制
              </el-button>
            </div>

            <!-- 风格标签 -->
            <div class="style-tag">
              <el-tag size="small" :type="getStyleTagType(item.style)">
                {{ item.style }}
              </el-tag>
            </div>

            <!-- 寓意说明 -->
            <div class="meaning-section">
              <div class="section-label">✨ 寓意</div>
              <p class="meaning-text">{{ item.meaning }}</p>
            </div>

            <!-- 与正式名关联 -->
            <div v-if="item.relatedChar" class="related-section">
              <div class="section-label">🔗 与正式名关联</div>
              <p class="related-text">取自正式名中的「{{ item.relatedChar }}」字</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 重新生成按钮 -->
      <div class="regenerate-section">
        <el-button 
          type="primary" 
          size="large" 
          @click="$emit('regenerate')" 
          class="regenerate-btn"
        >
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loading, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineProps({
  nicknames: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

defineEmits(['regenerate'])

const copyNickname = (nickname) => {
  navigator.clipboard.writeText(nickname)
  ElMessage.success(`小名 "${nickname}" 已复制到剪贴板`)
}

const getStyleTagType = (style) => {
  const typeMap = {
    '叠字型': 'danger',
    '动物型': 'warning',
    '食物型': 'success',
    '自然型': '',
    '英文音译': 'info'
  }
  return typeMap[style] || ''
}
</script>

<style scoped>
.nickname-result-container {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px dashed rgba(186, 44, 44, 0.2);
}

.loading-state {
  text-align: center;
}

.loading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: #ba2c2c;
  font-family: 'Noto Serif SC', serif;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  font-weight: 700;
  color: #8c1c1c;
  margin: 0 0 10px 0;
}

.result-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.mb-4 {
  margin-bottom: 20px;
}

.nickname-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #fff9f9 0%, #fff 100%);
  border: 1px solid rgba(186, 44, 44, 0.15);
  box-shadow: 0 4px 16px rgba(186, 44, 44, 0.05);
  transition: all 0.3s ease;
  height: 100%;
}

.nickname-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(186, 44, 44, 0.15);
}

.skeleton-card {
  min-height: 150px;
}

.nickname-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.nickname-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  font-weight: 700;
  color: #ba2c2c;
  letter-spacing: 2px;
}

.style-tag {
  margin-bottom: 12px;
}

.section-label {
  font-size: 12px;
  color: #8c1c1c;
  font-weight: 600;
  margin-bottom: 6px;
}

.meaning-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin: 0;
}

.related-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(186, 44, 44, 0.1);
}

.related-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.regenerate-section {
  text-align: center;
  margin-top: 30px;
}

.regenerate-btn {
  background-color: #ba2c2c;
  border-color: #8c1c1c;
  font-family: 'Noto Serif SC', serif;
}

.regenerate-btn:hover {
  background-color: #e33838;
  border-color: #ba2c2c;
}
</style>
