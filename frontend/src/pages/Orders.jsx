import { useState, useEffect } from 'react'
import { ordersAPI } from '../api'

function Orders({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersAPI.getOrders(page, 5)
      setOrders(response.data.content)
      setTotalPages(response.data.total_pages)
      setError('')
    } catch (err) {
      setError('Ошибка загрузки заказов')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [page])

  const getStatusBadge = (status, statusRu) => {
    const colors = {
      PENDING: { bg: '#fef3c7', text: '#92400e' },
      CONFIRMED: { bg: '#cffafe', text: '#0e7490' },
      SHIPPED: { bg: '#dbeafe', text: '#1d4ed8' },
      DELIVERED: { bg: '#dcfce7', text: '#15803d' },
      CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
    }
    const color = colors[status] || { bg: '#f3f4f6', text: '#374151' }

    return (
      <span
        style={{
          background: color.bg,
          color: color.text,
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {getStatusIcon(status)} {statusRu || status}
      </span>
    )
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      CONFIRMED: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
      SHIPPED: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      DELIVERED: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      CANCELLED: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ),
    }
    return icons[status] || (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrder(orderId, { status: newStatus })
      setSuccess('Статус обновлён!')
      setTimeout(() => setSuccess(''), 3000)
      fetchOrders()
    } catch (err) {
      setError('Ошибка обновления статуса')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Удалить заказ?')) return
    try {
      await ordersAPI.deleteOrder(orderId)
      setSuccess('Заказ удален!')
      setTimeout(() => setSuccess(''), 3000)
      fetchOrders()
    } catch (err) {
      setError('Ошибка удаления заказа')
      setTimeout(() => setError(''), 3000)
    }
  }

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
        fontSize: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        Мои заказы
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {orders.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <p className="empty-state-text">У вас пока нет заказов</p>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>
            Оформите свой первый заказ в каталоге товаров
          </p>
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{
              border: '2px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1e293b'
                    }}>
                      #{order.id}
                    </span>
                    {getStatusBadge(order.status, order.status_ru)}
                  </div>
                  <span style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {new Date(order.creation_date).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {user.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PENDING">Ожидает</option>
                      <option value="CONFIRMED">Подтверждён</option>
                      <option value="SHIPPED">Отправлен</option>
                      <option value="DELIVERED">Доставлен</option>
                      <option value="CANCELLED">Отменён</option>
                    </select>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{ padding: '10px 18px' }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '20px',
                overflowX: 'auto'
              }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Цена</th>
                      <th>Кол-во</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id} style={{
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'transparent'
                      }}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td style={{ color: '#64748b' }}>${item.price.toFixed(2)}</td>
                        <td style={{ color: '#64748b' }}>{item.quantity} шт.</td>
                        <td style={{
                          fontWeight: 700,
                          color: '#10b981',
                          fontSize: '15px'
                        }}>
                          ${item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{
                marginTop: '20px',
                fontWeight: 700,
                textAlign: 'right',
                fontSize: '20px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Итого: ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                opacity: page === 0 ? 0.5 : 1,
                cursor: page === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Назад
            </button>
            <span style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              Страница {page + 1} из {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                opacity: page >= totalPages - 1 ? 0.5 : 1,
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Orders
