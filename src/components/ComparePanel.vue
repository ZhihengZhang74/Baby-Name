<template>
  <section v-if="candidates.length" class="compare-panel">
    <div class="panel-header">
      <div>
        <p class="eyebrow">Compare</p>
        <h3>候选对比</h3>
      </div>
      <el-button class="ghost-btn" @click="$emit('clear')">清空对比</el-button>
    </div>

    <el-table :data="rows" stripe class="compare-table">
      <el-table-column prop="label" label="维度" width="110" />
      <el-table-column
        v-for="candidate in candidates"
        :key="candidate.id"
        :label="candidate.name"
        min-width="180"
      >
        <template #default="{ row }">
          <div class="cell-text">{{ row.values[candidate.id] }}</div>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  candidates: {
    type: Array,
    default: () => []
  }
})

defineEmits(['clear'])

const rows = computed(() => {
  const defineRow = (label, getter) => ({
    label,
    values: Object.fromEntries(props.candidates.map((item) => [item.id, getter(item)]))
  })

  return [
    defineRow('风格', (item) => item.styleProfile),
    defineRow('白话解释', (item) => item.plainSummary),
    defineRow('现代感', (item) => item.modernScore.toFixed(1)),
    defineRow('音韵美', (item) => item.scores.yinyun.toFixed(1)),
    defineRow('字义美', (item) => item.scores.ziyi.toFixed(1)),
    defineRow('文化底蕴', (item) => item.scores.wenhua.toFixed(1)),
    defineRow('书写提示', (item) => item.practicalHints.rareCharRisk),
    defineRow('称呼提示', (item) => item.practicalHints.pronunciationRisk),
    defineRow('撞名提示', (item) => item.practicalHints.duplicateRisk)
  ]
})
</script>

<style scoped>
.compare-panel {
  margin-top: 28px;
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 251, 247, 0.92);
  border: 1px solid rgba(174, 83, 39, 0.12);
  box-shadow: 0 16px 36px rgba(98, 48, 20, 0.06);
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

.cell-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #5d524c;
}

.ghost-btn {
  border-radius: 14px;
}
</style>
