import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    const count = Object.values(cart).reduce((a, b) => a + b, 0)
    setCartCount(count)
  }, [location])

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Marketplace
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Главная
            </Link>
          </li>
          <li>
            <Link to="/items" className={isActive('/items') ? 'active' : ''}>
              Товары
            </Link>
          </li>
          <li>
            <Link to="/cart" className={isActive('/cart') ? 'active' : ''} style={{ position: 'relative' }}>
              Корзина
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
              Заказы
            </Link>
          </li>
          <li>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              Профиль
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/admin" className={isActive('/admin') ? 'active' : ''} style={{ color: '#ec4899' }}>
                Админ
              </Link>
            </li>
          )}
          <li>
            <span>|</span>
          </li>
          <li>
            <span style={{
              color: '#64748b',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              padding: '8px 16px',
              borderRadius: '20px'
            }}>
              {user?.name} {user?.surname}
            </span>
          </li>
          <li>
            <button
              onClick={onLogout}
              className="btn btn-danger"
              style={{
                padding: '10px 18px',
                fontSize: '13px'
              }}
            >
              Выход
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
