<template>
  <section class="result-container">
    <div v-if="streaming && !candidates.length" class="streaming-skeleton">
      <el-row :gutter="20">
        <el-col v-for="index in 4" :key="index" :xs="24" :sm="12">
          <el-card class="name-card skeleton-card">
            <el-skeleton :rows="7" animated />
          </el-card>
        </el-col>
      </el-row>
      <div class="streaming-tip">
        <p v-if="showThinkingTip" class="tip-text">模型正在做更深层的命名推演，请稍候。</p>
        <p v-else class="tip-text">正在整理更适合比较和精修的候选名。</p>
      </div>
    </div>

    <div v-else-if="candidates.length" class="result-content">
      <div class="result-header">
        <div>
          <p class="eyebrow">Naming Workspace</p>
          <h2>候选名工作区</h2>
          <p class="result-desc">先挑出主推方案，再基于方向做精修，不必每次推翻重来。</p>
        </div>
        <div class="header-actions">
          <el-button class="ghost-btn" @click="$emit('regenerate')">
            <el-icon><RefreshRight /></el-icon>
            重新生成
          </el-button>
        </div>
      </div>

      <div class="refine-bar">
        <div class="refine-copy">
          <strong>定向精修</strong>
          <span>基于已选候选继续推进，而不是随机重抽。</span>
        </div>
        <el-select v-model="refineDirection" style="width: 180px">
          <el-option v-for="item in refineDirections" :key="item" :label="item" :value="item" />
        </el-select>
        <el-input
          v-model="lockedConstraints"
          placeholder="锁定条件，例如保留‘清朗感’，不要太中性"
          class="refine-input"
        />
        <el-button type="primary" :loading="refineLoading" @click="emitRefine">
          基于当前方案精修
        </el-button>
      </div>

      <el-row :gutter="20">
        <el-col
          v-for="(item, index) in candidates"
          :key="item.id"
          :xs="24"
          :sm="12"
          class="card-col"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 100 * index } }"
        >
          <el-card class="name-card" :class="{ selected: item.id === selectedCandidateId }" shadow="hover">
            <div class="name-header">
              <div>
                <div class="name-meta">
                  <span class="style-chip">{{ item.styleProfile }}</span>
                  <span v-if="item.origin === 'refine'" class="refine-chip">精修方案</span>
                </div>
                <h3 class="full-name">{{ item.name }}</h3>
              </div>
              <div class="name-actions">
                <el-button circle class="icon-btn" @click="$emit('toggle-favorite', item.id)">
                  <el-icon v-if="item.favorite"><StarFilled /></el-icon>
                  <el-icon v-else><Star /></el-icon>
                </el-button>
                <el-button circle class="icon-btn" @click="copyName(item.name)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>

            <p class="plain-summary">{{ item.plainSummary }}</p>

            <div class="score-strip">
              <div class="score-box">
                <span>现代感</span>
                <strong>{{ item.modernScore.toFixed(1) }}</strong>
              </div>
              <div class="score-box">
                <span>音韵</span>
                <strong>{{ item.scores.yinyun.toFixed(1) }}</strong>
              </div>
              <div class="score-box">
                <span>文化</span>
                <strong>{{ item.scores.wenhua.toFixed(1) }}</strong>
              </div>
            </div>

            <div class="char-details">
              <div v-for="(charObj, index) in item.characters" :key="`${item.id}-${index}`" class="char-item">
                <span class="char">{{ charObj.char }}</span>
                <span class="meaning">{{ charObj.meaning }}</span>
              </div>
            </div>

            <div class="section-block">
              <div class="section-title">整体寓意</div>
              <p>{{ item.overall }}</p>
            </div>

            <div v-if="item.reference !== '无'" class="section-block">
              <div class="section-title">出处典故</div>
              <p>{{ item.reference }}</p>
            </div>

            <div class="section-block">
              <div class="section-title">实用提醒</div>
              <ul class="hint-list">
                <li>{{ item.practicalHints.rareCharRisk }}</li>
                <li>{{ item.practicalHints.pronunciationRisk }}</li>
                <li>{{ item.practicalHints.duplicateRisk }}</li>
              </ul>
            </div>

            <div class="section-block score-detail">
              <div class="section-title">细分评分</div>
              <div class="progress-item">
                <span>音韵美</span>
                <el-progress :percentage="item.scores.yinyun * 10" :show-text="false" color="#d67232" />
              </div>
              <div class="progress-item">
                <span>字义美</span>
                <el-progress :percentage="item.scores.ziyi * 10" :show-text="false" color="#9d3f24" />
              </div>
              <div class="progress-item">
                <span>文化底蕴</span>
                <el-progress :percentage="item.scores.wenhua * 10" :show-text="false" color="#6d3022" />
              </div>
            </div>

            <div class="card-footer">
              <el-button class="ghost-btn" @click="$emit('toggle-compare', item.id)">
                {{ compareIds.includes(item.id) ? '移出对比' : '加入对比' }}
              </el-button>
              <el-button type="primary" @click="$emit('select-candidate', item.id)">
                {{ item.id === selectedCandidateId ? '当前主推' : '设为主推' }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { CopyDocument, RefreshRight, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  candidates: {
    type: Array,
    default: () => []
  },
  compareIds: {
    type: Array,
    default: () => []
  },
  selectedCandidateId: {
    type: String,
    default: ''
  },
  streaming: Boolean,
  showThinkingTip: Boolean,
  refineLoading: Boolean
})

