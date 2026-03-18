import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '50px',
        padding: '40px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          color: '#1e293b',
          marginBottom: '15px'
        }}>
          Добро пожаловать в Marketplace!
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#64748b',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Ваша платформа для удобных покупок и управления заказами
        </p>
      </div>

      <div className="grid">
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px solid rgba(99, 102, 241, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px', color: '#0369a1' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <h3 style={{ color: '#0369a1', marginBottom: '10px' }}>Каталог товаров</h3>
          <p style={{ margin: '15px 0', color: '#64748b', lineHeight: '1.6' }}>
            Просмотрите наш ассортимент качественных товаров и добавьте понравившиеся в заказ
          </p>
          <Link to="/items" className="btn btn-primary" style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
          }}>
            Перейти в каталог →
          </Link>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          border: '2px solid rgba(168, 85, 247, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px', color: '#a21caf' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3 style={{ color: '#a21caf', marginBottom: '10px' }}>Заказы</h3>
          <p style={{ margin: '15px 0', color: '#64748b', lineHeight: '1.6' }}>
            Отслеживайте статус ваших заказов и управляйте ими в режиме реального времени
          </p>
          <Link to="/orders" className="btn btn-primary" style={{
            background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)'
          }}>
            Мои заказы →
          </Link>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid rgba(34, 197, 94, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px', color: '#15803d' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 style={{ color: '#15803d', marginBottom: '10px' }}>Профиль</h3>
          <p style={{ margin: '15px 0', color: '#64748b', lineHeight: '1.6' }}>
            Управляйте личной информацией, платежными картами и настройками аккаунта
          </p>
          <Link to="/profile" className="btn btn-success">
            Мой профиль →
          </Link>
        </div>
      </div>

      <div style={{
        marginTop: '50px',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#475569' }}>
          Начните покупки прямо сейчас!
        </h2>
        <p style={{ color: '#64748b', marginBottom: '25px' }}>
          Быстро, удобно и безопасно
        </p>
        <Link to="/items" className="btn btn-primary" style={{
          padding: '16px 32px',
          fontSize: '16px'
        }}>
          В каталог
        </Link>
      </div>
    </div>
  )
}

export default Home
