import axios from 'axios'

const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  // Auth-Cookies (HttpOnly) müssen bei jedem Request mitgeschickt werden.
  withCredentials: true
})

export const applicationApi = {
  getAll: () => client.get('/applications/'),
  getById: (id) => client.get(`/applications/${id}`),
  create: (data) => client.post('/applications/', data),
  update: (id, data) => client.put(`/applications/${id}`, data),
  delete: (id) => client.delete(`/applications/${id}`)
}

export const companyApi = {
  getAll: () => client.get('/companies/'),
  getById: (id) => client.get(`/companies/${id}`),
  create: (data) => client.post('/companies/', data),
  update: (id, data) => client.put(`/companies/${id}`, data),
  delete: (id) => client.delete(`/companies/${id}`)
}

export const jobPostingApi = {
  getAll: () => client.get('/job-postings/'),
  getById: (id) => client.get(`/job-postings/${id}`),
  create: (data) => client.post('/job-postings/', data),
  update: (id, data) => client.put(`/job-postings/${id}`, data),
  delete: (id) => client.delete(`/job-postings/${id}`)
}

// Liefert/ändert ausschließlich den eigenen Account (siehe Backend/routers/users.py).
// Neue Accounts entstehen ausschließlich über authApi.register.
export const userApi = {
  getAll: () => client.get('/users/'),
  getById: (id) => client.get(`/users/${id}`),
  update: (id, data) => client.put(`/users/${id}`, data),
  delete: (id) => client.delete(`/users/${id}`)
}

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  changePassword: (data) => client.post('/auth/change-password', data)
}

export default client
