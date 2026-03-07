import { configureStore } from '@reduxjs/toolkit'
import analysisReducer from './slices/analysisSlice'
import userReducer from './slices/userSlice'
import confusionReducer from './slices/confusionSlice'

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    user: userReducer,
    confusion: confusionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
