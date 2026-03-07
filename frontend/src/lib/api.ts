import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.get('/auth/refresh'),
}

// Code Analysis APIs
export const analyzeCode = (code: string, language: string) =>
  api.post('/code/analyze', { code, language })

export const getAnalysis = (analysisId: string) =>
  api.get(`/code/analysis/${analysisId}`)

export const getSegments = (analysisId: string) =>
  api.get(`/code/segments/${analysisId}`)

// Confusion Detection APIs
export const detectConfusion = (data: any) =>
  api.post('/confusion/detect', data)

export const getConfusionHeatmap = (analysisId: string) =>
  api.get(`/confusion/heatmap/${analysisId}`)

// Explanation APIs
export const getExplanation = (explanationId: string) =>
  api.get(`/explanations/${explanationId}`)

export const generateExplanation = (segmentId: string, level: string) =>
  api.post('/explanations/generate', { segmentId, level })

export const rateExplanation = (explanationId: string, rating: number) =>
  api.post(`/explanations/${explanationId}/rate`, { rating })

// Learning Progress APIs
export const getLearningProgress = () =>
  api.get('/learning/progress')

export const getConcepts = () =>
  api.get('/learning/concepts')

export const submitFeedback = (data: any) =>
  api.post('/learning/feedback', data)

export default api
