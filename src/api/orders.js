import { API_BASE_URL } from '../shared/constants.js'
import { getJson, joinUrl, postJson } from './http.js'

export const getOrder = async (orderId, { signal } = {}) => {
  const url = joinUrl(API_BASE_URL, `/orders/${orderId}`)
  return getJson(url, { signal })
}

export const getOrderHistory = async ({ page = 1, limit = 10, signal } = {}) => {
  const url = new URL(joinUrl(API_BASE_URL, '/order-history'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  return getJson(url.toString(), { signal })
}

export const createOrder = async ({ customerName, items, signal } = {}) => {
  const url = joinUrl(API_BASE_URL, '/orders')
  const body = { customerName, items }
  return postJson(url, { body, signal })
}
