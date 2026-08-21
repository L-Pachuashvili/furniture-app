const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('taika-admin-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('taika-admin-token')
    }
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail || body?.title || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Types matching backend DTOs ──

export type CategoryResponse = {
  id: string
  slug: string
  name: string
  image: string
  icon: string | null
  count: number
  description: string
}

export type ProductResponse = {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  tag: string | null
  category: string
  description: string
  dimensions: string
  material: string
  color: string
}

export type HeroSlideResponse = {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  accent: string
  sortOrder: number
}

export type PagedResponse<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

// ── Categories ──

export const categoriesApi = {
  getAll: () => request<CategoryResponse[]>('/api/categories'),
  getBySlug: (slug: string) => request<CategoryResponse>(`/api/categories/${slug}`),
  create: (data: { name: string; slug: string; image: string; icon?: string; description: string; count: number }) =>
    request<CategoryResponse>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name: string; slug: string; image: string; icon?: string; description: string; count: number }) =>
    request<CategoryResponse>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
}

// ── Products ──

export const productsApi = {
  getAll: (params?: { category?: string; search?: string; tag?: string; sortBy?: string; page?: number; pageSize?: number }) => {
    const sp = new URLSearchParams()
    if (params?.category) sp.set('category', params.category)
    if (params?.search) sp.set('search', params.search)
    if (params?.tag) sp.set('tag', params.tag)
    if (params?.sortBy) sp.set('sortBy', params.sortBy)
    if (params?.page) sp.set('page', String(params.page))
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
    const qs = sp.toString()
    return request<PagedResponse<ProductResponse>>(`/api/products${qs ? `?${qs}` : ''}`)
  },
  getById: (id: string) => request<ProductResponse>(`/api/products/${id}`),
  create: (data: { name: string; price: number; originalPrice?: number; image: string; tag?: string; category: string; description: string; dimensions: string; material: string; color: string }) =>
    request<ProductResponse>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name: string; price: number; originalPrice?: number; image: string; tag?: string; category: string; description: string; dimensions: string; material: string; color: string }) =>
    request<ProductResponse>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' }),
}

// ── Hero Slides ──

export const heroSlidesApi = {
  getAll: () => request<HeroSlideResponse[]>('/api/hero-slides'),
  create: (data: { title: string; subtitle: string; description: string; image: string; buttonText: string; buttonLink: string; accent: string }) =>
    request<HeroSlideResponse>('/api/hero-slides', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/hero-slides/${id}`, { method: 'DELETE' }),
}

// ── Business Inquiries ──

export const businessInquiriesApi = {
  create: (data: { companyName: string; contactPerson: string; email: string; phone?: string; message: string }) =>
    request('/api/business-inquiries', { method: 'POST', body: JSON.stringify(data) }),
}

// ── File Upload ──

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

export const uploadApi = {
  upload: async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('ფაილის ზომა არ უნდა აღემატებოდეს 2 MB-ს.')
    }
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.detail || 'ფოტოს ატვირთვა ვერ მოხერხდა.')
    }
    const data = await res.json()
    return data.url
  },
}

// ── Orders ──

export type OrderResponse = {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  totalAmount: number
  deliveryFee: number
  createdAt: string
}

export const ordersApi = {
  create: (data: { customerName: string; customerPhone: string; customerEmail: string; customerAddress: string; items: { productId: string; quantity: number }[] }) =>
    request<OrderResponse>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Auth ──

export type LoginResponse = {
  token: string
}

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}
