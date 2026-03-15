<template>
  <div class="app-shell">
    <header class="hero-section">
      <div class="hero-copy" v-motion-slide-visible-top>
        <p class="eyebrow">Chinese Naming Studio</p>
        <h1>千载吉名</h1>
        <p class="hero-text">
          把传统文化做成当代家庭愿意分享、愿意反复筛选、愿意继续付费升级的命名体验。
          这不是随机抽卡，而是一套可收藏、可对比、可精修的命名工作流。
        </p>
        <div class="hero-badges">
          <span>风格化起名</span>
          <span>候选对比</span>
          <span>分享卡预览</span>
          <span>本地工作区</span>
        </div>
      </div>

      <div class="hero-panels">
        <article 
          v-for="(item, index) in inspirationCards" 
          :key="item.title" 
          class="hero-panel"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 * (index + 1) } }"
        >
          <span class="panel-kicker">{{ item.kicker }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </header>

    <main class="app-main">
      <section class="composer-grid">
        <NameForm :loading="loading || refineLoading" :initial-data="currentRequest" @submit="handleGenerate" />

        <WorkspacePanel
          :favorites="favorites"
          :history="history"
          :selected-candidate="selectedCandidate"
          :compare-candidates="compareCandidates"
          @restore-history="handleRestoreHistory"
          @select-candidate="handleSelectCandidate"
        />
      </section>

      <div v-if="error" class="error-state" v-motion-slide-visible-top>
        <el-alert :title="error" type="error" show-icon :closable="false" />
      </div>

      <NameResult
        :candidates="candidates"
        :compare-ids="compareIds"
        :selected-candidate-id="selectedCandidateId"
        :streaming="streaming"
        :show-thinking-tip="showThinkingTip"
        :refine-loading="refineLoading"
        @regenerate="handleRegenerate"
        @toggle-favorite="handleToggleFavorite"
        @toggle-compare="handleToggleCompare"
        @select-candidate="handleSelectCandidate"
        @refine="handleRefine"
      />

      <ComparePanel v-if="compareCandidates.length >= 2" :candidates="compareCandidates" @clear="clearCompare" />

      <ShareCard :candidate="selectedCandidate" />
      <ReportPanel :candidate="selectedCandidate" :nicknames="workspaceNicknames" :bazi-result="workspaceBaziResult" />

      <section v-if="candidates.length" class="extension-grid">
        <div class="extension-column">
          <div class="entry-header">
            <div>
              <p class="eyebrow">Nickname</p>
              <h3>小名延伸</h3>
            </div>
            <el-button class="ghost-btn" @click="showNicknameForm = !showNicknameForm">
              {{ showNicknameForm ? '收起' : '生成小名' }}
            </el-button>
          </div>

          <NicknameForm
            v-if="showNicknameForm"
            v-motion-slide-visible-bottom
            :loading="nicknameLoading"
            :formal-name="selectedFormalName"
            :gender="gender"
            @submit="handleGenerateNicknames"
          />

          <NicknameResult
            :nicknames="workspaceNicknames"
            :loading="nicknameLoading"
            @regenerate="handleRegenerateNicknames"
          />

          <div v-if="nicknameError" class="error-state inline">
            <el-alert :title="nicknameError" type="error" show-icon :closable="false" />
          </div>
        </div>

        <div class="extension-column">
          <div class="entry-header">
            <div>
              <p class="eyebrow">Bazi</p>
              <h3>命理补充</h3>
            </div>
            <el-button
              class="ghost-btn"
              :disabled="!showBaziAnalysis"
              @click="handleGenerateBazi"
            >
              {{ workspaceBaziResult ? '重新分析' : '查看八字分析' }}
            </el-button>
          </div>

          <div v-if="!showBaziAnalysis" class="bazi-empty">
            <p>补充出生时辰后，可生成更完整的五行与命名建议。</p>
          </div>

          <BaziResult
            v-else
            v-motion-fade-visible
            :bazi-result="workspaceBaziResult"
            :loading="baziLoading"
            :error="baziError"
            @regenerate="handleRegenerateBazi"
          />
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>© {{ new Date().getFullYear() }} 千载吉名 · 传统文化的现代命名体验</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import NameForm from './components/NameForm.vue'
import NameResult from './components/NameResult.vue'
import NicknameForm from './components/NicknameForm.vue'
import NicknameResult from './components/NicknameResult.vue'
import BaziResult from './components/BaziResult.vue'
import ComparePanel from './components/ComparePanel.vue'
import WorkspacePanel from './components/WorkspacePanel.vue'
import ShareCard from './components/ShareCard.vue'
import ReportPanel from './components/ReportPanel.vue'
import { useLLM } from './composables/useLLM'
import { useNamingWorkspace } from './composables/useNamingWorkspace'

const inspirationCards = [
  {
    kicker: '爆款方向',
    title: '把结果做成值得晒出来的卡片',
    text: '结果要天然带传播属性，不能只是一段模型输出。'
  },
  {
    kicker: '商业基础',
    title: '从免费候选升级到完整命名报告',
    text: '先把免费体验做成闭环，再把深度分析作为进阶交付。'
  },
  {
    kicker: '产品方法',
    title: '允许用户一步步筛，而不是一次性决定',
    text: '先收藏、再对比、再精修，才符合真实决策路径。'
  }
]

const {
  generateNames,
  refineNames,
  regenerate,
  generateNicknames,
  regenerateNicknames,
  generateBaziAnalysis,
  regenerateBaziAnalysis,
  loading,
  refineLoading,
  streaming,
  error,
  showThinkingTip,
  nicknameLoading,
  nicknameError,
  baziLoading,
  baziError
} = useLLM()

const {
  currentRequest,
  candidates,
  compareIds,
  selectedCandidateId,
  selectedCandidate,
  compareCandidates,
  favorites,
  nicknames: workspaceNicknames,
  baziResult: workspaceBaziResult,
  history,
  startNewSession,
  setCandidates,
  appendCandidates,
  setNicknames,
  setBaziResult,
  toggleFavorite,
  toggleCompare,
  selectCandidate,
  clearCompare,
  saveSnapshot,
  restoreSnapshot
} = useNamingWorkspace()

const showNicknameForm = ref(false)
const showBaziAnalysis = ref(Boolean(currentRequest.value?.birthHour))
const gender = ref(currentRequest.value?.gender || 'male')
const baziData = ref(currentRequest.value
  ? {
      gender: currentRequest.value.gender,
      birthDate: currentRequest.value.birthDate,
      birthHour: currentRequest.value.birthHour,
      birthPlace: currentRequest.value.birthPlace
    }
  : null)
const lastNicknameOptions = ref(null)

const selectedFormalName = computed(() => selectedCandidate.value?.name || candidates.value[0]?.name || '')

const buildBaziPayload = (request) => ({
  gender: request.gender,
  birthDate: request.birthDate,
  birthHour: request.birthHour,
  birthPlace: request.birthPlace
})

const handleGenerate = async (formData) => {
  gender.value = formData.gender
  baziData.value = buildBaziPayload(formData)
  showBaziAnalysis.value = Boolean(formData.birthHour)
  showNicknameForm.value = false
  lastNicknameOptions.value = null

  regenerateNicknames()
  regenerateBaziAnalysis()
  startNewSession(formData)

  try {
    const response = await generateNames(formData)
    setCandidates(response.names)
    saveSnapshot('initial')
  } catch (err) {
    console.error('Failed to generate names', err)
  }
}

const handleRegenerate = async () => {
  if (!currentRequest.value) {
    regenerate()
    return
  }
  await handleGenerate(currentRequest.value)
}

const handleRefine = async ({ direction, lockedConstraints }) => {
  if (!currentRequest.value || !candidates.value.length) return

  const baseCandidates = compareCandidates.value.length
    ? compareCandidates.value
    : selectedCandidate.value
      ? [selectedCandidate.value]
      : candidates.value.slice(0, 2)

  try {
    const response = await refineNames({
      request: currentRequest.value,
      baseCandidates,
      direction,
      lockedConstraints
    })
    appendCandidates(response.names)
    saveSnapshot(`refine:${direction}`)
  } catch (err) {
    console.error('Failed to refine names', err)
  }
}

const handleToggleFavorite = (candidateId) => {
  toggleFavorite(candidateId)
  saveSnapshot('favorite')
}

const handleToggleCompare = (candidateId) => {
  toggleCompare(candidateId)
}

const handleSelectCandidate = (candidateId) => {
  selectCandidate(candidateId)
}

const handleGenerateNicknames = async (options) => {
  const payload = {
    ...options,
    formalName: selectedFormalName.value
  }

  lastNicknameOptions.value = payload
  setNicknames([])

  try {
    const response = await generateNicknames(payload)
    setNicknames(response)
    saveSnapshot('nickname')
  } catch (err) {
    console.error('Failed to generate nicknames', err)
  }
}

const handleRegenerateNicknames = async () => {
  if (!lastNicknameOptions.value) {
    regenerateNicknames()
    setNicknames([])
    return
  }

  await handleGenerateNicknames(lastNicknameOptions.value)
}

const handleGenerateBazi = async () => {
  if (!baziData.value || !showBaziAnalysis.value) return

  setBaziResult(null)

  try {
    const response = await generateBaziAnalysis(baziData.value)
    setBaziResult(response)
    saveSnapshot('bazi')
  } catch (err) {
    console.error('Failed to generate bazi analysis', err)
  }
}

const handleRegenerateBazi = async () => {
  regenerateBaziAnalysis()
  await handleGenerateBazi()
}

const handleRestoreHistory = (snapshot) => {
  restoreSnapshot(snapshot)
  if (snapshot?.request) {
    gender.value = snapshot.request.gender || 'male'
    baziData.value = buildBaziPayload(snapshot.request)
    showBaziAnalysis.value = Boolean(snapshot.request.birthHour)
  }
  showNicknameForm.value = Boolean(snapshot?.nicknames?.length)
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 32px 20px 56px;
}

.hero-section {
  max-width: 1280px;
  margin: 0 auto 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  gap: 24px;
  align-items: stretch;
}

.hero-copy,
.hero-panel {
  border-radius: 32px;
  border: 1px solid rgba(174, 83, 39, 0.12);
  box-shadow: 0 24px 50px rgba(106, 51, 20, 0.08);
}

.hero-copy {
  padding: 40px;
  background:
    radial-gradient(circle at top right, rgba(243, 214, 181, 0.8), transparent 34%),
    linear-gradient(145deg, rgba(255, 252, 247, 0.98), rgba(252, 242, 230, 0.95));
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #b36a35;
}

.hero-copy h1 {
  margin: 0 0 18px;
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(48px, 7vw, 78px);
  line-height: 1;
  color: #732615;
  letter-spacing: 8px;
}

.hero-text {
  margin: 0;
  max-width: 700px;
  color: #5b504a;
  line-height: 1.9;
  font-size: 17px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.hero-badges span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(157, 63, 36, 0.08);
  color: #8d3320;
}

.hero-panels {
  display: grid;
  gap: 16px;
}

.hero-panel {
  padding: 24px;
  background: rgba(255, 252, 249, 0.9);
}

.panel-kicker {
  display: inline-block;
  margin-bottom: 14px;
  color: #b36a35;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-panel h2 {
  margin: 0 0 12px;
  font-family: 'Noto Serif SC', serif;
  color: #732615;
  font-size: 24px;
}

.hero-panel p {
  margin: 0;
  color: #665852;
  line-height: 1.7;
}

.app-main {
  max-width: 1280px;
  margin: 0 auto;
}

.composer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 20px;
  align-items: start;
}

.extension-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 28px;
}

.extension-column {
  min-width: 0;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 14px;
}

.entry-header h3 {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #732615;
}

.ghost-btn {
  border-radius: 14px;
}

.error-state {
  margin-top: 24px;
}

.error-state.inline {
  margin-top: 16px;
}

.bazi-empty {
  padding: 20px;
  border-radius: 22px;
  background: rgba(255, 248, 240, 0.84);
  color: #7a5c4c;
  line-height: 1.7;
}

.app-footer {
  max-width: 1280px;
  margin: 40px auto 0;
  text-align: center;
  color: #9a8b82;
}

@media (max-width: 1024px) {
  .hero-section,
  .composer-grid,
  .extension-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-shell {
    padding: 16px 14px 40px;
  }

  .hero-copy {
    padding: 28px 24px;
  }

  .hero-copy h1 {
    letter-spacing: 4px;
  }

  .entry-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
