import axios from 'axios'

export class HttpError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}

export const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return path
  return new URL(path, baseUrl).toString()
}

export const ACCESS_TOKEN_STORAGE_KEY = 'restaurant_pos:accessToken'

const buildAuthHeaders = () => {
  const headers = {}
  if (typeof window === 'undefined') return headers
  try {
    const raw = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    const token = raw ? JSON.parse(raw) : ''
    if (token) headers.Authorization = `Bearer ${token}`
  } catch {
    void 0
  }
  return headers
}

export const requestJson = async (url, { method = 'GET', body, signal, headers: extraHeaders } = {}) => {
  try {
    const res = await axios.request({
      url,
      method,
      data: body,
      signal,
      headers: {
        Accept: 'application/json',
        ...buildAuthHeaders(),
        ...(extraHeaders || {}),
      },
    })
    return res.data ?? null
  } catch (err) {
    if (
      signal?.aborted ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      err?.name === 'AbortError'
    ) {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      throw abortError
    }
    const status = err?.response?.status
    if (status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api:unauthorized'))
    }
    const responseBody = err?.response?.data ?? null
    throw new HttpError('Request failed', { status, body: responseBody })
  }
}

export const getJson = (url, { signal } = {}) => requestJson(url, { method: 'GET', signal })

export const postJson = (url, { body, signal } = {}) =>
  requestJson(url, { method: 'POST', body, signal, headers: { 'Content-Type': 'application/json' } })
