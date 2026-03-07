import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CodeSegment {
  id: string
  type: string
  code: string
  line_start: number
  line_end: number
  complexity: number
  confusion_score: number
}

interface AnalysisState {
  currentAnalysisId: string | null
  status: 'idle' | 'pending' | 'completed' | 'failed'
  segments: CodeSegment[]
  confusionHeatmap: any
  error: string | null
}

const initialState: AnalysisState = {
  currentAnalysisId: null,
  status: 'idle',
  segments: [],
  confusionHeatmap: null,
  error: null,
}

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalysisId: (state, action: PayloadAction<string>) => {
      state.currentAnalysisId = action.payload
      state.status = 'pending'
    },
    setAnalysisStatus: (state, action: PayloadAction<AnalysisState['status']>) => {
      state.status = action.payload
    },
    setSegments: (state, action: PayloadAction<CodeSegment[]>) => {
      state.segments = action.payload
    },
    setConfusionHeatmap: (state, action: PayloadAction<any>) => {
      state.confusionHeatmap = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.status = 'failed'
    },
    resetAnalysis: (state) => {
      return initialState
    },
  },
})

export const {
  setAnalysisId,
  setAnalysisStatus,
  setSegments,
  setConfusionHeatmap,
  setError,
  resetAnalysis,
} = analysisSlice.actions

export default analysisSlice.reducer
