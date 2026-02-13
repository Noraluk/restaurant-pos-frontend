import { getJson, joinUrl } from './http.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export const fetchMenus = async ({ page = 1, limit = 20, signal } = {}) => {
  const url = new URL(joinUrl(API_BASE_URL, '/menus'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  return getJson(url.toString(), { signal })
}

