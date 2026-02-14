import { getJson, joinUrl } from './http.js'
import { API_BASE_URL } from '../shared/constants.js'

export const fetchMenus = async ({ page = 1, limit = 20, signal } = {}) => {
  const url = new URL(joinUrl(API_BASE_URL, '/menus'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  return getJson(url.toString(), { signal })
}
