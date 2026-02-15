import topImage from './assets/order.png'
import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

import CartModal from './components/CartModal.jsx'
import MenuPage from './pages/MenuPage.jsx'
import LineConnectCallbackPage from './pages/LineConnectCallbackPage.jsx'
import UnauthorizedPage from './pages/UnauthorizedPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import { ACCESS_TOKEN_STORAGE_KEY } from './api/http.js'
import { createOrder } from './api/orders.js'
import { USER_NAME_STORAGE_KEY, USER_PICTURE_STORAGE_KEY } from './shared/constants.js'
import { readStorage, writeStorage } from './shared/storage.js'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMenuPage = location.pathname === '/'
  const isAuthCallbackPage = location.pathname === '/line/connect/callback'
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userName, setUserName] = useState(() => readStorage(USER_NAME_STORAGE_KEY, 'ผู้ใช้'))
  const [userPictureUrl, setUserPictureUrl] = useState(() => readStorage(USER_PICTURE_STORAGE_KEY, ''))

  const addToCart = (item) => {
    setCart((prev) => [...prev, item])
  }

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const confirmOrder = useCallback(
    async (items) => {
      const countsById = new Map()
      for (const item of Array.isArray(items) ? items : []) {
        const key = item?.id
        if (!key) continue
        countsById.set(key, (countsById.get(key) || 0) + 1)
      }
      const payloadItems = Array.from(countsById.entries()).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }))
      const body = {
        customerName: userName || 'ผู้ใช้',
        items: payloadItems,
      }
      await createOrder(body)
    },
    [userName]
  )

  useEffect(() => {
    writeStorage(USER_NAME_STORAGE_KEY, userName)
  }, [userName])

  useEffect(() => {
    writeStorage(USER_PICTURE_STORAGE_KEY, userPictureUrl)
  }, [userPictureUrl])

  useEffect(() => {
    if (!isCartOpen || !isMenuPage) return
    const onKeyDown = (e) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeCart, isCartOpen, isMenuPage])

  useEffect(() => {
    const onUnauthorized = () => {
      closeCart()
      try {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        window.localStorage.removeItem(USER_PICTURE_STORAGE_KEY)
      } catch {
        return
      }
      navigate('/unauthorized', { replace: true })
    }
    window.addEventListener('api:unauthorized', onUnauthorized)
    return () => window.removeEventListener('api:unauthorized', onUnauthorized)
  }, [closeCart, navigate])

  useEffect(() => {
    const onUserName = (e) => {
      const next = e?.detail
      if (typeof next !== 'string' || !next) return
      setUserName(next)
    }
    window.addEventListener('auth:userName', onUserName)
    return () => window.removeEventListener('auth:userName', onUserName)
  }, [])

  useEffect(() => {
    const onPictureUrl = (e) => {
      const next = e?.detail
      if (typeof next !== 'string') return
      setUserPictureUrl(next)
    }
    window.addEventListener('auth:pictureUrl', onPictureUrl)
    return () => window.removeEventListener('auth:pictureUrl', onPictureUrl)
  }, [])

  if (isAuthCallbackPage) {
    return (
      <div className="appShell">
        <div className="page appBody">
          <Outlet
            context={{
              cart,
              setCart,
              addToCart,
              userName,
              setUserName,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={isCartOpen && isMenuPage ? 'appShell modalOpen' : 'appShell'}>
      <div className="appHeader">
        <img className="appHeaderImage" src={topImage} alt="" />
        <button
          type="button"
          className="profileFab"
          aria-label="โปรไฟล์"
          onClick={() => {
            closeCart()
            navigate('/profile')
          }}
        >
          {userPictureUrl ? (
            <img className="profileFabImage" src={userPictureUrl} alt="" />
          ) : (
            <svg
              className="profileFabIcon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="3" fill="currentColor" />
              <path
                d="M7 18a5 5 0 0 1 10 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="page appBody">
        <Outlet
          context={{
            cart,
            setCart,
            addToCart,
            userName,
            setUserName,
          }}
        />
      </div>
      {isMenuPage && (
        <>
          <button type="button" className="cartFab" aria-label="ตะกร้า" onClick={openCart}>
            <svg
              className="cartFabIcon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 18.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm11 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM3 3.75h2.3c.46 0 .86.32.96.77l.25 1.13H20a1 1 0 0 1 .97 1.24l-1.5 6A1 1 0 0 1 18.5 14H8.1a1 1 0 0 1-.98-.8L5.31 5.75H3a1 1 0 1 1 0-2Zm4.02 4L8.9 12h8.82l1-4H7.02Z"
                fill="currentColor"
              />
            </svg>
            {cart.length > 0 && <span className="cartBadge">{cart.length}</span>}
          </button>
          {isCartOpen && (
            <div className="modalOverlay" role="presentation" onClick={closeCart}>
              <div className="modalSheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <CartModal
                  cart={cart}
                  setCart={setCart}
                  onClose={closeCart}
                  onConfirmOrder={confirmOrder}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MenuPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/line/connect/callback" element={<LineConnectCallbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
