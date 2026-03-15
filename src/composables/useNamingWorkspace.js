import { computed, ref, watch } from 'vue'

const WORKSPACE_KEY = 'qzjm-workspace-v1'
const HISTORY_KEY = 'qzjm-history-v1'
const HISTORY_LIMIT = 6

const clone = (value) => JSON.parse(JSON.stringify(value))

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

const createEmptyWorkspace = () => ({
  request: null,
  candidates: [],
  compareIds: [],
  selectedCandidateId: '',
  nicknames: [],
  baziResult: null
})

export function useNamingWorkspace() {
  const currentRequest = ref(null)
  const candidates = ref([])
  const compareIds = ref([])
  const selectedCandidateId = ref('')
  const nicknames = ref([])
  const baziResult = ref(null)
  const history = ref([])
  const isReady = ref(false)

  const persistWorkspace = () => {
    if (typeof window === 'undefined' || !isReady.value) return

    const payload = {
      request: currentRequest.value,
      candidates: candidates.value,
      compareIds: compareIds.value,
      selectedCandidateId: selectedCandidateId.value,
      nicknames: nicknames.value,
      baziResult: baziResult.value
    }
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(payload))
  }

  const persistHistory = () => {
    if (typeof window === 'undefined' || !isReady.value) return
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  const loadState = () => {
    if (typeof window === 'undefined') return

    const workspace = safeParse(window.localStorage.getItem(WORKSPACE_KEY), createEmptyWorkspace())
    const snapshots = safeParse(window.localStorage.getItem(HISTORY_KEY), [])

    currentRequest.value = workspace.request || null
    candidates.value = Array.isArray(workspace.candidates) ? workspace.candidates : []
    compareIds.value = Array.isArray(workspace.compareIds) ? workspace.compareIds : []
    selectedCandidateId.value = workspace.selectedCandidateId || candidates.value[0]?.id || ''
    nicknames.value = Array.isArray(workspace.nicknames) ? workspace.nicknames : []
    baziResult.value = workspace.baziResult || null
    history.value = Array.isArray(snapshots) ? snapshots : []
    isReady.value = true
  }

  const resetTransient = () => {
    candidates.value = []
    compareIds.value = []
    selectedCandidateId.value = ''
    nicknames.value = []
    baziResult.value = null
  }

  const setRequest = (request) => {
    currentRequest.value = request ? clone(request) : null
  }

  const startNewSession = (request) => {
    setRequest(request)
    resetTransient()
  }

  const setCandidates = (list) => {
    candidates.value = clone(list)
    compareIds.value = []
    selectedCandidateId.value = candidates.value[0]?.id || ''
  }

  const appendCandidates = (list) => {
    const incoming = clone(list)
    candidates.value = [...incoming, ...candidates.value]
    selectedCandidateId.value = incoming[0]?.id || selectedCandidateId.value
  }

  const setNicknames = (list) => {
    nicknames.value = clone(list)
  }

  const setBaziResult = (result) => {
    baziResult.value = result ? clone(result) : null
  }

  const toggleFavorite = (candidateId) => {
    const candidate = candidates.value.find((item) => item.id === candidateId)
    if (!candidate) return
    candidate.favorite = !candidate.favorite
  }

  const toggleCompare = (candidateId) => {
    const exists = compareIds.value.includes(candidateId)
    if (exists) {
      compareIds.value = compareIds.value.filter((id) => id !== candidateId)
      return
    }

    if (compareIds.value.length >= 4) {
      compareIds.value = [...compareIds.value.slice(1), candidateId]
      return
    }

    compareIds.value = [...compareIds.value, candidateId]
  }

  const selectCandidate = (candidateId) => {
    if (candidates.value.some((item) => item.id === candidateId)) {
      selectedCandidateId.value = candidateId
    }
  }

  const clearCompare = () => {
    compareIds.value = []
  }

  const saveSnapshot = (reason = 'manual') => {
    if (!currentRequest.value || !candidates.value.length) return

    const snapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reason,
      request: clone(currentRequest.value),
      candidates: clone(candidates.value),
      compareIds: clone(compareIds.value),
      selectedCandidateId: selectedCandidateId.value,
      nicknames: clone(nicknames.value),
      baziResult: clone(baziResult.value),
      updatedAt: new Date().toISOString()
    }

    const filtered = history.value.filter((item) => item.selectedCandidateId !== snapshot.selectedCandidateId || item.updatedAt !== snapshot.updatedAt)
    history.value = [snapshot, ...filtered].slice(0, HISTORY_LIMIT)
  }

  const restoreSnapshot = (snapshot) => {
    if (!snapshot) return
    currentRequest.value = clone(snapshot.request || null)
    candidates.value = clone(snapshot.candidates || [])
    compareIds.value = clone(snapshot.compareIds || [])
    selectedCandidateId.value = snapshot.selectedCandidateId || candidates.value[0]?.id || ''
    nicknames.value = clone(snapshot.nicknames || [])
    baziResult.value = clone(snapshot.baziResult || null)
  }

  const favorites = computed(() => candidates.value.filter((item) => item.favorite))
  const selectedCandidate = computed(() => candidates.value.find((item) => item.id === selectedCandidateId.value) || null)
  const compareCandidates = computed(() => candidates.value.filter((item) => compareIds.value.includes(item.id)))

  watch(
    [currentRequest, candidates, compareIds, selectedCandidateId, nicknames, baziResult],
    () => {
      persistWorkspace()
    },
    { deep: true }
  )

  watch(history, () => {
    persistHistory()
  }, { deep: true })

  loadState()

  return {
    currentRequest,
    candidates,
    compareIds,
    selectedCandidateId,
    selectedCandidate,
    compareCandidates,
    favorites,
    nicknames,
    baziResult,
    history,
    startNewSession,
    setRequest,
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
  }
}
