import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthDate: '',
    email: '',
    password: '',
    role: 'USER',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Преобразуем birthDate в birth_date для бэкенда
      const requestData = {
        ...formData,
        birth_date: formData.birthDate || null,
      }
      delete requestData.birthDate

      await authAPI.register(requestData)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '450px', 
        width: '100%',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '36px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px'
          }}>
            ✦ Регистрация
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Создайте аккаунт прямо сейчас
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Успешно! Перенаправление...</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>👤 Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван"
                required
              />
            </div>

            <div className="form-group">
              <label>👤 Фамилия</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Иванов"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>📅 Дата рождения</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>⭐ Роль</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              <option value="USER">👤 Пользователь</option>
              <option value="ADMIN">⚡ Администратор</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-success" 
            style={{ 
              width: '100%',
              marginTop: '10px',
              padding: '14px',
              fontSize: '16px'
            }}
          >
            ✨ Создать аккаунт
          </button>
        </form>

        <p style={{ 
          marginTop: '25px', 
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{
            color: '#6366f1',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
