import { ref } from 'vue'

const DEFAULT_STYLE_PROFILE = '新中式典雅'

const ensureText = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return fallback
}

const clampScore = (value, fallback = 8.2) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.min(10, numeric))
}

const formatBirthDate = (birthDate) => {
  if (!birthDate) return '未知'
  try {
    return new Date(birthDate).toLocaleDateString('zh-CN')
  } catch (error) {
    return '未知'
  }
}

const createCandidateId = (index) => `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`

const normalizeCharacters = (characters, name) => {
  if (Array.isArray(characters) && characters.length) {
    return characters.slice(0, 2).map((item, index) => ({
      char: ensureText(item?.char, name[index + 1] || name[index] || '名'),
      meaning: ensureText(item?.meaning, '寓意待补充')
    }))
  }

  const rawChars = Array.from(name.slice(1)).slice(0, 2)
  return rawChars.map((char) => ({
    char,
    meaning: '寓意待补充'
  }))
}

const normalizePracticalHints = (hints) => ({
  rareCharRisk: ensureText(hints?.rareCharRisk, '常用字优先，书写压力较低。'),
  pronunciationRisk: ensureText(hints?.pronunciationRisk, '发音清晰，日常称呼顺口。'),
  duplicateRisk: ensureText(hints?.duplicateRisk, '暂无明显撞名提醒，建议结合本地同龄人常用名再确认。')
})

const normalizeNameCandidate = (candidate, context, index, origin = 'initial') => {
  const name = ensureText(candidate?.name, `灵感方案${index + 1}`)
  const overall = ensureText(candidate?.overall, '整体气质温润克制，兼顾传统意味与现代审美。')

  return {
    id: createCandidateId(index),
    origin,
    favorite: false,
    name,
    characters: normalizeCharacters(candidate?.characters, name),
    overall,
    reference: ensureText(candidate?.reference, '无'),
    wuxing: ensureText(candidate?.wuxing, '待分析'),
    scores: {
      yinyun: clampScore(candidate?.scores?.yinyun, 8.5),
      ziyi: clampScore(candidate?.scores?.ziyi, 8.4),
      wenhua: clampScore(candidate?.scores?.wenhua, 8.3)
    },
    styleProfile: ensureText(candidate?.styleProfile, context.styleProfile || DEFAULT_STYLE_PROFILE),
    plainSummary: ensureText(candidate?.plainSummary, overall),
    modernScore: clampScore(candidate?.modernScore, 8.2),
    practicalHints: normalizePracticalHints(candidate?.practicalHints)
  }
}

const normalizeNameResult = (payload, context, origin = 'initial') => {
  const names = Array.isArray(payload?.names) ? payload.names : []
  if (!names.length) {
    throw new Error('API 返回的 JSON 格式不正确，缺少 names 数组')
  }

  return {
    names: names.map((item, index) => normalizeNameCandidate(item, context, index, origin))
  }
}

const normalizeNicknameResult = (payload) => {
  if (!Array.isArray(payload)) {
    throw new Error('API 返回的 JSON 格式不正确，应为数组')
  }

  return payload.map((item, index) => ({
    id: `nickname-${Date.now()}-${index}`,
    nickname: ensureText(item?.nickname, `小名${index + 1}`),
    style: ensureText(item?.style, '叠字型'),
    meaning: ensureText(item?.meaning, '寓意待补充'),
    relatedChar: ensureText(item?.relatedChar, '')
  }))
}

const normalizeBaziResult = (payload) => {
  if (!payload?.sizhu || !payload?.wuxing) {
    throw new Error('API 返回的 JSON 格式不正确')
  }

  return {
    sizhu: payload.sizhu,
    wuxing: {
      stats: payload.wuxing.stats || {},
      strength: payload.wuxing.strength || {},
      analysis: ensureText(payload.wuxing.analysis, '五行分析待补充')
    },
    xiyongshen: {
      xishen: Array.isArray(payload.xiyongshen?.xishen) ? payload.xiyongshen.xishen : [],
      yongshen: ensureText(payload.xiyongshen?.yongshen, '待补充'),
      jishen: Array.isArray(payload.xiyongshen?.jishen) ? payload.xiyongshen.jishen : [],
      explanation: ensureText(payload.xiyongshen?.explanation, '喜用神解释待补充')
    },
    mingli: {
      personality: ensureText(payload.mingli?.personality, '性格解读待补充'),
      fortune: ensureText(payload.mingli?.fortune, '运势倾向待补充'),
      suggestions: ensureText(payload.mingli?.suggestions, '取名建议待补充')
    }
  }
}

