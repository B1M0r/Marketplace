import { useState, useEffect } from 'react'
import { usersAPI } from '../api'

function Profile({ user }) {
  const [userData, setUserData] = useState(null)
  const [cards, setCards] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [cardForm, setCardForm] = useState({ number: '', expirationDate: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await usersAPI.getUser(user.id)
      setUserData(response.data)
      setFormData(response.data)
      setCards(response.data.cards || [])
    } catch (err) {
      setError('Ошибка загрузки профиля')
    }
  }

  const handleUpdate = async () => {
    try {
      await usersAPI.updateUser(user.id, formData)
      setEditMode(false)
      fetchUserData()
      setSuccess('Профиль обновлён!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Ошибка обновления')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAddCard = async (e) => {
    e.preventDefault()
    try {
      const expirationDate = new Date(cardForm.expirationDate).toISOString().split('T')[0]

      const response = await usersAPI.createCard({
        number: cardForm.number,
        expiration_date: expirationDate,
        user_id: user.id,
      })
      setCards([...cards, response.data])
      setCardForm({ number: '', expirationDate: '' })
      setSuccess('Карта добавлена!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка добавления карты')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Удалить карту?')) return
    try {
      await usersAPI.deleteCard(cardId)
      setCards(cards.filter(c => c.id !== cardId))
      setSuccess('Карта удалена!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Ошибка удаления карты')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (!userData) {
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
        Мой профиль
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '2px solid rgba(99, 102, 241, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: '#334155' }}>Личная информация</h2>
          {!editMode && (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
              style={{ padding: '10px 20px' }}
            >
              Редактировать
            </button>
          )}
        </div>

        {editMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Дата рождения</label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button className="btn btn-success" onClick={handleUpdate}>
                Сохранить
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Имя</p>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{userData.name}</p>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Фамилия</p>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{userData.surname}</p>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Email</p>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{userData.email}</p>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Дата рождения</p>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>
                {userData.birth_date
                  ? new Date(userData.birth_date).toLocaleDateString('ru-RU')
                  : 'Не указана'}
              </p>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Роль</p>
              <span className={`badge ${userData.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                {userData.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{
        marginTop: '25px',
        background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
        border: '2px solid rgba(168, 85, 247, 0.2)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#a21caf' }}>
          Платежные карты
        </h2>

        <form onSubmit={handleAddCard} style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px',
          flexWrap: 'wrap',
          background: 'white',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <input
            type="text"
            placeholder="Номер карты"
            value={cardForm.number}
            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
            required
            maxLength={19}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <input
            type="date"
            value={cardForm.expirationDate}
            onChange={(e) => setCardForm({ ...cardForm, expirationDate: e.target.value })}
            required
            style={{ padding: '14px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
          />
          <button type="submit" className="btn btn-success">
            Добавить карту
          </button>
        </form>

        {cards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#94a3b8'
          }}>
            <div style={{ marginBottom: '15px', display: 'inline-block' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <p>Нет сохраненных карт</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Держатель</th>
                  <th>Срок действия</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '15px' }}>
                      •••• {card.number.slice(-4)}
                    </td>
                    <td style={{ fontWeight: 500 }}>{card.holder}</td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(card.expiration_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteCard(card.id)}
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
        )}
      </div>
    </div>
  )
}

export default Profile
