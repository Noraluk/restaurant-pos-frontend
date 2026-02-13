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

export const getJson = async (url, { signal } = {}) => {
  const headers = { Accept: 'application/json' }
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
      const token = raw ? JSON.parse(raw) : ''
      if (token) headers.Authorization = `Bearer ${token}`
    } catch {
      void 0
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    signal,
  })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api:unauthorized'))
    }
    let body = null
    try {
      body = await res.json()
    } catch {
      body = null
    }
    throw new HttpError('Request failed', { status: res.status, body })
  }

  return res.json()
}
