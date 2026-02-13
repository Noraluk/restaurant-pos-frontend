import topImage from '../assets/order.png'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { fetchMenus } from '../api/menus.js'

const DEFAULT_LIMIT = 10

function MenuPage() {
  const { addToCart, cart } = useOutletContext()
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [menuItems, setMenuItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [initialError, setInitialError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const menuScrollRef = useRef(null)
  const loadMoreRef = useRef(null)

  const hasMore = totalPages != null && page < totalPages

  useEffect(() => {
    const controller = new AbortController()
    const isFirstPage = page === 1

    const loadMenus = async () => {
      let wasAborted = false
      try {
        if (isFirstPage) {
          setIsLoadingInitial(true)
          setInitialError('')
        } else {
          setIsLoadingMore(true)
          setLoadMoreError('')
        }

        const data = await fetchMenus({ page, limit: DEFAULT_LIMIT, signal: controller.signal })
        const items = Array.isArray(data?.items) ? data.items : []
        const nextTotalPages = Number(data?.totalPages)
        setTotalPages(Number.isFinite(nextTotalPages) ? nextTotalPages : null)

        setMenuItems((prev) => {
          if (isFirstPage) return items
          const byId = new Map()
          for (const item of prev) byId.set(item.id, item)
          for (const item of items) byId.set(item.id, item)
          return Array.from(byId.values())
        })
      } catch (err) {
        if (err?.name === 'AbortError') {
          wasAborted = true
          return
        }
        if (isFirstPage) {
          setInitialError('โหลดเมนูไม่สำเร็จ')
        } else {
          setLoadMoreError('โหลดเมนูเพิ่มไม่สำเร็จ')
        }
      } finally {
        if (!wasAborted) {
          if (isFirstPage) setIsLoadingInitial(false)
          setIsLoadingMore(false)
        }
      }
    }

    loadMenus()
    return () => controller.abort()
  }, [page, retryKey])

  useEffect(() => {
    const root = menuScrollRef.current
    const target = loadMoreRef.current
    if (!root || !target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        if (!isIntersecting) return
        if (!hasMore) return
        if (isLoadingInitial || isLoadingMore) return
        if (initialError || loadMoreError) return
        setPage((prev) => prev + 1)
      },
      {
        root,
        rootMargin: '200px',
        threshold: 0,
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, initialError, isLoadingInitial, isLoadingMore, loadMoreError])

  const cartCountsById = useMemo(() => {
    const counts = new Map()
    for (const item of cart) {
      counts.set(item.id, (counts.get(item.id) ?? 0) + 1)
    }
    return counts
  }, [cart])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuItems.map((item) => item.type).filter(Boolean)))
    return ['ทั้งหมด', ...unique]
  }, [menuItems])

  const visibleMenuItems = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') return menuItems
    return menuItems.filter((item) => item.type === selectedCategory)
  }, [selectedCategory, menuItems])

  const onMenuClick = (item) => (e) => {
    addToCart(item)
    e.currentTarget.focus()
  }

  const retryInitial = () => {
    setRetryKey((prev) => prev + 1)
  }

  const retryMore = () => {
    setLoadMoreError('')
    setRetryKey((prev) => prev + 1)
  }

  return (
    <div className="menuPage">
      {categories.length > 1 && (
        <div className="categoryRow" role="tablist" aria-label="หมวดหมู่">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === selectedCategory ? 'categoryChip categoryChipActive' : 'categoryChip'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      <div ref={menuScrollRef} className="menuScroll">
        <div className="menuGrid">
          {isLoadingInitial ? (
            <div>กำลังโหลดเมนู...</div>
          ) : initialError ? (
            <div className="menuStatus">
              <div>{initialError}</div>
              <button type="button" className="menuRetryButton" onClick={retryInitial}>
                ลองใหม่
              </button>
            </div>
          ) : visibleMenuItems.length === 0 ? (
            <div>ยังไม่มีเมนู</div>
          ) : (
            visibleMenuItems.map((item) => {
              const count = cartCountsById.get(item.id) ?? 0
              return (
                <button
                  key={item.id}
                  type="button"
                  className="menuCard"
                  onClick={onMenuClick(item)}
                >
                  {count > 0 && <span className="menuCountBadge">{count}</span>}
                  <img className="menuImage" src={item.imageUrl || topImage} alt={item.name} />
                  <div className="menuContent">
                    <div className="menuHeader">
                      <div className="menuName">{item.name}</div>
                      <div className="menuPrice">฿{item.price}</div>
                    </div>
                  </div>
                </button>
              )
            })
          )}

          {!isLoadingInitial && !initialError && (
            <>
              {isLoadingMore && <div className="menuLoadMoreStatus">กำลังโหลดเพิ่ม...</div>}
              {loadMoreError && (
                <div className="menuStatus">
                  <div>{loadMoreError}</div>
                  <button type="button" className="menuRetryButton" onClick={retryMore}>
                    ลองใหม่
                  </button>
                </div>
              )}
              {hasMore && <div ref={loadMoreRef} className="menuLoadMoreSentinel" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuPage
