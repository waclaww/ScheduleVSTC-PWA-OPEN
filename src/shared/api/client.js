import axios from 'axios'
import { API_TIMEOUT } from '../config'

// Запросы идут на /api: в dev его проксирует Vite (см. vite.config.js), в проде — веб-сервер
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: API_TIMEOUT,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
