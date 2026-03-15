<template>
  <section class="workspace-panel">
    <div class="panel-header">
      <div>
        <p class="eyebrow">Workspace</p>
        <h3>收藏与历史</h3>
      </div>
      <el-tag round type="warning">本地自动保存</el-tag>
    </div>

    <div class="panel-grid">
      <el-card class="panel-card">
        <template #header>主推方案</template>
        <div v-if="selectedCandidate" class="primary-card">
          <h4>{{ selectedCandidate.name }}</h4>
          <p>{{ selectedCandidate.plainSummary }}</p>
          <div class="metric-row">
            <span>现代感 {{ selectedCandidate.modernScore.toFixed(1) }}</span>
            <span>风格 {{ selectedCandidate.styleProfile }}</span>
          </div>
        </div>
        <el-empty v-else description="先生成候选名" :image-size="72" />
      </el-card>

      <el-card class="panel-card">
        <template #header>收藏夹</template>
        <div v-if="favorites.length" class="tag-list">
          <button
            v-for="item in favorites"
            :key="item.id"
            type="button"
            class="tag-button"
            @click="$emit('select-candidate', item.id)"
          >
            {{ item.name }}
          </button>
        </div>
        <el-empty v-else description="还没有收藏的候选名" :image-size="72" />
      </el-card>

      <el-card class="panel-card">
        <template #header>对比区</template>
        <div v-if="compareCandidates.length" class="tag-list">
          <button
            v-for="item in compareCandidates"
            :key="item.id"
            type="button"
            class="tag-button secondary"
            @click="$emit('select-candidate', item.id)"
          >
            {{ item.name }}
          </button>
        </div>
        <el-empty v-else description="加入 2 个以上候选名即可对比" :image-size="72" />
      </el-card>

      <el-card class="panel-card history-card">
        <template #header>最近工作区</template>
        <div v-if="history.length" class="history-list">
          <button
            v-for="item in history.slice(0, 5)"
            :key="item.id"
            type="button"
            class="history-item"
            @click="$emit('restore-history', item)"
          >
            <div class="history-main">
              <strong>{{ item.candidates?.[0]?.name || '命名快照' }}</strong>
              <span>{{ item.request?.styleProfile || '未记录风格' }}</span>
            </div>
            <time>{{ formatTime(item.updatedAt) }}</time>
          </button>
        </div>
        <el-empty v-else description="还没有历史记录" :image-size="72" />
      </el-card>

      <el-card class="panel-card upgrade-card">
        <p class="eyebrow">Future Pro</p>
        <h4>完整命名报告</h4>
        <p>下一步可扩展为付费交付：对比分析、精选小名、命理建议、分享版摘要。</p>
        <div class="upgrade-tags">
          <span>报告下载</span>
          <span>更多候选</span>
          <span>多轮精修</span>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  favorites: {
    type: Array,
    default: () => []
  },
  history: {
    type: Array,
    default: () => []
  },
  selectedCandidate: {
    type: Object,
    default: null
  },
  compareCandidates: {
    type: Array,
    default: () => []
  }
})

defineEmits(['restore-history', 'select-candidate'])

const formatTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.workspace-panel {
  margin-top: 28px;
}

.panel-header {
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

.panel-header h3 {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  color: #732615;
  font-size: 28px;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.panel-card {
  border-radius: 24px;
  border: 1px solid rgba(174, 83, 39, 0.12);
  background: rgba(255, 252, 249, 0.92);
}

.primary-card h4,
.upgrade-card h4 {
  margin: 0 0 10px;
  font-family: 'Noto Serif SC', serif;
  font-size: 30px;
  color: #8d3320;
}

.primary-card p,
.upgrade-card p {
  margin: 0;
  color: #665852;
  line-height: 1.7;
}

.metric-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 14px;
  color: #8d7a71;
  font-size: 13px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-button {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(157, 63, 36, 0.12);
  background: rgba(255, 244, 235, 0.86);
  color: #8d3320;
  cursor: pointer;
}

.tag-button.secondary {
  background: rgba(255, 251, 247, 0.92);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  width: 100%;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(174, 83, 39, 0.08);
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.history-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-main strong {
  color: #7d2d1a;
}

.history-main span,
.history-item time {
  color: #8d7a71;
  font-size: 13px;
}

.upgrade-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.upgrade-tags span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(210, 108, 49, 0.12);
  color: #9e4e28;
  font-size: 13px;
}

@media (max-width: 900px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