const extractJsonObject = (text) => {
  const match = text.trim().match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('API 返回格式异常，无法解析为 JSON')
  }
  return match[0]
}

const extractJsonArray = (text) => {
  const match = text.trim().match(/\[[\s\S]*\]/)
  if (!match) {
    throw new Error('API 返回格式异常，无法解析为 JSON')
  }
  return match[0]
}

const parseErrorMessage = async (response) => {
  let errMsg = `API 请求失败: ${response.status}`

  try {
    const errData = await response.clone().json()
    errMsg = errData.error?.message || errData.message || JSON.stringify(errData)
  } catch (error) {
    try {
      const errText = await response.clone().text()
      if (errText) errMsg = errText
    } catch (innerError) {
      return errMsg
    }
  }

  return errMsg
}

const createClientConfig = () => {
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'
  const model = import.meta.env.VITE_LLM_MODEL || 'gpt-4o'

  if (!apiKey) {
    throw new Error('未配置 API Key，请在 .env.local 中设置 VITE_LLM_API_KEY')
  }

  return { apiKey, baseUrl, model }
}

const requestCompletion = async ({ messages, temperature, maxTokens, stream = false }) => {
  const { apiKey, baseUrl, model } = createClientConfig()
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    })
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response
}

const readStreamedContent = async (response, onChunk) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) {
          onChunk(content)
        }
      } catch (error) {
        // Ignore malformed SSE chunks and continue reading.
      }
    }
  }
}

const buildNamePrompt = (formData, options = {}) => {
  const { gender, birthDate, birthPlace, fatherName, motherName, expectation, styleProfile, preferredTraits, avoidChars, avoidSounds } = formData
  const traits = Array.isArray(preferredTraits) && preferredTraits.length ? preferredTraits.join('、') : '好听、耐看、不过时'
  const excludedChars = ensureText(avoidChars, '无')
  const excludedSounds = ensureText(avoidSounds, '无')
  const targetCount = options.mode === 'refine' ? 3 : 4
  const refineBlock = options.mode === 'refine'
    ? `
你需要围绕以下候选名做定向精修，而不是完全脱离上下文重写：
- 当前候选：${options.baseCandidates.map((item) => item.name).join('、')}
- 精修方向：${options.direction}
- 锁定条件：${options.lockedConstraints || '保留整体气质与父母期待的一致性'}`
    : ''

  return `你是一位兼具传统文化功底与现代品牌感的中文命名顾问，精通八字五行、音韵学、诗词典故。
请根据以下宝宝信息，给出 ${targetCount} 个适合在当代使用、同时保留文化底蕴的名字方案。${refineBlock}

宝宝信息：
- 性别：${gender === 'male' ? '男' : '女'}
- 出生日期：${formatBirthDate(birthDate)}
- 出生地：${birthPlace || '未知'}
- 父亲姓名：${fatherName || '未知'}
- 母亲姓名：${motherName || '未知'}
- 父母对孩子的期待：${expectation || '健康快乐，平安长大'}
- 风格路线：${styleProfile || DEFAULT_STYLE_PROFILE}
- 偏好特质：${traits}
- 避开用字：${excludedChars}
- 避开发音：${excludedSounds}

【核心命名原则】请严格按照以下顺序和要点生成名字：

1. 【八字五行】根据出生日期分析五行喜忌，优先使用喜用神所属五行的字。如果八字缺水，名字中可选"沐、涵、润、泉"等属水的字；如果缺木，可选"林、森、荣、桐"等属木的字。

2. 【音韵和谐】名字的发音要：
   - 声调搭配协调，避免全是平声或全是仄声，最好平仄相间
   - 避免谐音歧义（如"史珍香"、"杜子腾"等）
   - 韵母搭配顺口

3. 【诗词典故】优先从以下经典中寻找出处：
   - 《诗经》："桃之夭夭，灼灼其华"、"高山仰止，景行行止"
   - 《楚辞》："路漫漫其修远兮"、"制芰荷以为衣兮"
   - 唐诗宋词名句
   - 成语典故

4. 【寓意美好】名字整体要表达积极向上的寓意，可从以下角度：
   - 品德品质：仁、义、礼、智、信
   - 自然景物：山、川、湖、海、日、月、星、云
   - 美好祝愿：福、禄、寿、喜、安、康
   - 学识才华：文、章、博、学、思、慧

5. 【字形美观】避免：
   - 过于复杂的生僻字
   - 笔画过多难以书写
   - 结构不平衡

要求：
1. 姓氏优先跟随父亲姓名的首字；若未提供父亲姓名，可自选常见姓氏。
2. 名字要兼顾传统文化出处与现代使用体验，避免过度生僻、过度玄学、过度模板化。
3. 以严格 JSON 格式返回，不要包含解释文本、Markdown 代码块或多余前后缀。
4. 只返回如下结构：
{
  "names": [
    {
      "name": "完整名字（含姓氏）",
      "characters": [
        { "char": "名的第一个字", "meaning": "单字释义" },
        { "char": "名的第二个字", "meaning": "单字释义" }
      ],
      "overall": "整体寓意说明",
      "reference": "出处典故或无（如：《诗经·桃夭》"桃之夭夭，灼灼其华"）",
      "wuxing": "该名字偏向的五行（如：木、火、土、金、水）",
      "scores": {
        "yinyun": 8.5,
        "ziyi": 8.8,
        "wenhua": 8.3
      },
      "styleProfile": "风格路线名称",
      "plainSummary": "用一句白话概括这个名字为什么适合现在的年轻家庭",
      "modernScore": 8.4,
      "practicalHints": {
        "rareCharRisk": "是否生僻、书写负担如何",
        "pronunciationRisk": "是否容易误读、日常称呼是否顺口",
        "duplicateRisk": "是否容易撞名"
      }
    }
  ]
}
5. 每个分数字段为 0-10 分，可保留 1 位小数。`
}

