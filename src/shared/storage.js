export const readStorage = (key, fallbackValue) => {
  if (typeof window === 'undefined') return fallbackValue
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallbackValue
    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

export const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}
