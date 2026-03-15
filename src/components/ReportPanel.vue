<template>
  <section v-if="candidate" class="report-panel">
    <div class="section-header">
      <div>
        <p class="eyebrow">Report</p>
        <h3>命名报告预览</h3>
      </div>
      <el-tag type="success" round>可作为未来付费交付</el-tag>
    </div>

    <div class="report-grid">
      <el-card class="report-card">
        <template #header>首选推荐</template>
        <h4>{{ candidate.name }}</h4>
        <p>{{ candidate.overall }}</p>
        <div class="metric-list">
          <span>风格路线：{{ candidate.styleProfile }}</span>
          <span>现代感：{{ candidate.modernScore.toFixed(1) }}</span>
          <span>五行倾向：{{ candidate.wuxing }}</span>
        </div>
      </el-card>

      <el-card class="report-card">
        <template #header>实用结论</template>
        <ul class="report-list">
          <li>{{ candidate.practicalHints.rareCharRisk }}</li>
          <li>{{ candidate.practicalHints.pronunciationRisk }}</li>
          <li>{{ candidate.practicalHints.duplicateRisk }}</li>
        </ul>
      </el-card>

      <el-card class="report-card">
        <template #header>小名搭配</template>
        <div v-if="nicknames.length" class="nickname-list">
          <span v-for="item in nicknames.slice(0, 4)" :key="item.id">{{ item.nickname }}</span>
        </div>
        <el-empty v-else description="生成小名后会出现在这里" :image-size="60" />
      </el-card>

      <el-card class="report-card">
        <template #header>命理建议</template>
        <p v-if="baziResult?.mingli?.suggestions">{{ baziResult.mingli.suggestions }}</p>
        <p v-else class="muted">补充出生时辰后，可在这里查看更完整的命理建议。</p>
      </el-card>
    </div>
  </section>
</template>

<script setup>
defineProps({
  candidate: {
    type: Object,
    default: null
  },
  nicknames: {
    type: Array,
    default: () => []
  },
  baziResult: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.report-panel {
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

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.report-card {
  border-radius: 24px;
  border: 1px solid rgba(174, 83, 39, 0.12);
  background: rgba(255, 252, 249, 0.92);
}

.report-card h4 {
  margin: 0 0 10px;
  font-family: 'Noto Serif SC', serif;
  font-size: 32px;
  color: #8d3320;
}

.report-card p {
  margin: 0;
  color: #5d524c;
  line-height: 1.8;
}

.metric-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 14px;
  color: #8d7a71;
  font-size: 13px;
}

.report-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
  color: #5d524c;
}

.nickname-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nickname-list span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(210, 108, 49, 0.12);
  color: #9e4e28;
}

.muted {
  color: #8d7a71;
}

@media (max-width: 900px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
