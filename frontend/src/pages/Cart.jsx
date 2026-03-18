import { useState, useEffect } from 'react'
import { itemsAPI, ordersAPI } from '../api'
import { useNavigate } from 'react-router-dom'

function Cart({ user }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      loadCartItems(cartData)
    } else {
      setLoading(false)
    }
  }, [])

  const loadCartItems = async (cartData) => {
    try {
      const itemsWithQuantity = []
      for (const [itemId, quantity] of Object.entries(cartData)) {
        try {
          const response = await itemsAPI.getItem(parseInt(itemId))
          itemsWithQuantity.push({
            ...response.data,
            quantity
          })
        } catch (err) {
          // Товар не найден, пропускаем его
          console.warn(`Товар ${itemId} не найден, удаляем из корзины`)
          const cart = JSON.parse(localStorage.getItem('cart') || '{}')
          delete cart[itemId]
          localStorage.setItem('cart', JSON.stringify(cart))
        }
      }
      setCartItems(itemsWithQuantity)
    } catch (err) {
      setError('Ошибка загрузки корзины')
    }
    setLoading(false)
  }

  const handleRemoveFromCart = (itemId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    delete cart[itemId]
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartItems(cartItems.filter(item => item.id !== itemId))
    setSuccess('Товар удалён из корзины')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId)
      return
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    cart[itemId] = newQuantity
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const handleCreateOrder = async () => {
    const orderItems = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    try {
      await ordersAPI.createOrder({
        email: user.email,
        items: orderItems,
      })
      localStorage.removeItem('cart')
      setSuccess('Заказ успешно создан!')
      setCartItems([])
      setTimeout(() => {
        setSuccess('')
        navigate('/orders')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка создания заказа')
      setTimeout(() => setError(''), 3000)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{
        marginBottom: '30px',
        color: '#1e293b',
        fontWeight: 800,
        fontSize: '36px'
      }}>
        Корзина
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {cartItems.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <p className="empty-state-text">Корзина пуста</p>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>
            Добавьте товары из каталога
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/items')}
            style={{ marginTop: '20px' }}
          >
            Перейти в каталог
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '20px', fontWeight: 600 }}>
                  В корзине: {totalItems} шт.
                </span>
                <span style={{ marginLeft: '20px', opacity: 0.9 }}>
                  На сумму: ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                className="btn btn-success"
                onClick={handleCreateOrder}
                style={{
                  background: 'white',
                  color: '#059669',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                Оформить заказ
              </button>
            </div>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Изображение</th>
                  <th>Товар</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: '80px' }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f1f5f9',
                          borderRadius: '8px',
                          color: '#94a3b8'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ color: '#64748b' }}>${item.price.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          −
                        </button>
                        <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{
                      fontWeight: 700,
                      color: '#10b981',
                      fontSize: '15px'
                    }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveFromCart(item.id)}
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
