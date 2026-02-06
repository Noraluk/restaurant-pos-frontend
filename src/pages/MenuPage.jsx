import topImage from '../assets/order.png'
import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const menuItems = [
  { id: 'm1', name: 'ผัดกะเพราไก่', price: 65, type: 'คาว', imageSrc: topImage },
  { id: 'm2', name: 'ข้าวผัดหมู', price: 60, type: 'คาว', imageSrc: topImage },
  { id: 'm3', name: 'เค้กช็อกโกแลต', price: 95, type: 'หวาน', imageSrc: topImage },
  { id: 'm4', name: 'ชาไทยเย็น', price: 55, type: 'น้ำ', imageSrc: topImage },
  { id: 'm5', name: 'ผัดกะเพราไก่', price: 65, type: 'คาว', imageSrc: topImage },
  { id: 'm6', name: 'ข้าวผัดหมู', price: 60, type: 'คาว', imageSrc: topImage },
  { id: 'm7', name: 'เค้กช็อกโกแลต', price: 95, type: 'หวาน', imageSrc: topImage },
  { id: 'm8', name: 'ชาไทยเย็น', price: 55, type: 'น้ำ', imageSrc: topImage },
]

function MenuPage() {
  const { addToCart, cart } = useOutletContext()
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')

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
  }, [])

  const visibleMenuItems = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') return menuItems
    return menuItems.filter((item) => item.type === selectedCategory)
  }, [selectedCategory])

  const onMenuClick = (item) => (e) => {
    addToCart(item)
    e.currentTarget.focus()
  }

  return (
    <div className="menuPage">
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
      <div className="menuScroll">
        <div className="menuGrid">
          {visibleMenuItems.map((item) => {
            const count = cartCountsById.get(item.id) ?? 0
            return (
              <button
                key={item.id}
                type="button"
                className="menuCard"
                onClick={onMenuClick(item)}
              >
                {count > 0 && <span className="menuCountBadge">{count}</span>}
                <img className="menuImage" src={item.imageSrc} alt={item.name} />
                <div className="menuContent">
                  <div className="menuHeader">
                    <div className="menuName">{item.name}</div>
                    <div className="menuPrice">฿{item.price}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MenuPage