const buildNicknamePrompt = (options) => {
  const { styles, linkToFormalName, count, formalName, gender } = options
  const styleStr = styles.join('、')
  const formalNamePart = linkToFormalName && formalName
    ? `\n- 正式名字：${formalName}（尽量借用正式名字的某个字或气质）`
    : ''

  return `你是一位擅长为年轻家庭设计中文乳名的命名顾问。
请根据以下信息为宝宝生成 ${count} 个小名。

宝宝信息：
- 性别：${gender === 'male' ? '男' : '女'}${formalNamePart}
- 风格偏好：${styleStr}

要求：
1. 小名亲切、朗朗上口、适合家庭日常称呼。
2. 以严格 JSON 数组格式返回，不要包含解释文本或 Markdown。
3. 每个元素包含字段：nickname、style、meaning、relatedChar。
4. style 只能取：叠字型、动物型、食物型、自然型、英文音译。`
}

const buildBaziPrompt = (baziData) => {
  const { gender, birthDate, birthHour, birthPlace } = baziData

  return `你是一位精通中国传统命理学、但表达方式现代易懂的八字分析顾问。请根据以下信息进行分析。

宝宝信息：
- 性别：${gender === 'male' ? '男' : '女'}
- 出生日期：${formatBirthDate(birthDate)}
- 出生时辰：${birthHour || '未知'}
- 出生地：${birthPlace || '未知'}

要求：
1. 根据出生日期和时辰排出四柱八字（年柱、月柱、日柱、时柱）。
2. 分析五行强弱并统计数量。
3. 给出喜用神、忌神和面向普通家庭的解释。
4. 返回严格 JSON，不要包含 Markdown 或额外文本。
5. 结构如下：
{
  "sizhu": {
    "year": {"gan": "甲", "zhi": "子", "shishen": "正印", "wuxing": "木水"},
    "month": {"gan": "丙", "zhi": "寅", "shishen": "食神", "wuxing": "火木"},
    "day": {"gan": "戊", "zhi": "午", "shishen": "日主", "wuxing": "土火"},
    "hour": {"gan": "壬", "zhi": "戌", "shishen": "正财", "wuxing": "水土"}
  },
  "wuxing": {
    "stats": {"金": 0, "木": 2, "水": 2, "火": 2, "土": 2},
    "strength": {"旺": ["火"], "相": ["土"], "休": ["木"], "囚": ["水"], "死": ["金"]},
    "analysis": "面向普通家长的五行解读"
  },
  "xiyongshen": {
    "xishen": ["金", "水"],
    "yongshen": "金",
    "jishen": ["火", "土"],
    "explanation": "喜用神分析说明"
  },
  "mingli": {
    "personality": "性格特点",
    "fortune": "运势倾向",
    "suggestions": "取名建议"
  }
}`
}

