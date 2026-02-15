import { useEffect, useState } from 'react'

function CartModal({ cart, setCart, onClose, onConfirmOrder }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  const removeAtIndex = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
  }

  const openConfirm = () => {
    setSubmitError('')
    setIsConfirmOpen(true)
  }
  const closeConfirm = () => setIsConfirmOpen(false)

  const confirmOrder = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onConfirmOrder?.(cart, totalPrice)
      setCart([])
      closeConfirm()
      onClose()
    } catch {
      setSubmitError('ยืนยันออเดอร์ไม่สำเร็จ')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isConfirmOpen) return
    const onKeyDownCapture = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeConfirm()
      }
    }
    window.addEventListener('keydown', onKeyDownCapture, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDownCapture, { capture: true })
  }, [isConfirmOpen])

  return (
    <div className="cartPage">
      <div className="cartHeader">
        <div></div>
        <div className="cartTitle">ตะกร้า</div>
        <button
          type="button"
          className="cartClearButton"
          onClick={clearCart}
          disabled={cart.length === 0}
        >
          ล้าง
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="cartEmptyState">
          <div className="cartEmptyCard">
            <div className="cartEmptyIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 18.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm11 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM3 3.75h2.3c.46 0 .86.32.96.77l.25 1.13H20a1 1 0 0 1 .97 1.24l-1.5 6A1 1 0 0 1 18.5 14H8.1a1 1 0 0 1-.98-.8L5.31 5.75H3a1 1 0 1 1 0-2Zm4.02 4L8.9 12h8.82l1-4H7.02Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="cartEmptyTitle">ตะกร้าว่าง</div>
            <div className="cartEmptySubtitle">เพิ่มเมนูที่ต้องการ แล้วค่อยกดยืนยันออเดอร์</div>
            <button type="button" className="cartPrimaryButton" onClick={onClose}>
              ไปเลือกอาหาร
            </button>
          </div>
        </div>
      ) : (
        <div className="cartContent">
          <div className="cartScroll">
            <div className="cartList">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cartItem">
                  <div className="cartItemMain">
                    <div className="cartItemName">{item.name}</div>
                    <div className="cartItemPrice">฿{item.price}</div>
                  </div>
                  <button
                    type="button"
                    className="cartRemoveButton"
                    onClick={() => removeAtIndex(index)}
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="cartFooter">
            <div className="cartSummary">
              <div className="cartSummaryLabel">รวมทั้งหมด</div>
              <div className="cartSummaryValue">฿{totalPrice}</div>
            </div>
            <div className="cartActions">
              <button type="button" className="cartConfirmButton" onClick={openConfirm}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div
          className="confirmOverlay"
          role="presentation"
          onClick={() => {
            if (!isSubmitting) closeConfirm()
          }}
        >
          <div
            className="confirmDialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirmTitle">ยืนยันรายการ</div>
            <div className="confirmMessage">รวมทั้งหมด ฿{totalPrice}</div>
            <div className="confirmMessage">ต้องการยืนยันหรือไม่</div>
            {submitError ? <div className="confirmMessage">{submitError}</div> : null}
            <div className="confirmButtons">
              <button type="button" className="confirmSecondary" onClick={closeConfirm} disabled={isSubmitting}>
                ยกเลิก
              </button>
              <button type="button" className="confirmPrimary" onClick={confirmOrder} disabled={isSubmitting}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartModal
