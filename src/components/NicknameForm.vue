<template>
  <el-card class="nickname-form-card">
    <template #header>
      <div class="card-header">
        <div>
          <h3>延伸小名</h3>
          <p>围绕主推正式名继续做乳名搭配。</p>
        </div>
      </div>
    </template>

    <el-form :model="formData" label-width="96px">
      <el-form-item label="小名风格">
        <el-checkbox-group v-model="formData.styles">
          <el-checkbox v-for="style in styleOptions" :key="style" :label="style" :value="style" />
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="关联正式名">
        <div class="switch-row">
          <el-switch v-model="formData.linkToFormalName" active-text="基于主推正式名生成" />
          <p v-if="formData.linkToFormalName && formalName" class="form-tip">
            当前将围绕「{{ formalName }}」设计小名。
          </p>
        </div>
      </el-form-item>

      <el-form-item label="小名数量">
        <div class="count-row">
          <el-slider v-model="formData.count" :min="3" :max="8" :step="1" show-stops />
          <span class="count-display">{{ formData.count }} 个</span>
        </div>
      </el-form-item>

      <el-form-item class="action-row">
        <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
          生成小名组合
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  loading: Boolean,
  formalName: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: 'male'
  }
})

const emit = defineEmits(['submit'])

const styleOptions = ['叠字型', '动物型', '食物型', '自然型', '英文音译']

const formData = reactive({
  styles: ['叠字型', '自然型'],
  linkToFormalName: true,
  count: 5
})

const handleSubmit = () => {
  if (!formData.styles.length) {
    ElMessage.warning('请至少选择一种小名风格')
    return
  }

  emit('submit', {
    styles: formData.styles,
    linkToFormalName: formData.linkToFormalName,
    count: formData.count,
    formalName: props.formalName,
    gender: props.gender
  })
}
</script>

<style scoped>
.nickname-form-card {
  margin-top: 28px;
  border-radius: 24px;
  border: 1px solid rgba(174, 83, 39, 0.12);
  background: rgba(255, 252, 248, 0.9);
}

.card-header h3 {
  margin: 0 0 6px;
  font-family: 'Noto Serif SC', serif;
  color: #732615;
  font-size: 26px;
}

.card-header p {
  margin: 0;
  color: #8d7a71;
}

.switch-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-tip {
  margin: 0;
  color: #8d7a71;
  font-size: 13px;
}

.count-row {
  display: grid;
  grid-template-columns: 1fr 68px;
  gap: 16px;
  align-items: center;
  width: 100%;
}

.count-display {
  color: #8d3320;
  font-weight: 700;
}

.action-row {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #9d3f24, #d57c34);
}
</style>
