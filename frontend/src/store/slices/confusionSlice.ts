import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ConfusionEvent {
  segment_id: string
  score: number
  type: 'syntax' | 'logic' | 'semantic' | 'conceptual'
  timestamp: string
}

interface ConfusionState {
  events: ConfusionEvent[]
  currentScore: number
  detectionEnabled: boolean
}

const initialState: ConfusionState = {
  events: [],
  currentScore: 0,
  detectionEnabled: true,
}

const confusionSlice = createSlice({
  name: 'confusion',
  initialState,
  reducers: {
    addConfusionEvent: (state, action: PayloadAction<ConfusionEvent>) => {
      state.events.push(action.payload)
      state.currentScore = action.payload.score
    },
    setDetectionEnabled: (state, action: PayloadAction<boolean>) => {
      state.detectionEnabled = action.payload
    },
    clearConfusionEvents: (state) => {
      state.events = []
      state.currentScore = 0
    },
  },
})

export const { addConfusionEvent, setDetectionEnabled, clearConfusionEvents } =
  confusionSlice.actions

export default confusionSlice.reducer
