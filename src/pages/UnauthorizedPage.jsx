import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getJson, joinUrl } from '../api/http.js'
import { API_BASE_URL } from '../shared/constants.js'

function UnauthorizedPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const startLineLogin = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const url = joinUrl(API_BASE_URL, '/line/connect/url')
      const data = await getJson(url)
      if (!data?.url) throw new Error('Missing LINE login url')
      if (data.state) window.sessionStorage.setItem('line:oauth_state', String(data.state))
      const rawAuthorizeUrl = String(data.url).replaceAll('`', '').trim()
      window.location.assign(rawAuthorizeUrl)
    } catch {
      setError('ไม่สามารถเริ่มเข้าสู่ระบบ LINE ได้')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    startLineLogin()
  }, [startLineLogin])

  return (
    <div className="profilePage">
      <div className="profileCard">
        <div className="profileName">ยังไม่ได้เข้าสู่ระบบ LINE</div>
        <div className="profileMeta">
          {isLoading ? 'กำลังพาไปหน้าเข้าสู่ระบบ…' : error || 'กรุณาเข้าสู่ระบบก่อนใช้งาน แล้วลองใหม่อีกครั้ง'}
        </div>
        {!isLoading ? (
          <>
            <button type="button" className="menuRetryButton" onClick={startLineLogin}>
              เข้าสู่ระบบ LINE
            </button>
            <button type="button" className="menuRetryButton" onClick={() => navigate('/')}>
              กลับหน้าเมนู
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default UnauthorizedPage
