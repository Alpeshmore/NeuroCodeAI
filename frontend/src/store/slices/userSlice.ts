import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: string | null
  email: string | null
  learning_level: 'beginner' | 'intermediate' | 'advanced'
  preferred_languages: string[]
  isAuthenticated: boolean
}

const initialState: UserState = {
  id: null,
  email: null,
  learning_level: 'intermediate',
  preferred_languages: ['python', 'javascript'],
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload, isAuthenticated: true }
    },
    setLearningLevel: (state, action: PayloadAction<UserState['learning_level']>) => {
      state.learning_level = action.payload
    },
    logout: (state) => {
      return initialState
    },
  },
})

export const { setUser, setLearningLevel, logout } = userSlice.actions

export default userSlice.reducer
