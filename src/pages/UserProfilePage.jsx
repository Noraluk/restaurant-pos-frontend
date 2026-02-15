import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import { getOrderHistory } from '../api/orders.js'

function UserProfilePage() {
  const navigate = useNavigate()
  const { userName } = useOutletContext()
  const [page, setPage] = useState(1)
  const [retryKey, setRetryKey] = useState(0)
  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [initialError, setInitialError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const orderScrollRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      const isFirstPage = page === 1
      try {
        if (isFirstPage) {
          setIsLoadingInitial(true)
          setInitialError('')
          setLoadMoreError('')
          setOrders([])
        } else {
          setIsLoadingMore(true)
          setLoadMoreError('')
        }
        const data = await getOrderHistory({ page, limit: 10, signal: controller.signal })
        const items = Array.isArray(data?.items) ? data.items : []
        const rawTotalPages = Number(data?.totalPages)
        const nextTotalPages = Number.isFinite(rawTotalPages)
          ? rawTotalPages
          : (() => {
              const total = Number(data?.total)
              const limit = Number(data?.limit) || 10
              if (!Number.isFinite(total) || !Number.isFinite(limit) || limit <= 0) return null
              return Math.max(1, Math.ceil(total / limit))
            })()
        setTotalPages(nextTotalPages)
        setOrders((prev) => {
          if (isFirstPage) return items
          const byId = new Map()
          for (const it of prev) byId.set(it.id || it.orderId, it)
          for (const it of items) byId.set(it.id || it.orderId, it)
          return Array.from(byId.values())
        })
      } catch (err) {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        if (isFirstPage) {
          setInitialError('โหลดประวัติการสั่งไม่สำเร็จ')
        } else {
          setLoadMoreError('โหลดเพิ่มไม่สำเร็จ')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingInitial(false)
          setIsLoadingMore(false)
        }
      }
    }

    run()
    return () => controller.abort()
  }, [page, retryKey])

  const normalizedOrders = useMemo(() => {
    return Array.isArray(orders) ? orders : []
  }, [orders])

  const hasMore = totalPages ? page < totalPages : false

  useEffect(() => {
    const root = orderScrollRef.current
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

  return (
    <div className="profilePage">
      <div className="profileHeader">
        <button
          type="button"
          className="profileBackButton"
          aria-label="กลับ"
          onClick={() => navigate('/')}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="profileTitle">โปรไฟล์</div>
        <div></div>
      </div>
      <div className="profileCard">
        <div className="profileName">{userName || 'ผู้ใช้'}</div>
      </div>
      <div className="orderSection">
        <div className="orderSectionTitle">ประวัติการสั่ง</div>
        <div className="orderScroll" ref={orderScrollRef}>
          {isLoadingInitial ? (
            <div className="authCallbackFull">
              <div className="loadingSpinner" aria-hidden="true" />
            </div>
          ) : initialError ? (
            <div className="orderEmpty">
              <div>{initialError}</div>
              <button
                type="button"
                className="menuRetryButton"
                onClick={() => {
                  setPage(1)
                  setRetryKey((prev) => prev + 1)
                }}
              >
                ลองใหม่
              </button>
            </div>
          ) : normalizedOrders.length === 0 ? (
            <div className="orderEmpty">ยังไม่มีประวัติการสั่ง</div>
          ) : (
            <>
              <div className="orderList">
                {normalizedOrders.map((order) => {
                  const summary = new Map()
                  for (const item of order.items ?? []) {
                    const key = item.menuItemId ?? item.name
                    const prev = summary.get(key)
                    const quantity = Number(item.quantity) || 1
                    if (prev) {
                      prev.count += quantity
                    } else {
                      summary.set(key, { name: item.name, count: quantity })
                    }
                  }

                  const orderedAt = order.orderedAt || order.createdAt
                  const date = orderedAt ? new Date(orderedAt) : null
                  const dateLabel = date ? date.toLocaleString('th-TH') : ''

                  return (
                    <div key={order.id || order.orderId} className="orderCard">
                      <div className="orderCardHeader">
                        <div className="orderDate">{dateLabel}</div>
                        <div className="orderTotal">฿{order.total}</div>
                      </div>
                      <div className="orderItems">
                        {Array.from(summary.values()).map((line) => (
                          <div key={line.name} className="orderItemLine">
                            <div className="orderItemName">{line.name}</div>
                            <div className="orderItemCount">x{line.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {loadMoreError ? (
                <div className="menuLoadMoreStatus">
                  {loadMoreError}{' '}
                  <button type="button" className="menuRetryButton" onClick={() => setRetryKey((prev) => prev + 1)}>
                    ลองใหม่
                  </button>
                </div>
              ) : isLoadingMore ? (
                <div className="menuLoadMoreStatus">กำลังโหลดเพิ่ม…</div>
              ) : null}
              <div ref={loadMoreRef} className="menuLoadMoreSentinel" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
