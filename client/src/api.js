import axios from "axios"

export const API_BASE_URL = "http://localhost:5000"
const TOKEN_STORAGE_KEY = "smart-choice-maker-token"

export const api = axios.create({
  baseURL: API_BASE_URL
})

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  delete api.defaults.headers.common.Authorization
}
