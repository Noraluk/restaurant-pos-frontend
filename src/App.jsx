import topImage from './assets/order.png'
import { useEffect, useState } from 'react'
import { HashRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

import CartModal from './components/CartModal.jsx'
import MenuPage from './pages/MenuPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'

const USER_NAME_STORAGE_KEY = 'restaurant_pos:userName'
const ORDER_HISTORY_STORAGE_KEY = 'restaurant_pos:orderHistory'

const readStorage = (key, fallbackValue) => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallbackValue
    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMenuPage = location.pathname === '/'
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userName, setUserName] = useState(() => readStorage(USER_NAME_STORAGE_KEY, 'ผู้ใช้'))
  const [orderHistory, setOrderHistory] = useState(() => readStorage(ORDER_HISTORY_STORAGE_KEY, []))

  const addToCart = (item) => {
    setCart((prev) => [...prev, item])
  }

  const addOrderToHistory = (items, totalPrice) => {
    const safeItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type,
    }))
    const order = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      totalPrice,
      items: safeItems,
    }
    setOrderHistory((prev) => [order, ...prev])
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  useEffect(() => {
    writeStorage(USER_NAME_STORAGE_KEY, userName)
  }, [userName])

  useEffect(() => {
    writeStorage(ORDER_HISTORY_STORAGE_KEY, orderHistory)
  }, [orderHistory])

  useEffect(() => {
    if (!isCartOpen || !isMenuPage) return
    const onKeyDown = (e) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCartOpen, isMenuPage])

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
          <svg
            className="profileFabIcon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="3" fill="currentColor" />
            <path d="M7 18a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
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
            orderHistory,
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
                  onConfirmOrder={addOrderToHistory}
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
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MenuPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
