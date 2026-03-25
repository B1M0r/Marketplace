import axios from 'axios'

const API_URL = '/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  getUsers: (page = 0, size = 5) => api.get(`/users?page=${page}&size=${size}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  searchByEmail: (email) => api.get(`/users/search?email=${email}`),
  createCard: (data) => api.post('/cards', data),
  getCards: () => api.get('/cards'),
  updateCard: (id, data) => api.put(`/cards/${id}`, data),
  deleteCard: (id) => api.delete(`/cards/${id}`),
}

export const itemsAPI = {
  getItems: (name = '') => api.get(`/items${name ? `?name=${name}` : ''}`),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/items/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadImages: (id, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/items/${id}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getImages: (id) => api.get(`/items/${id}/images`),
  deleteImage: (id) => api.delete(`/items/${id}/upload-image`),
  deleteImageById: (itemId, imageId) => api.delete(`/items/${itemId}/images/${imageId}`),
  reorderImages: (id, imageIds) => api.put(`/items/${id}/images/reorder`, imageIds),
}

export const ordersAPI = {
  getOrders: (page = 0, size = 5, statuses = null, ids = null) => {
    let url = `/orders?page=${page}&size=${size}`
    if (statuses) url += `&statuses=${statuses}`
    if (ids) url += `&ids=${ids}`
    return api.get(url)
  },
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
}

export default api
