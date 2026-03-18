import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Items from './pages/Items'
import Orders from './pages/Orders'
import AdminPanel from './pages/AdminPanel'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirectToPath, setRedirectToPath] = useState(null)

  useEffect(() => {
    // Восстанавливаем токен и пользователя
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      // Восстанавливаем последнюю страницу
      const savedPath = localStorage.getItem('lastPath') || '/'
      setRedirectToPath(savedPath)
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('lastPath')
    setUser(null)
  }

  // Хук для сохранения текущего пути
  useEffect(() => {
    const savePath = () => {
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        localStorage.setItem('lastPath', path)
      }
    }
    
    // Сохраняем путь при изменении
    savePath()
    
    // Слушаем изменения пути
    const handlePopState = () => savePath()
    window.addEventListener('popstate', handlePopState)
    
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Редирект на последнюю страницу после загрузки
  useEffect(() => {
    if (!loading && user && redirectToPath) {
      const currentPath = window.location.pathname
      if (currentPath !== redirectToPath && currentPath !== '/login' && currentPath !== '/register') {
        window.history.replaceState(null, '', redirectToPath)
      }
    }
  }, [loading, user, redirectToPath])

  // Показываем загрузку пока проверяем токен
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Marketplace
          </h1>
          <div className="loading-spinner" style={{
            margin: '0 auto',
            borderColor: 'rgba(255,255,255,0.3)',
            borderTopColor: 'white'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '16px', opacity: 0.8 }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/items" element={user ? <Items user={user} /> : <Navigate to="/login" />} />
          <Route path="/cart" element={user ? <Cart user={user} /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
          <Route
            path="/admin"
            element={user?.role === 'ADMIN' ? <AdminPanel user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