export function useLLM() {
  const loading = ref(false)
  const refineLoading = ref(false)
  const streaming = ref(false)
  const result = ref(null)
  const error = ref(null)
  const partialContent = ref('')
  const showThinkingTip = ref(false)

  const nicknameLoading = ref(false)
  const nicknames = ref([])
  const nicknameError = ref(null)

  const baziLoading = ref(false)
  const baziResult = ref(null)
  const baziError = ref(null)

  let thinkingTipTimer = null

  const clearNameState = () => {
    result.value = null
    error.value = null
    partialContent.value = ''
    showThinkingTip.value = false
  }

  const generateNames = async (formData) => {
    loading.value = true
    streaming.value = true
    clearNameState()

    thinkingTipTimer = setTimeout(() => {
      showThinkingTip.value = true
    }, 15000)

    try {
      const prompt = buildNamePrompt(formData)
      const response = await requestCompletion({
        messages: [
          { role: 'system', content: '你是一个中文命名专家，只输出符合格式要求的 JSON 字符串。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        maxTokens: 2500,
        stream: true
      })

      await readStreamedContent(response, (chunk) => {
        partialContent.value += chunk
      })

      const json = extractJsonObject(partialContent.value)
      const parsed = JSON.parse(json)
      result.value = normalizeNameResult(parsed, formData, 'initial')
      return result.value
    } catch (err) {
      console.error('LLM Name API Error:', err)
      error.value = err.message || '生成名字时发生错误'
      throw err
    } finally {
      loading.value = false
      streaming.value = false
      clearTimeout(thinkingTipTimer)
    }
  }

  const refineNames = async ({ request, baseCandidates, direction, lockedConstraints }) => {
    refineLoading.value = true
    error.value = null

    try {
      const prompt = buildNamePrompt(request, {
        mode: 'refine',
        baseCandidates,
        direction,
        lockedConstraints
      })
      const response = await requestCompletion({
        messages: [
          { role: 'system', content: '你是一个中文命名专家，只输出符合格式要求的 JSON 字符串。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.75,
        maxTokens: 2200
      })

      const data = await response.json()
      const content = ensureText(data.choices?.[0]?.message?.content, '')
      if (!content) {
        throw new Error('精修结果为空，请稍后重试')
      }

      const json = extractJsonObject(content)
      const parsed = JSON.parse(json)
      return normalizeNameResult(parsed, request, 'refine')
    } catch (err) {
      console.error('LLM Refine API Error:', err)
      error.value = err.message || '精修名字时发生错误'
      throw err
    } finally {
      refineLoading.value = false
    }
  }

  const regenerate = () => {
    clearNameState()
  }

  const generateNicknames = async (options) => {
    nicknameLoading.value = true
    nicknameError.value = null
    nicknames.value = []

    try {
      const response = await requestCompletion({
        messages: [
          { role: 'system', content: '你是一个起小名的专家，只输出符合格式要求的 JSON 数组字符串。' },
          { role: 'user', content: buildNicknamePrompt(options) }
        ],
        temperature: 0.8,
        maxTokens: 1500
      })

      const data = await response.json()
      const content = ensureText(data.choices?.[0]?.message?.content, '')

      if (!content) {
        throw new Error('API 返回为空，请检查 API 配置或稍后重试')
      }

      const json = extractJsonArray(content)
      nicknames.value = normalizeNicknameResult(JSON.parse(json))
      return nicknames.value
    } catch (err) {
      console.error('LLM Nickname API Error:', err)
      nicknameError.value = err.message || '生成小名时发生错误'
      throw err
    } finally {
      nicknameLoading.value = false
    }
  }

  const regenerateNicknames = () => {
    nicknames.value = []
    nicknameError.value = null
  }

  const generateBaziAnalysis = async (data) => {
    baziLoading.value = true
    baziError.value = null
    baziResult.value = null

    try {
      const response = await requestCompletion({
        messages: [
          { role: 'system', content: '你是一个命理专家，只输出符合格式要求的 JSON 字符串。' },
          { role: 'user', content: buildBaziPrompt(data) }
        ],
        temperature: 0.3,
        maxTokens: 3000
      })

      const json = await response.json()
      const content = ensureText(json.choices?.[0]?.message?.content, '')

      if (!content) {
        throw new Error('API 返回为空，请检查 API 配置或稍后重试')
      }

      baziResult.value = normalizeBaziResult(JSON.parse(extractJsonObject(content)))
      return baziResult.value
    } catch (err) {
      console.error('LLM Bazi API Error:', err)
      baziError.value = err.message || '生成八字分析时发生错误'
      throw err
    } finally {
      baziLoading.value = false
    }
  }

  const regenerateBaziAnalysis = () => {
    baziResult.value = null
    baziError.value = null
  }

  return {
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
    result,
    error,
    partialContent,
    showThinkingTip,
    nicknameLoading,
    nicknames,
    nicknameError,
    baziLoading,
    baziResult,
    baziError
  }
}
