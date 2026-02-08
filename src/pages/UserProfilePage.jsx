import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

function UserProfilePage() {
  const navigate = useNavigate()
  const { userName, orderHistory } = useOutletContext()

  const orders = useMemo(() => {
    return Array.isArray(orderHistory) ? orderHistory : []
  }, [orderHistory])

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
        <div className="orderScroll">
          {orders.length === 0 ? (
            <div className="orderEmpty">ยังไม่มีประวัติการสั่ง</div>
          ) : (
            <div className="orderList">
              {orders.map((order) => {
                const summary = new Map()
                for (const item of order.items ?? []) {
                  const key = item.id ?? item.name
                  const prev = summary.get(key)
                  if (prev) {
                    prev.count += 1
                  } else {
                    summary.set(key, { name: item.name, count: 1 })
                  }
                }

                const createdAt = order.createdAt ? new Date(order.createdAt) : null
                const dateLabel = createdAt ? createdAt.toLocaleString('th-TH') : ''

                return (
                  <div key={order.id} className="orderCard">
                    <div className="orderCardHeader">
                      <div className="orderDate">{dateLabel}</div>
                      <div className="orderTotal">฿{order.totalPrice}</div>
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
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
