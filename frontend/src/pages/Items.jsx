import { useState, useEffect } from 'react'
import { itemsAPI } from '../api'

function Items({ user }) {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', images: [], imagePreviews: [] })
  const [showAddForm, setShowAddForm] = useState(false)
  const [cart, setCart] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editData, setEditData] = useState({ name: '', price: '', description: '', images: [], imagePreviews: [] })
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
        description: newItem.description || null,
      }

      const response = await itemsAPI.createItem(itemData)

      if (newItem.images && newItem.images.length > 0) {
        await itemsAPI.uploadImages(response.data.id, newItem.images)
      }

      // Очищаем URL превью
      newItem.imagePreviews.forEach(url => URL.revokeObjectURL(url))

      setNewItem({ name: '', price: '', description: '', images: [], imagePreviews: [] })
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
      if (editData.description !== editingItem.description) updateData.description = editData.description

      await itemsAPI.updateItem(editingItem.id, updateData)

      if (editData.images && editData.images.length > 0) {
        await itemsAPI.uploadImages(editingItem.id, editData.images)
      }

      // Очищаем URL превью
      editData.imagePreviews.forEach(url => URL.revokeObjectURL(url))

      setEditingItem(null)
      setEditData({ name: '', price: '', description: '', images: [], imagePreviews: [] })
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
      description: item.description || '',
      images: [],
      imagePreviews: []
    })
    setShowEditModal(true)
  }

  const openDetailModal = (item) => {
    setSelectedItem(item)
    setCurrentImageIndex(0)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setSelectedItem(null)
    setShowDetailModal(false)
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
                Описание товара
              </label>
              <textarea
                placeholder="Введите описание товара..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#059669', fontWeight: 500 }}>
                Изображения товара (можно выбрать несколько)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files)
                  const newImages = []
                  const newPreviews = []
                  
                  files.forEach(file => {
                    const previewUrl = URL.createObjectURL(file)
                    newImages.push(file)
                    newPreviews.push(previewUrl)
                  })
                  
                  setNewItem({ 
                    ...newItem, 
                    images: [...newItem.images, ...newImages],
                    imagePreviews: [...newItem.imagePreviews, ...newPreviews]
                  })
                }}
                style={{ marginBottom: '10px' }}
              />
              {newItem.imagePreviews && newItem.imagePreviews.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: '10px',
                  marginTop: '10px' 
                }}>
                  {newItem.imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(preview)
                          const newImages = newItem.images.filter((_, i) => i !== index)
                          const newPreviews = newItem.imagePreviews.filter((_, i) => i !== index)
                          setNewItem({ ...newItem, images: newImages, imagePreviews: newPreviews })
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Описание</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#059669', fontWeight: 500 }}>
                  Изображения товара (можно выбрать несколько)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files)
                    const newImages = []
                    const newPreviews = []
                    
                    files.forEach(file => {
                      const previewUrl = URL.createObjectURL(file)
                      newImages.push(file)
                      newPreviews.push(previewUrl)
                    })
                    
                    setEditData({ 
                      ...editData, 
                      images: [...editData.images, ...newImages],
                      imagePreviews: [...editData.imagePreviews, ...newPreviews]
                    })
                  }}
                  style={{ marginBottom: '10px' }}
                />
                
                {/* Существующие изображения товара */}
                {editingItem.images && editingItem.images.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: '10px',
                    marginTop: '10px' 
                  }}>
                    {editingItem.images.map((img, index) => (
                      <div key={img.id || index} style={{ position: 'relative' }}>
                        <img
                          src={img.image_url}
                          alt={`Image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await itemsAPI.deleteImageById(editingItem.id, img.id)
                            // Обновляем товар после удаления
                            const updatedItem = await itemsAPI.getItem(editingItem.id)
                            setEditingItem(updatedItem.data)
                            fetchItems()
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Новые загруженные изображения (превью) */}
                {editData.imagePreviews && editData.imagePreviews.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: '10px',
                    marginTop: '10px' 
                  }}>
                    {editData.imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(preview)
                            const newImages = editData.images.filter((_, i) => i !== index)
                            const newPreviews = editData.imagePreviews.filter((_, i) => i !== index)
                            setEditData({ ...editData, images: newImages, imagePreviews: newPreviews })
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

      {showDetailModal && selectedItem && (
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
        }} onClick={closeDetailModal}>
          <div className="card" style={{
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            background: 'white',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeDetailModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#64748b',
                transition: 'all 0.2s',
                zIndex: 10
              }}
            >
              ×
            </button>

            {/* Галерея изображений */}
            {(() => {
              // Собираем все изображения: из gallery + основное image_url
              const allImages = []
              if (selectedItem.images && selectedItem.images.length > 0) {
                allImages.push(...selectedItem.images.map(img => img.image_url))
              } else if (selectedItem.image_url) {
                allImages.push(selectedItem.image_url)
              }

              if (allImages.length > 0) {
                const currentImage = allImages[currentImageIndex] || allImages[0]

                return (
                  <>
                    <div style={{
                      width: '100%',
                      height: '350px',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      borderRadius: '12px',
                      marginBottom: '15px',
                      position: 'relative'
                    }}>
                      <img
                        src={currentImage}
                        alt={selectedItem.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Кнопки навигации по галерее */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)
                            }}
                            style={{
                              position: 'absolute',
                              left: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              transition: 'background 0.2s'
                            }}
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)
                            }}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              transition: 'background 0.2s'
                            }}
                          >
                            ›
                          </button>
                          
                          {/* Индикаторы изображений */}
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            {allImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentImageIndex(index)
                                }}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                  transition: 'background 0.2s'
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Счётчик изображений */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Миниатюры */}
                    {allImages.length > 1 && (
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px',
                        overflowX: 'auto',
                        paddingBottom: '5px'
                      }}>
                        {allImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                            style={{
                              flex: '0 0 auto',
                              width: '60px',
                              height: '60px',
                              border: `2px solid ${index === currentImageIndex ? '#10b981' : 'transparent'}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              padding: 0,
                              background: 'transparent'
                            }}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )
              }

              return (
                <div style={{
                  width: '100%',
                  height: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  color: '#94a3b8',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              )
            })()}

            <h2 style={{
              color: '#1e293b',
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '15px'
            }}>
              {selectedItem.name}
            </h2>

            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '20px 0'
            }}>
              ${selectedItem.price.toFixed(2)}
            </p>

            {selectedItem.description && (
              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  letterSpacing: '0.5px'
                }}>
                  Описание
                </h3>
                <p style={{
                  color: '#334155',
                  lineHeight: 1.7,
                  fontSize: '16px',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedItem.description}
                </p>
              </div>
            )}

            {user.role !== 'ADMIN' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleAddToCart(selectedItem)
                  closeDetailModal()
                }}
                style={{
                  width: '100%',
                  marginTop: '25px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Добавить в корзину
              </button>
            )}
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
          {items.map((item) => {
            // Определяем главное изображение и количество фото
            const mainImage = item.images && item.images.length > 0 
              ? item.images[0].image_url 
              : item.image_url
            const imagesCount = (item.images ? item.images.length : 0) + (item.image_url && (!item.images || item.images.length === 0) ? 1 : 0)

            return (
            <div key={item.id} className="card" style={{
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              padding: 0,
              cursor: 'pointer'
            }} onClick={() => openDetailModal(item)}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
              }}></div>

              {mainImage ? (
                <div style={{
                  width: '100%',
                  height: '200px',
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  position: 'relative'
                }}>
                  <img
                    src={mainImage}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {imagesCount > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      {imagesCount}
                    </div>
                  )}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(item)
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(item)
                      }}
                      style={{ flex: 1 }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteItem(item.id)
                      }}
                      style={{ flex: 1 }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}

export default Items
