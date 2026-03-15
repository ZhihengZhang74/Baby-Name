<template>
  <div class="bazi-result">
    <el-alert v-if="error" type="error" :title="error" show-icon :closable="false" />

    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
      <p class="loading-text">正在推演命理，测算八字...</p>
    </div>

    <div v-else-if="baziResult" class="result-content">
      <!-- 四柱八字 -->
      <div class="section">
        <h3 class="section-title">四柱八字</h3>
        <el-row :gutter="16">
          <el-col :span="6" v-for="(pillar, key) in baziResult.sizhu" :key="key">
            <el-card class="pillar-card">
              <div class="pillar-name">{{ getPillarName(key) }}</div>
              <div class="pillar-chars">
                <span class="gan">{{ pillar.gan }}</span>
                <span class="zhi">{{ pillar.zhi }}</span>
              </div>
              <div class="pillar-info">
                <el-tag size="small">{{ pillar.shishen }}</el-tag>
                <el-tag size="small" :class="getWuxingClass(pillar.wuxing)">{{ pillar.wuxing }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 五行分析 -->
      <div class="section">
        <h3 class="section-title">五行强弱</h3>
        <el-card>
          <div class="wuxing-stats">
            <div v-for="(count, element) in baziResult.wuxing.stats" :key="element" class="wuxing-item">
              <span class="element-name" :class="getWuxingClass(element)">{{ element }}</span>
              <el-progress :percentage="count * 12.5" :color="getWuxingColor(element)" />
              <span class="element-count">{{ count }}</span>
            </div>
          </div>
          <p class="analysis-text">{{ baziResult.wuxing.analysis }}</p>
        </el-card>
      </div>

      <!-- 喜用神 -->
      <div class="section">
        <h3 class="section-title">喜用神</h3>
        <el-card>
          <div class="shen-group">
            <div class="shen-item">
              <span class="shen-label">用神：</span>
              <el-tag type="success" size="large">{{ baziResult.xiyongshen.yongshen }}</el-tag>
            </div>
            <div class="shen-item">
              <span class="shen-label">喜神：</span>
              <el-tag v-for="x in baziResult.xiyongshen.xishen" :key="x" type="success">{{ x }}</el-tag>
            </div>
            <div class="shen-item">
              <span class="shen-label">忌神：</span>
              <el-tag v-for="j in baziResult.xiyongshen.jishen" :key="j" type="danger">{{ j }}</el-tag>
            </div>
          </div>
          <p class="analysis-text">{{ baziResult.xiyongshen.explanation }}</p>
        </el-card>
      </div>

      <!-- 命理解读 -->
      <div class="section">
        <h3 class="section-title">命理解读</h3>
        <el-card>
          <div class="mingli-item" v-if="baziResult.mingli.personality">
            <h4>性格特点</h4>
            <p>{{ baziResult.mingli.personality }}</p>
          </div>
          <div class="mingli-item" v-if="baziResult.mingli.fortune">
            <h4>运势倾向</h4>
            <p>{{ baziResult.mingli.fortune }}</p>
          </div>
          <div class="mingli-item" v-if="baziResult.mingli.suggestions">
            <h4>取名建议</h4>
            <p>{{ baziResult.mingli.suggestions }}</p>
          </div>
        </el-card>
      </div>

      <div class="action-buttons">
        <el-button @click="$emit('regenerate')" type="primary">重新分析</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  baziResult: Object,
  loading: Boolean,
  error: String
})

defineEmits(['regenerate'])

const getPillarName = (key) => {
  const names = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }
  return names[key] || key
}

const getWuxingClass = (wuxing) => {
  const first = wuxing?.[0] || wuxing
  const map = { '金': 'jin', '木': 'mu', '水': 'shui', '火': 'huo', '土': 'tu' }
  return `wuxing-${map[first] || 'default'}`
}

const getWuxingColor = (element) => {
  const colors = { '金': '#d4af37', '木': '#228b22', '水': '#4169e1', '火': '#dc143c', '土': '#8b4513' }
  return colors[element] || '#999'
}
</script>

<style scoped>
.bazi-result {
  margin-top: 20px;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-text {
  margin-top: 20px;
  color: #8c1c1c;
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
}

.result-content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 700;
  color: #8c1c1c;
  margin-bottom: 16px;
  border-left: 4px solid #ba2c2c;
  padding-left: 12px;
}

.pillar-card {
  text-align: center;
  border-radius: 12px;
  border: 2px solid rgba(186, 44, 44, 0.2);
}

.pillar-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.pillar-chars {
  font-family: 'Noto Serif SC', serif;
  font-size: 32px;
  font-weight: 700;
  color: #8c1c1c;
  margin: 12px 0;
}

.pillar-chars .gan {
  margin-right: 8px;
}

.pillar-info {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.wuxing-stats {
  margin-bottom: 20px;
}

.wuxing-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.element-name {
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  font-size: 16px;
  width: 40px;
}

.element-count {
  font-weight: 700;
  width: 30px;
  text-align: right;
}

.wuxing-jin { color: #d4af37; }
.wuxing-mu { color: #228b22; }
.wuxing-shui { color: #4169e1; }
.wuxing-huo { color: #dc143c; }
.wuxing-tu { color: #8b4513; }

.analysis-text {
  line-height: 1.8;
  color: #333;
  margin-top: 16px;
}

.shen-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.shen-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shen-label {
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  color: #8c1c1c;
  min-width: 60px;
}

.mingli-item {
  margin-bottom: 20px;
}

.mingli-item:last-child {
  margin-bottom: 0;
}

.mingli-item h4 {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 700;
  color: #8c1c1c;
  margin-bottom: 8px;
}

.mingli-item p {
  line-height: 1.8;
  color: #333;
}

.action-buttons {
  text-align: center;
  margin-top: 24px;
}
</style>
