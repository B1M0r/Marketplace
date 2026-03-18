import { useState, useEffect } from 'react'
import { usersAPI, ordersAPI, itemsAPI } from '../api'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getUsers(0, 100)
      setUsers(response.data.content)
    } catch (err) {
      setError('Ошибка загрузки пользователей')
    }
    setLoading(false)
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersAPI.getOrders(0, 100)
      setOrders(response.data.content)
    } catch (err) {
      setError('Ошибка загрузки заказов')
    }
    setLoading(false)
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await itemsAPI.getItems()
      setItems(response.data)
    } catch (err) {
      setError('Ошибка загрузки товаров')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'orders') fetchOrders()
    if (activeTab === 'items') fetchItems()
  }, [activeTab])

  const handleDeleteUser = async (id) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      await usersAPI.deleteUser(id)
      setSuccess('Пользователь удален!')
      setTimeout(() => setSuccess(''), 3000)
      fetchUsers()
    } catch (err) {
      setError('Ошибка удаления')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Удалить товар?')) return
    try {
      await itemsAPI.deleteItem(id)
      setSuccess('Товар удален!')
      setTimeout(() => setSuccess(''), 3000)
      fetchItems()
    } catch (err) {
      setError('Ошибка удаления')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!confirm('Удалить заказ?')) return
    try {
      await ordersAPI.deleteOrder(id)
      setSuccess('Заказ удален!')
      setTimeout(() => setSuccess(''), 3000)
      fetchOrders()
    } catch (err) {
      setError('Ошибка удаления')
      setTimeout(() => setError(''), 3000)
    }
  }

  const tabs = [
    { id: 'users', label: 'Пользователи', color: '#6366f1' },
    { id: 'orders', label: 'Заказы', color: '#8b5cf6' },
    { id: 'items', label: 'Товары', color: '#10b981' },
  ]

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
        Админ-панель
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              background: activeTab === tab.id
                ? `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}dd 100%)`
                : 'rgba(255, 255, 255, 0.95)',
              color: activeTab === tab.id ? 'white' : '#64748b',
              boxShadow: activeTab === tab.id
                ? `0 4px 15px ${tab.color}55`
                : '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {tab.label} ({tab.id === 'users' ? users.length : tab.id === 'orders' ? orders.length : items.length})
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-spinner"></div>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px solid rgba(99, 102, 241, 0.2)'
        }}>
          <h3 style={{ color: '#0369a1', marginBottom: '20px' }}>Все пользователи</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>#{user.id}</td>
                    <td style={{ fontWeight: 500 }}>{user.name} {user.surname}</td>
                    <td style={{ color: '#64748b' }}>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                        {user.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
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
        </div>
      )}

      {!loading && activeTab === 'orders' && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          border: '2px solid rgba(168, 85, 247, 0.2)'
        }}>
          <h3 style={{ color: '#a21caf', marginBottom: '20px' }}>Все заказы</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: '#a855f7' }}>#{order.id}</td>
                    <td style={{ color: '#64748b' }}>#{order.user_id}</td>
                    <td>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: order.status === 'PENDING' ? '#fef3c7' :
                                   order.status === 'CONFIRMED' ? '#cffafe' :
                                   order.status === 'SHIPPED' ? '#dbeafe' :
                                   order.status === 'DELIVERED' ? '#dcfce7' : '#fee2e2',
                        color: order.status === 'PENDING' ? '#92400e' :
                               order.status === 'CONFIRMED' ? '#0e7490' :
                               order.status === 'SHIPPED' ? '#1d4ed8' :
                               order.status === 'DELIVERED' ? '#15803d' : '#b91c1c',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(order.creation_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ${order.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteOrder(order.id)}
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
        </div>
      )}

      {!loading && activeTab === 'items' && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid rgba(34, 197, 94, 0.2)'
        }}>
          <h3 style={{ color: '#15803d', marginBottom: '20px' }}>Все товары</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>#{item.id}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteItem(item.id)}
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
        </div>
      )}
    </div>
  )
}

export default AdminPanel