const emit = defineEmits(['regenerate', 'toggle-favorite', 'toggle-compare', 'select-candidate', 'refine'])

const refineDirections = ['更现代', '更独特', '更温柔', '更大气', '更偏中性', '更少生僻字']
const refineDirection = ref(refineDirections[0])
const lockedConstraints = ref('')

const copyName = async (name) => {
  await navigator.clipboard.writeText(name)
  ElMessage.success(`名字 "${name}" 已复制到剪贴板`)
}

const emitRefine = () => {
  emit('refine', {
    direction: refineDirection.value,
    lockedConstraints: lockedConstraints.value.trim()
  })
}
</script>

<style scoped>
.result-container {
  margin-top: 36px;
}

.streaming-skeleton {
  margin-top: 16px;
}

.skeleton-card {
  min-height: 360px;
  border-radius: 24px;
}

.streaming-tip {
  margin-top: 20px;
  text-align: center;
}

.tip-text {
  color: #8b4a2c;
  font-family: 'Noto Serif SC', serif;
}

.result-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #b16b34;
  font-size: 12px;
}

.result-header h2 {
  margin: 0 0 8px;
  font-family: 'Noto Serif SC', serif;
  font-size: 34px;
  color: #732615;
}

.result-desc {
  margin: 0;
  color: #7b6c63;
  line-height: 1.7;
}

.refine-bar {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 180px minmax(0, 1fr) 168px;
  gap: 14px;
  align-items: center;
  margin-bottom: 24px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 245, 236, 0.95), rgba(255, 250, 247, 0.96));
  border: 1px solid rgba(174, 83, 39, 0.12);
}

.refine-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.refine-copy strong {
  color: #7d2d1a;
}

.refine-copy span {
  color: #8d7a71;
  font-size: 14px;
}

.refine-input {
  width: 100%;
}

.card-col {
  margin-bottom: 20px;
}

.name-card {
  height: 100%;
  border-radius: 28px;
  border: 1px solid rgba(174, 83, 39, 0.14);
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.98), rgba(255, 248, 242, 0.95));
  box-shadow: 0 18px 40px rgba(106, 51, 20, 0.08);
}

.name-card.selected {
  border-color: rgba(157, 63, 36, 0.42);
  box-shadow: 0 22px 48px rgba(125, 52, 24, 0.16);
}

.name-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.name-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.style-chip,
.refine-chip {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.style-chip {
  background: rgba(210, 108, 49, 0.14);
  color: #9e4e28;
}

.refine-chip {
  background: rgba(115, 38, 21, 0.1);
  color: #732615;
}

.full-name {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  font-size: 34px;
  color: #8d3320;
  letter-spacing: 4px;
}

.name-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  border-color: rgba(157, 63, 36, 0.16);
}

.plain-summary {
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.7;
  color: #5c4f49;
}

.score-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.score-box {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
}

.score-box span {
  display: block;
  margin-bottom: 6px;
  color: #8d7a71;
  font-size: 12px;
}

.score-box strong {
  font-size: 24px;
  color: #7d2d1a;
}

.char-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.char-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 14px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.char {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #8d3320;
  text-align: center;
}

.meaning {
  color: #665852;
  line-height: 1.6;
}

.section-block {
  margin-bottom: 16px;
}

.section-title {
  margin-bottom: 10px;
  color: #8d3320;
  font-weight: 700;
}

.section-block p {
  margin: 0;
  line-height: 1.7;
  color: #5b504a;
}

.hint-list {
  margin: 0;
  padding-left: 18px;
  color: #5b504a;
  line-height: 1.7;
}

.score-detail {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.66);
}

.progress-item {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 12px;
  align-items: center;
}

.progress-item + .progress-item {
  margin-top: 10px;
}

.progress-item span {
  color: #775e55;
  font-size: 13px;
}

.card-footer {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
}

.ghost-btn {
  border-radius: 14px;
}

@media (max-width: 960px) {
  .refine-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
  }

  .card-footer {
    flex-direction: column;
  }
}
</style>
