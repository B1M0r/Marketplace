import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await authAPI.login(email, password)
      const token = response.data.access_token

      // Декодируем токен для получения данных пользователя
      const userData = JSON.parse(atob(token.split('.')[1]))

      onLogin({
        id: userData.user_id,
        email: userData.sub,
        role: userData.role,
      }, token)

      // Перенаправляем на последнюю страницу или на главную
      const lastPath = localStorage.getItem('lastPath') || '/'
      navigate(lastPath)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
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
        maxWidth: '420px', 
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
            ✦ Marketplace
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Добро пожаловать обратно!
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%',
              marginTop: '10px',
              padding: '14px',
              fontSize: '16px'
            }}
          >
            Войти →
          </button>
        </form>

        <p style={{ 
          marginTop: '25px', 
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{
            color: '#6366f1',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
