<template>
  <el-card class="name-form-card">
    <template #header>
      <div class="card-header">
        <div>
          <h2>专属命名工作台</h2>
          <p>先定义气质，再让 AI 给出可比较、可精修的候选名。</p>
        </div>
        <el-tag effect="dark" round>Web 正式站点预览版</el-tag>
      </div>
    </template>

    <div class="feature-row">
      <span v-for="item in featureTags" :key="item" class="feature-tag">{{ item }}</span>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
      class="name-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="宝宝性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio-button label="male">男宝</el-radio-button>
          <el-radio-button label="female">女宝</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="风格路线" prop="styleProfile">
        <el-select v-model="formData.styleProfile" placeholder="请选择风格路线" style="width: 100%">
          <el-option
            v-for="item in styleProfiles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="option-row">
              <span>{{ item.label }}</span>
              <span class="option-note">{{ item.note }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="偏好特质">
        <el-checkbox-group v-model="formData.preferredTraits">
          <el-checkbox v-for="item in traitOptions" :key="item" :label="item" :value="item" />
        </el-checkbox-group>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="出生日期">
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              placeholder="选择出生日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="出生时辰">
            <el-select v-model="formData.birthHour" placeholder="选填，用于八字分析" clearable style="width: 100%">
              <el-option v-for="hour in hourOptions" :key="hour.value" :label="hour.label" :value="hour.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="出生地">
        <el-cascader
          v-model="formData.birthPlace"
          :options="areaOptions"
          :props="{ value: 'label', label: 'label' }"
          placeholder="请选择省市"
          style="width: 100%"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="父亲姓名">
            <el-input v-model="formData.fatherName" placeholder="选填，用于优先提取姓氏" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="母亲姓名">
            <el-input v-model="formData.motherName" placeholder="选填，用于语义参考" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="父母期待" prop="expectation">
        <el-input
          v-model="formData.expectation"
          type="textarea"
          :rows="3"
          placeholder="例如：希望她勇敢、松弛、温柔坚定，不想太常见也不想过于生僻。"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="避开用字">
            <el-input
              v-model="formData.avoidChars"
              placeholder="例如：梓、轩、涵"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="避开发音">
            <el-input
              v-model="formData.avoidSounds"
              placeholder="例如：an、yi、xin"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="helper-copy">
        <div>建议写得像 briefing，而不是许愿句。</div>
        <div>越明确越容易生成能比较、能精修的结果。</div>
      </div>

      <el-form-item class="submit-row">
        <el-button type="primary" native-type="submit" class="submit-btn" :loading="loading" size="large">
          生成候选方案
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { pcTextArr } from 'element-china-area-data'

const props = defineProps({
  loading: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const areaOptions = ref([])
const featureTags = ['风格化起名', '可精修候选', '本地保存', '分享友好']

const styleProfiles = [
  { label: '新中式典雅', value: '新中式典雅', note: '传统底蕴和现代感均衡' },
  { label: '诗意清冷', value: '诗意清冷', note: '更克制、更有留白感' },
  { label: '明朗现代', value: '明朗现代', note: '更适合年轻家庭审美' },
  { label: '温润书卷', value: '温润书卷', note: '更强调书香气与亲和感' },
  { label: '松弛治愈', value: '松弛治愈', note: '更轻盈、自然、好亲近' }
]

const traitOptions = ['独特但不过火', '朗朗上口', '温柔坚定', '少年感', '松弛治愈', '大气稳重']

const hourOptions = [
  { label: '子时（23:00-00:59）', value: '子时' },
  { label: '丑时（01:00-02:59）', value: '丑时' },
  { label: '寅时（03:00-04:59）', value: '寅时' },
  { label: '卯时（05:00-06:59）', value: '卯时' },
  { label: '辰时（07:00-08:59）', value: '辰时' },
  { label: '巳时（09:00-10:59）', value: '巳时' },
  { label: '午时（11:00-12:59）', value: '午时' },
  { label: '未时（13:00-14:59）', value: '未时' },
  { label: '申时（15:00-16:59）', value: '申时' },
  { label: '酉时（17:00-18:59）', value: '酉时' },
  { label: '戌时（19:00-20:59）', value: '戌时' },
  { label: '亥时（21:00-22:59）', value: '亥时' }
]

const createDefaultForm = () => ({
  gender: 'male',
  birthDate: '',
  birthHour: '',
  birthPlace: [],
  fatherName: '',
  motherName: '',
  expectation: '',
  styleProfile: '新中式典雅',
  preferredTraits: ['朗朗上口', '独特但不过火'],
  avoidChars: '',
  avoidSounds: ''
})

const formData = reactive(createDefaultForm())

const rules = {
  gender: [{ required: true, message: '请选择宝宝性别', trigger: 'change' }],
  styleProfile: [{ required: true, message: '请选择风格路线', trigger: 'change' }],
  expectation: [{ required: true, message: '请填写父母期待，至少给模型一个明确方向', trigger: 'blur' }]
}

const applyInitialData = (data) => {
  const next = createDefaultForm()
  Object.assign(next, data || {})

  if (typeof next.birthPlace === 'string') {
    next.birthPlace = next.birthPlace ? next.birthPlace.split(' ') : []
  }

  Object.assign(formData, next)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  emit('submit', {
    ...formData,
    birthPlace: Array.isArray(formData.birthPlace) ? formData.birthPlace.join(' ') : formData.birthPlace
  })
}

onMounted(() => {
  areaOptions.value = pcTextArr
})

watch(
  () => props.initialData,
  (value) => {
    if (value) {
      applyInitialData(value)
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.name-form-card {
  border-radius: 28px;
  border: 1px solid rgba(174, 83, 39, 0.18);
  background: rgba(255, 252, 247, 0.92);
  box-shadow: 0 24px 60px rgba(92, 44, 16, 0.08);
  backdrop-filter: blur(14px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0 0 8px;
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #7a2718;
}

.card-header p {
  margin: 0;
  color: #7b6c63;
  line-height: 1.6;
}

.feature-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.feature-tag {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(167, 83, 36, 0.08);
  color: #8d4327;
  font-size: 13px;
}

.name-form :deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
}

.name-form :deep(.el-radio-group) {
  display: flex;
}

.name-form :deep(.el-radio-button__inner) {
  min-width: 96px;
}

.option-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.option-note {
  color: #9c8b81;
  font-size: 12px;
}

.helper-copy {
  margin: 4px 0 22px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 245, 235, 0.85);
  color: #7a5c4c;
  line-height: 1.7;
}

.submit-row {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #9d3f24, #d57c34);
  box-shadow: 0 16px 30px rgba(157, 63, 36, 0.22);
  font-family: 'Noto Serif SC', serif;
  font-size: 17px;
  letter-spacing: 1px;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
