import { useState, useEffect } from 'react'
import { itemsAPI } from '../api'

function Items({ user }) {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null, imagePreview: null })
  const [showAddForm, setShowAddForm] = useState(false)
  const [cart, setCart] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editData, setEditData] = useState({ name: '', price: '', image: null, imagePreview: null })
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getItems(searchTerm)
      setItems(response.data)
    } catch (err) {
      setError('Ошибка загрузки товаров')
    }
  }

  useEffect(() => {
    fetchItems()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [searchTerm])

  const handleAddToCart = (item) => {
    const newCart = {
      ...cart,
      [item.id]: (cart[item.id] || 0) + 1,
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    setSuccess('Товар добавлен в корзину')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    try {
      const itemData = {
        name: newItem.name,
        price: parseFloat(newItem.price),
      }
      
      const response = await itemsAPI.createItem(itemData)
      
      if (newItem.image) {
        await itemsAPI.uploadImage(response.data.id, newItem.image)
      }
      
      // Очищаем URL превью
      if (newItem.imagePreview) {
        URL.revokeObjectURL(newItem.imagePreview)
      }
      
      setNewItem({ name: '', price: '', image: null, imagePreview: null })
      setShowAddForm(false)
      fetchItems()
      setSuccess('Товар добавлен!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка добавления товара')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    try {
      const updateData = {}
      if (editData.name !== editingItem.name) updateData.name = editData.name
      if (editData.price !== editingItem.price) updateData.price = parseFloat(editData.price)
      
      await itemsAPI.updateItem(editingItem.id, updateData)
      
      if (editData.image) {
        await itemsAPI.uploadImage(editingItem.id, editData.image)
      }
      
      // Очищаем URL превью
      if (editData.imagePreview) {
        URL.revokeObjectURL(editData.imagePreview)
      }
      
      setEditingItem(null)
      setEditData({ name: '', price: '', image: null, imagePreview: null })
      setShowEditModal(false)
      fetchItems()
      setSuccess('Товар обновлён!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка обновления товара')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Удалить товар?')) return
    try {
      await itemsAPI.deleteItem(id)
      fetchItems()
      setSuccess('Товар удален!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Ошибка удаления товара')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteImage = async (itemId) => {
    try {
      await itemsAPI.deleteImage(itemId)
      fetchItems()
      setSuccess('Изображение удалено!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Ошибка удаления изображения')
      setTimeout(() => setError(''), 3000)
    }
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setEditData({
      name: item.name,
      price: item.price,
      image: null,
      imagePreview: null
    })
    setShowEditModal(true)
  }

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
    const item = items.find(i => i.id === parseInt(itemId))
    return sum + (item ? item.price * quantity : 0)
  }, 0)

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h1 style={{
          color: '#1e293b',
          fontWeight: 800,
          fontSize: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          Каталог товаров
        </h1>

        {user.role === 'ADMIN' && (
          <button
            className="btn btn-success"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
          >
            {showAddForm ? 'Отмена' : 'Добавить товар'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #10b981'
        }}>
          <h3 style={{ color: '#059669' }}>Новый товар</h3>
          <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Название товара"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Цена ($)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
              step="0.01"
              min="0"
              style={{ width: '140px' }}
            />
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#059669', fontWeight: 500 }}>
                Изображение товара
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const previewUrl = URL.createObjectURL(file)
                    setNewItem({ ...newItem, image: file, imagePreview: previewUrl })
                  }
                }}
                style={{ marginBottom: '10px' }}
              />
              {newItem.imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={newItem.imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Ошибка загрузки превью')
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Добавить
            </button>
          </form>
        </div>
      )}

      {showEditModal && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            background: 'white'
          }}>
            <h3 style={{ color: '#059669', marginBottom: '20px' }}>Редактировать товар</h3>
            <form onSubmit={handleUpdateItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Название</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Цена ($)</label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#059669', fontWeight: 500 }}>
                  Изображение товара
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const previewUrl = URL.createObjectURL(file)
                      setEditData({ ...editData, image: file, imagePreview: previewUrl })
                    }
                  }}
                  style={{ marginBottom: '10px' }}
                />
                {editData.imagePreview ? (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={editData.imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  </div>
                ) : editingItem.image_url ? (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={editingItem.image_url}
                      alt={editingItem.name}
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteImage(editingItem.id)}
                      style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12px' }}
                    >
                      Удалить изображение
                    </button>
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">
                  Сохранить
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '2px solid #e2e8f0'
      }}>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: '16px'
          }}
        />
      </div>

      {totalItems > 0 && (
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
              onClick={() => window.location.href = '/cart'}
              style={{
                background: 'white',
                color: '#059669',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              Перейти в корзину
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <p className="empty-state-text">Товары не найдены</p>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card" style={{
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              padding: 0
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
              }}></div>

              {item.image_url ? (
                <div style={{
                  width: '100%',
                  height: '200px',
                  overflow: 'hidden',
                  background: '#f1f5f9'
                }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  color: '#94a3b8'
                }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              )}

              <div style={{ padding: '20px' }}>
                <h3 style={{
                  marginBottom: '15px',
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {item.name}
                </h3>

                <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '15px 0'
                }}>
                  ${item.price.toFixed(2)}
                </p>

                {user.role !== 'ADMIN' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(item)}
                    style={{
                      width: '100%',
                      background: cart[item.id]
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : undefined
                    }}
                  >
                    {cart[item.id] ? `В корзине (${cart[item.id]})` : 'В корзину'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => openEditModal(item)}
                      style={{ flex: 1 }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteItem(item.id)}
                      style={{ flex: 1 }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Items
