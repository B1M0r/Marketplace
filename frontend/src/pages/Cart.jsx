import { useState, useEffect } from 'react'
import { itemsAPI, ordersAPI, usersAPI } from '../api'
import { useNavigate } from 'react-router-dom'

function Cart({ user }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [userCards, setUserCards] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      loadCartItems(cartData)
    } else {
      setLoading(false)
    }
    loadUserCards()
  }, [])

  const loadUserCards = async () => {
    try {
      const response = await usersAPI.getCards()
      setUserCards(response.data)
      if (response.data.length > 0) {
        setSelectedCardId(response.data[0].id.toString())
      }
    } catch (err) {
      console.error('Ошибка загрузки карт:', err)
    }
  }

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
    if (userCards.length === 0) {
      setError('У вас нет сохранённых карт. Добавьте карту в профиле.')
      setTimeout(() => setError(''), 3000)
      return
    }
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!selectedCardId) {
      setError('Выберите карту для оплаты')
      return
    }

    setProcessingPayment(true)
    
    const orderItems = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    const selectedCard = userCards.find(c => c.id === parseInt(selectedCardId))

    try {
      // Имитация обработки платежа
      await new Promise(resolve => setTimeout(resolve, 2000))

      await ordersAPI.createOrder({
        email: user.email,
        items: orderItems,
      })
      
      localStorage.removeItem('cart')
      setProcessingPayment(false)
      setShowPaymentModal(false)
      setSuccess('Оплата прошла успешно! Заказ создан.')
      setCartItems([])
      setTimeout(() => {
        setSuccess('')
        navigate('/orders')
      }, 2000)
    } catch (err) {
      setProcessingPayment(false)
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

      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => !processingPayment && setShowPaymentModal(false)}>
          <div className="card" style={{
            maxWidth: '450px',
            width: '90%',
            background: 'white',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => !processingPayment && setShowPaymentModal(false)}
              disabled={processingPayment}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: processingPayment ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#64748b',
                transition: 'all 0.2s'
              }}
            >
              ×
            </button>

            <h2 style={{
              color: '#1e293b',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '10px',
              paddingRight: '30px'
            }}>
              Оплата заказа
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: '14px',
              marginBottom: '25px'
            }}>
              Выберите карту для оплаты
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '25px'
            }}>
              {userCards.map((card) => (
                <label
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    border: `2px solid ${selectedCardId === card.id.toString() ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    cursor: processingPayment ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    background: selectedCardId === card.id.toString() ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="card"
                    value={card.id}
                    checked={selectedCardId === card.id.toString()}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    disabled={processingPayment}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '12px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: 'monospace',
                      fontSize: '16px'
                    }}>
                      •••• {card.number.slice(-4)}
                    </p>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: '#94a3b8'
                    }}>
                      Действует до: {new Date(card.expiration_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedCardId === card.id.toString() ? '#10b981' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </label>
              ))}
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Товары ({totalItems} шт.)</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px dashed #e2e8f0' }}>
                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>Итого</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '20px' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-success"
              onClick={handlePayment}
              disabled={processingPayment}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                opacity: processingPayment ? 0.7 : 1,
                cursor: processingPayment ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {processingPayment ? (
                <>
                  <div className="loading-spinner" style={{
                    width: '20px',
                    height: '20px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderTopColor: 'white'
                  }}></div>
                  Обработка...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Оплатить ${totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
