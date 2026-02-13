import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ACCESS_TOKEN_STORAGE_KEY, getJson, joinUrl } from '../api/http.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const USER_NAME_STORAGE_KEY = 'restaurant_pos:userName'
const USER_PICTURE_STORAGE_KEY = 'restaurant_pos:pictureUrl'

function LineConnectCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [requestError, setRequestError] = useState('')

  const { code, state } = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      code: params.get('code') || '',
      state: params.get('state') || '',
    }
  }, [location.search])

  const validationError = useMemo(() => {
    if (!code || !state) return 'ข้อมูลเข้าสู่ระบบไม่ครบถ้วน'
    const expectedState = window.sessionStorage.getItem('line:oauth_state')
    if (expectedState && expectedState !== state) return 'state ไม่ถูกต้อง'
    return ''
  }, [code, state])

  useEffect(() => {
    if (validationError) return

    const controller = new AbortController()
    const run = async () => {
      try {
        const url = new URL(joinUrl(API_BASE_URL, '/line/connect/callback'))
        url.searchParams.set('code', code)
        url.searchParams.set('state', state)
        const data = await getJson(url.toString(), { signal: controller.signal })
        const displayName = data?.profile?.displayName
        if (displayName) window.localStorage.setItem(USER_NAME_STORAGE_KEY, JSON.stringify(displayName))
        const pictureUrl = data?.profile?.pictureUrl
        if (pictureUrl) window.localStorage.setItem(USER_PICTURE_STORAGE_KEY, JSON.stringify(pictureUrl))
        const accessToken = data?.token?.accessToken
        if (accessToken) window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(accessToken))
        if (displayName) window.dispatchEvent(new CustomEvent('auth:userName', { detail: displayName }))
        if (pictureUrl) window.dispatchEvent(new CustomEvent('auth:pictureUrl', { detail: pictureUrl }))
        window.sessionStorage.removeItem('line:oauth_state')
        navigate('/', { replace: true })
      } catch (err) {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        setRequestError('เข้าสู่ระบบไม่สำเร็จ')
      }
    }

    run()
    return () => controller.abort()
  }, [code, navigate, state, validationError])

  const error = validationError || requestError

  if (!error) {
    return (
      <div className="authCallbackFull">
        <div className="loadingSpinner" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="profilePage">
      <div className="profileCard">
        <div className="profileName">เข้าสู่ระบบไม่สำเร็จ</div>
        <div className="profileMeta" role="status" aria-live="polite">
          {error}
        </div>
        {error ? (
          <button type="button" className="menuRetryButton" onClick={() => navigate('/')}>
            กลับหน้าเมนู
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default LineConnectCallbackPage
