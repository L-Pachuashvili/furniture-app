import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { categoriesApi, productsApi, heroSlidesApi, businessInquiriesApi, uploadApi, ordersApi, authApi, collectionsApi } from './api'
import type { CollectionResponse, CollectionAdminResponse, CollectionProductsResponse, CollectionSelectionMode, CollectionStatus, SaveCollectionRequest } from './api'
import './App.css'

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  tag?: string
  category: string
  description: string
  dimensions: string
  material: string
  color: string
}

type Category = {
  id: string
  slug: string
  name: string
  image: string
  icon?: string
  count: number
  description: string
}

type HeroSlide = {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  accent: string
}

const categoryIcons: Record<string, ReactNode> = {
  notebooks: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="6" width="38" height="52" rx="3" />
      <line x1="22" y1="6" x2="22" y2="58" />
      <path d="M10 14h8M10 24h8M10 34h8M10 44h8" />
      <line x1="28" y1="20" x2="44" y2="20" />
      <line x1="28" y1="28" x2="44" y2="28" />
    </svg>
  ),
  pens: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M44 6l14 14L22 56H8V42L44 6z" />
      <line x1="36" y1="14" x2="50" y2="28" />
      <line x1="8" y1="42" x2="22" y2="56" />
    </svg>
  ),
  art: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 6C17 6 6 17 6 30c0 12 10 18 18 18 4 0 5 2 5 5 0 3 2 5 6 5 14 0 23-12 23-26C58 17 47 6 32 6z" />
      <circle cx="20" cy="26" r="3" />
      <circle cx="30" cy="17" r="3" />
      <circle cx="42" cy="19" r="3" />
      <circle cx="47" cy="31" r="3" />
    </svg>
  ),
  office: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18h18l4 6h26v28a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V18z" />
      <path d="M22 12h28a3 3 0 0 1 3 3v9" />
      <line x1="20" y1="36" x2="44" y2="36" />
      <line x1="20" y1="44" x2="36" y2="44" />
    </svg>
  ),
  school: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 24a18 18 0 0 1 36 0v30a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V24z" />
      <path d="M24 10V8a8 8 0 0 1 16 0v2" />
      <rect x="22" y="36" width="20" height="12" rx="2" />
      <line x1="14" y1="30" x2="50" y2="30" />
    </svg>
  ),
}

/* ══════════════════════════════════════════════════
   CART CONTEXT
   ══════════════════════════════════════════════════ */

type CartItem = {
  product: Product
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  toggleCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('windlife-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('windlife-cart', JSON.stringify(items))
  }, [items])

  const toggleCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.filter(item => item.product.id !== product.id)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.product.id === productId)
  }, [items])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, toggleCart, removeFromCart, updateQuantity, clearCart, isInCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

/* ══════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════ */

/* ── Navbar ─────────────────────────────────────── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToSection = useCallback((sectionId: string) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.pathname, navigate])

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">WIND<span>LIFE</span></Link>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#categories" onClick={(e) => { e.preventDefault(); scrollToSection('categories') }}>კატეგორიები</a>
          <Link to="/about">ჩვენ შესახებ</Link>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}>კონტაქტი</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="ძებნა">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <Link to="/cart" className="icon-btn" aria-label="კალათა">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <CartBadge />
          </Link>
          <button
            className="menu-toggle icon-btn"
            aria-label="მენიუ"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

/* ── Hero Slider ─────────────────────────────────── */

/* ══════════════════════════════════════════════════
   DATA CONTEXT (Admin-managed categories & slides)
   ══════════════════════════════════════════════════ */

type DataContextType = {
  categories: Category[]
  heroSlides: HeroSlide[]
  products: Product[]
  collections: CollectionResponse[]
  loading: boolean
  refreshCollections: () => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (id: string, cat: Partial<Category>) => void
  removeCategory: (id: string) => void
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void
  removeSlide: (id: string) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  removeProduct: (id: string) => void
}

const DataContext = createContext<DataContextType | null>(null)

function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<CollectionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const refreshCollections = useCallback(() => {
    collectionsApi.getVisible()
      .then(setCollections)
      .catch(err => console.error('Failed to load collections:', err))
  }, [])

  useEffect(() => {
    refreshCollections()
  }, [refreshCollections])

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      heroSlidesApi.getAll(),
      productsApi.getAll({ pageSize: 200 }),
    ]).then(([cats, slides, prodsPage]) => {
      setCategories(cats.map(c => ({ ...c, id: c.id, icon: c.icon ?? undefined })))
      setHeroSlides(slides.map(s => ({ ...s, id: s.id })))
      setProducts(prodsPage.items.map(p => ({
        ...p,
        id: p.id,
        originalPrice: p.originalPrice ?? undefined,
        tag: p.tag ?? undefined,
      })))
    }).catch(err => {
      console.error('Failed to load data from API:', err)
    }).finally(() => setLoading(false))
  }, [])

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    categoriesApi.create(cat).then(c => {
      setCategories(prev => [...prev, { ...c, icon: c.icon ?? undefined }])
    }).catch(err => console.error('Failed to add category:', err))
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const current = categories.find(c => c.id === id)
    if (!current) return
    const merged = { ...current, ...updates }
    categoriesApi.update(id, { name: merged.name, slug: merged.slug, image: merged.image, icon: merged.icon, description: merged.description, count: merged.count }).then(c => {
      setCategories(prev => prev.map(cat => cat.id === id ? { ...c, icon: c.icon ?? undefined } : cat))
    }).catch(err => console.error('Failed to update category:', err))
  }, [categories])

  const removeCategory = useCallback((id: string) => {
    categoriesApi.delete(id).then(() => {
      setCategories(prev => prev.filter(c => c.id !== id))
    }).catch(err => console.error('Failed to delete category:', err))
  }, [])

  const addSlide = useCallback((slide: Omit<HeroSlide, 'id'>) => {
    heroSlidesApi.create(slide).then(s => {
      setHeroSlides(prev => [...prev, s])
    }).catch(err => console.error('Failed to add slide:', err))
  }, [])

  const removeSlide = useCallback((id: string) => {
    heroSlidesApi.delete(id).then(() => {
      setHeroSlides(prev => prev.filter(s => s.id !== id))
    }).catch(err => console.error('Failed to delete slide:', err))
  }, [])

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    productsApi.create({
      ...product,
      originalPrice: product.originalPrice,
      tag: product.tag,
    }).then(p => {
      setProducts(prev => [...prev, { ...p, originalPrice: p.originalPrice ?? undefined, tag: p.tag ?? undefined }])
    }).catch(err => console.error('Failed to add product:', err))
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const current = products.find(p => p.id === id)
    if (!current) return
    const merged = { ...current, ...updates }
    productsApi.update(id, {
      name: merged.name,
      price: merged.price,
      originalPrice: merged.originalPrice,
      image: merged.image,
      tag: merged.tag,
      category: merged.category,
      description: merged.description,
      dimensions: merged.dimensions,
      material: merged.material,
      color: merged.color,
    }).then(p => {
      setProducts(prev => prev.map(prod => prod.id === id ? { ...p, originalPrice: p.originalPrice ?? undefined, tag: p.tag ?? undefined } : prod))
    }).catch(err => console.error('Failed to update product:', err))
  }, [products])

  const removeProduct = useCallback((id: string) => {
    productsApi.delete(id).then(() => {
      setProducts(prev => prev.filter(p => p.id !== id))
    }).catch(err => console.error('Failed to delete product:', err))
  }, [])

  return (
    <DataContext.Provider value={{ categories, heroSlides, products, collections, loading, refreshCollections, addCategory, updateCategory, removeCategory, addSlide, removeSlide, addProduct, updateProduct, removeProduct }}>
      {children}
    </DataContext.Provider>
  )
}

function HeroSlider() {
  const { heroSlides: staticSlides, collections } = useData()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const heroSlides: HeroSlide[] = [
    ...collections
      .filter(c => c.showInSlider && c.bannerImage)
      .map(c => ({
        id: `collection-${c.id}`,
        title: c.name,
        subtitle: 'კოლექცია',
        description: c.description,
        image: c.bannerImage!,
        buttonText: 'კოლექციის ნახვა',
        buttonLink: `/collection/${c.slug}`,
        accent: 'var(--burgundy)',
      })),
    ...staticSlides,
  ]

  const next = useCallback(() => setCurrent((c) => (c + 1) % heroSlides.length), [heroSlides.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length), [heroSlides.length])

  useEffect(() => {
    if (paused || heroSlides.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next, heroSlides.length])

  if (heroSlides.length === 0) {
    return (
      <section className="hero-slider" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>სლაიდები არ არის დამატებული</p>
      </section>
    )
  }

  const safeIndex = current < heroSlides.length ? current : 0
  const slide = heroSlides[safeIndex]

  return (
    <section
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slider-bg">
        {heroSlides.map((s, i) => (
          <img
            key={s.id}
            src={s.image}
            alt={s.title}
            className={`hero-slider-img ${i === safeIndex ? 'active' : ''}`}
          />
        ))}
        <div className="hero-slider-overlay" />
      </div>

      <div className="container hero-slider-inner">
        <div className="hero-slider-content">
          <span className="hero-slider-tag" style={{ background: slide.accent }}>
            {slide.subtitle}
          </span>
          <h1 className="hero-slider-title">{slide.title}</h1>
          <p className="hero-slider-desc">{slide.description}</p>
          <Link to={slide.buttonLink} className="btn btn-primary hero-slider-btn">
            {slide.buttonText}
          </Link>
        </div>

        <div className="hero-slider-controls">
          <button className="hero-slider-arrow" onClick={prev} aria-label="წინა">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="hero-slider-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`hero-slider-dot ${i === safeIndex ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`სლაიდი ${i + 1}`}
              />
            ))}
          </div>
          <button className="hero-slider-arrow" onClick={next} aria-label="შემდეგი">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Collections (Home) ─────────────────────────── */
function CollectionsSection() {
  const { collections } = useData()
  const homepageCollections = collections.filter(c => c.showOnHomepage)
  if (homepageCollections.length === 0) return null

  return (
    <section className="collections-section" id="collections">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">შეთავაზებები</span>
          <p className="section-desc">თემატური და სეზონური კოლექციები</p>
        </div>
        <div className="collections-grid">
          {homepageCollections.map(c => (
            <Link to={`/collection/${c.slug}`} key={c.id} className="collection-card">
              <img src={c.coverImage} alt={c.name} />
              <div className="collection-card-overlay">
                <h3>{c.name}</h3>
                {c.description && <p>{c.description}</p>}
                <span className="collection-card-count">{c.productCount} პროდუქტი →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Categories (Home) ──────────────────────────── */
function CategoriesSection() {
  const { categories } = useData()
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card">
              <div className="category-icon">
                {cat.icon ? <img src={cat.icon} alt={cat.name} /> : categoryIcons[cat.slug]}
              </div>
              <h3>{cat.name}</h3>
              <span className="category-count">{cat.count} ნივთი</span>
              <p className="category-desc">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Cart Badge ─────────────────────────────────── */
function CartBadge() {
  const { totalItems } = useCart()
  return <span className={`cart-badge ${totalItems > 0 ? 'has-items' : ''}`}>{totalItems}</span>
}

/* ── Product Card (compact, for home) ───────────── */
function ProductCard({ product }: { product: Product }) {
  const { toggleCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} />
        </Link>
        {product.tag && <span className={`product-tag tag-${product.tag === 'ფასდაკლება' ? 'sale' : product.tag === 'ბესტსელერი' ? 'best' : 'new'}`}>{product.tag}</span>}
        <div className="product-actions">
          <button className="action-btn" aria-label="სურვილების სიაში დამატება">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          <button className={`action-btn ${inCart ? 'in-cart' : ''}`} aria-label={inCart ? 'კალათიდან ამოშლა' : 'კალათაში დამატება'} onClick={() => toggleCart(product)}>
            {inCart ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-pricing">
          <span className="product-price">₾{product.price}</span>
          {product.originalPrice && (
            <span className="product-original">₾{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Featured Products (Home) ───────────────────── */
function FeaturedProducts() {
  const { products } = useData()
  const featured = products.filter(p => p.tag).slice(0, 8)
  return (
    <section className="featured-products" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">პროდუქცია</span>
          <p className="section-desc">ყველაზე მოთხოვნადი საკანცელარიო ნივთები</p>
        </div>
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="products-cta">
          <Link to="/category/notebooks" className="btn btn-outline">ყველა პროდუქტის ნახვა</Link>
        </div>
      </div>
    </section>
  )
}

/* ── Banner ──────────────────────────────────────── */
function Banner() {
  return (
    <section className="banner" id="about">
      <div className="container banner-inner">
        <div className="banner-image banner-illustration" role="img" aria-label="რვეული და კალამი">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="40" y="30" width="100" height="140" rx="6" />
            <line x1="58" y1="30" x2="58" y2="170" />
            <path d="M32 50h16M32 75h16M32 100h16M32 125h16M32 150h16" />
            <line x1="72" y1="65" x2="124" y2="65" />
            <line x1="72" y1="85" x2="124" y2="85" />
            <line x1="72" y1="105" x2="110" y2="105" />
            <path d="M150 40l14 14-52 52-18 4 4-18 52-52z" />
            <line x1="140" y1="50" x2="154" y2="64" />
          </svg>
        </div>
        <div className="banner-content">
          <span className="section-tag">ჩვენ შესახებ</span>
          <h2>ყველაფერი სწავლის,<br />მუშაობისა და შემოქმედებისთვის</h2>
          <p>
            Windlife-ში შეგროვებულია ხარისხიანი საკანცელარიო ნივთები სკოლისთვის,
            უნივერსიტეტისთვის, ოფისისა და ხელოვნებისთვის — რვეულებიდან და კალმებიდან
            დაწყებული, სახატავი მასალებითა და საოფისე აქსესუარებით დამთავრებული.
          </p>
          <div className="banner-features">
            <div className="feature">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>ორიგინალი პროდუქცია</strong>
                <span>მხოლოდ სანდო ბრენდები</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <strong>უფასო მიტანა</strong>
                <span>₾200-ზე მეტ შეკვეთაზე</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <strong>მარტივი დაბრუნება</strong>
                <span>14 დღის განმავლობაში</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo">WIND<span>LIFE</span></Link>
            <p>საკანცელარიო მაღაზია სკოლისთვის, ოფისისა და შემოქმედებისთვის. ხარისხი, რომელიც ყოველდღე გეხმარება.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>მაღაზია</h4>
              <Link to="/category/notebooks">რვეულები</Link>
              <Link to="/category/pens">კალმები და ფანქრები</Link>
              <Link to="/category/art">სახატავი მასალები</Link>
              <Link to="/category/office">საოფისე ნივთები</Link>
              <Link to="/category/school">ზურგჩანთები</Link>
            </div>
            <div className="footer-col">
              <h4>ინფორმაცია</h4>
              <Link to="/about">ჩვენ შესახებ</Link>
              <a href="#">მიტანის პირობები</a>
              <a href="#">დაბრუნების პოლიტიკა</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>კონტაქტი</h4>
              <a href="tel:+995568222234">+995 555 12 34 56</a>
              <a href="mailto:info@windlife.ge">info@windlife.ge</a>
              <span>რუსთავი, საქართველო</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Windlife. ყველა უფლება დაცულია.</p>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════
   PAGES
   ══════════════════════════════════════════════════ */

/* ── About Page ────────────────────────────────── */
function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return <Banner />
}

/* ── Business Page ──────────────────────────────── */
function BusinessPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    businessInquiriesApi.create(formData).then(() => {
      setSubmitted(true)
    }).catch(err => {
      console.error('Failed to submit inquiry:', err)
      alert('შეცდომა მოხდა. სცადეთ მოგვიანებით.')
    })
  }

  return (
    <section className="business-page">
      <div className="business-hero">
        <div className="container">
          <span className="section-tag">B2B</span>
          <h1>კორპორატიული შეთავაზება</h1>
          <p>შეავსეთ განაცხადი და ჩვენი გუნდი დაგიკავშირდებათ 24 საათის განმავლობაში</p>
        </div>
      </div>
      <div className="container business-content">
        <div className="business-info">
          <h2>რატომ Windlife?</h2>
          <div className="business-benefits">
            <div className="benefit">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>ორიგინალი პროდუქცია</strong>
                <p>მხოლოდ სანდო ბრენდები და სერტიფიცირებული მასალები</p>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div>
                <strong>სპეციალური ფასები</strong>
                <p>საბიუტო ფასები ოფისებისა და სკოლებისთვის</p>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <strong>უფასო მიტანა ოფისში</strong>
                <p>რეგულარული მარაგის შევსება დასახელებულ დროს</p>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <strong>პერსონალური მენეჯერი</strong>
                <p>თქვენი პროექტის მართვა ერთი კონტაქტი პირით</p>
              </div>
            </div>
          </div>
        </div>
        <div className="business-form-wrapper">
          {submitted ? (
            <div className="business-success">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3>განაცხადი მიღებულია!</h3>
              <p>ჩვენი გუნდი დაგიკავშირდებათ 24 საათის განმავლობაში.</p>
            </div>
          ) : (
            <form className="business-form" onSubmit={handleSubmit}>
              <h3>შეავსეთ განაცხადი</h3>
              <div className="form-group">
                <label htmlFor="companyName">კომპანიის სახელი *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="შპს მაგალითი"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPerson">საკონტაქტო პირი *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  placeholder="სახელი გვარი"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">ელ. ფოსტა *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="info@company.ge"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">ტელეფონი</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+995 5XX XXX XXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">შეტყობინება *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="აღწერეთ თქვენი საჭიროება: რომელი საკანცელარიო ნივთები გჭირდებათ, რაოდენობა, მიწოდების სიხშირე..."
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                განაცხადის გაგზავნა
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Stationery Quiz ─────────────────────────────── */
type QuizAnswer = {
  forWhom: string
  purpose: string
  style: string
  quantity: string
  budget: string
}

const quizSteps = [
  {
    key: 'forWhom' as const,
    question: 'ვისთვის ეძებ საკანცელარიოს?',
    subtitle: 'აირჩიე ვინ იქნება მთავარი მომხმარებელი',
    options: [
      { value: 'pupil', label: 'მოსწავლე', icon: '🎒', desc: 'სასკოლო საჭიროებები' },
      { value: 'student', label: 'სტუდენტი', icon: '🎓', desc: 'ლექციები და შენიშვნები' },
      { value: 'office', label: 'ოფისი', icon: '💼', desc: 'სამუშაო სივრცე' },
      { value: 'artist', label: 'შემოქმედი', icon: '🎨', desc: 'ხატვა და შემოქმედება' },
    ],
  },
  {
    key: 'purpose' as const,
    question: 'რისთვის გჭირდება ყველაზე მეტად?',
    subtitle: 'შენი ძირითადი აქტივობა',
    options: [
      { value: 'writing', label: 'წერა', icon: '✍️', desc: 'ჩანაწერები და კონსპექტი' },
      { value: 'drawing', label: 'ხატვა', icon: '🖌️', desc: 'სკეტჩი და ილუსტრაცია' },
      { value: 'planning', label: 'დაგეგმვა', icon: '🗓️', desc: 'პლანერი და ორგანაიზერი' },
      { value: 'organizing', label: 'ორგანიზება', icon: '🗂️', desc: 'საქაღალდეები და არქივი' },
    ],
  },
  {
    key: 'style' as const,
    question: 'რომელი სტილი გიყვარს?',
    subtitle: 'ეს გვეხმარება სწორი დიზაინის შერჩევაში',
    options: [
      { value: 'classic', label: 'კლასიკური', icon: '🖤', desc: 'მინიმალისტური, მკაფიო' },
      { value: 'colorful', label: 'ფერადი', icon: '🌈', desc: 'ცოცხალი და მხიარული' },
      { value: 'premium', label: 'პრემიუმ', icon: '✨', desc: 'ტყავი, ნატურალური მასალები' },
    ],
  },
  {
    key: 'quantity' as const,
    question: 'რა რაოდენობა გჭირდება?',
    subtitle: 'აირჩიე შესაფერისი ვარიანტი',
    options: [
      { value: 'single', label: 'რამდენიმე ნივთი', icon: '☝️', desc: 'პირადი გამოყენებისთვის' },
      { value: 'set', label: 'სრული ნაკრები', icon: '📦', desc: 'სასწავლო წლისთვის' },
      { value: 'bulk', label: 'ბევრი', icon: '🏢', desc: 'კლასის ან ოფისისთვის' },
    ],
  },
  {
    key: 'budget' as const,
    question: 'რა ბიუჯეტი გაქვს?',
    subtitle: 'ფასის დიაპაზონი ერთ ნივთზე',
    options: [
      { value: 'low', label: '20₾-მდე', icon: '💰', desc: 'ეკონომიური' },
      { value: 'mid', label: '20-60₾', icon: '💎', desc: 'საშუალო კლასი' },
      { value: 'high', label: '60₾+', icon: '👑', desc: 'პრემიუმ' },
    ],
  },
]

const quizCategoryMap: Record<string, string[]> = {
  pupil: ['school', 'notebooks', 'pens'],
  student: ['notebooks', 'pens', 'office'],
  office: ['office', 'pens', 'notebooks'],
  artist: ['art', 'notebooks', 'pens'],
}

function getQuizResults(answers: QuizAnswer, productsList: Product[]): Product[] {
  const preferred = quizCategoryMap[answers.forWhom] ?? []
  const inBudget = (price: number) =>
    answers.budget === 'low' ? price <= 20 : answers.budget === 'mid' ? price > 20 && price <= 60 : price > 60

  const score = (p: Product) => {
    let s = 0
    const catIndex = preferred.indexOf(p.category)
    if (catIndex !== -1) s += 3 - catIndex
    if (inBudget(p.price)) s += 3
    if (p.tag === 'ბესტსელერი') s += 2
    if (p.originalPrice) s += 1
    return s
  }

  return [...productsList].sort((a, b) => score(b) - score(a)).slice(0, 3)
}

function StationeryQuizPage() {
  const { products } = useData()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswer>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const currentStep = quizSteps[step]
  const progress = ((step + 1) / quizSteps.length) * 100

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentStep.key]: value }
    setAnswers(newAnswers)

    if (step < quizSteps.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleRestart = () => {
    setStep(0)
    setAnswers({})
    setShowResults(false)
    window.scrollTo(0, 0)
  }

  const results = showResults ? getQuizResults(answers as QuizAnswer, products) : []

  return (
    <section className="quiz-page">
      <div className="quiz-hero">
        <div className="container">
          <span className="section-tag">ქვიზი</span>
          <h1>იპოვე შენი იდეალური საკანცელარიო</h1>
          <p>უპასუხე 5 კითხვას და ჩვენ შეგარჩევთ საუკეთესო ვარიანტს</p>
        </div>
      </div>

      <div className="container quiz-container">
        {!showResults ? (
          <>
            {/* Progress */}
            <div className="quiz-progress">
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="quiz-step-label">ნაბიჯი {step + 1} / {quizSteps.length}</span>
            </div>

            {/* Question */}
            <div className="quiz-question-card">
              <h2 className="quiz-question">{currentStep.question}</h2>
              <p className="quiz-subtitle">{currentStep.subtitle}</p>

              <div className="quiz-options">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.value}
                    className={`quiz-option ${answers[currentStep.key] === opt.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="quiz-option-icon">{opt.icon}</span>
                    <span className="quiz-option-label">{opt.label}</span>
                    <span className="quiz-option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button className="quiz-back-btn" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  წინა კითხვა
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results */
          <div className="quiz-results">
            <div className="quiz-results-header">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2>შენი რეკომენდაციები</h2>
              <p>შენი პასუხების საფუძველზე, ეს ნივთები საუკეთესოდ მოგერგება</p>
            </div>

            <div className="quiz-results-grid">
              {results.map((product, i) => (
                <div key={product.id} className="quiz-result-card">
                  {i === 0 && <span className="quiz-best-match">საუკეთესო შესაბამისობა</span>}
                  <div className="quiz-result-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="quiz-result-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="quiz-result-specs">
                      <span>{product.dimensions}</span>
                      <span>{product.material}</span>
                    </div>
                    <div className="quiz-result-footer">
                      <div className="product-pricing">
                        <span className="product-price">₾{product.price}</span>
                        {product.originalPrice && (
                          <span className="product-original">₾{product.originalPrice}</span>
                        )}
                      </div>
                      <Link to={`/product/${product.id}`} className="btn btn-primary btn-sm">
                        დეტალურად
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-results-actions">
              <button className="btn btn-outline" onClick={handleRestart}>
                თავიდან დაწყება
              </button>
              <Link to="/category/notebooks" className="btn btn-primary">
                ყველა პროდუქტის ნახვა
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Home Page ───────────────────────────────────── */
function HomePage() {
  return (
    <>
      <HeroSlider />
      <CollectionsSection />
      <CategoriesSection />
      <div className="quiz-cta">
        <div className="container">
          <div className="quiz-cta-inner">
            <div className="quiz-cta-visual">
              <span className="quiz-cta-icon">🎒</span>
              <div className="quiz-cta-dots">
                <span /><span /><span />
              </div>
            </div>
            <div className="quiz-cta-content">
              <span className="quiz-cta-badge">ინტერაქტიული ქვიზი</span>
              <h2>ვერ არჩევ რა იყიდო?</h2>
              <p>უპასუხე სულ რაღაც <strong>5 მარტივ კითხვას</strong> და ჩვენ შეგირჩევთ საკანცელარიოს — სკოლისთვის, უნივერსიტეტისთვის, ოფისისთვის ან შემოქმედებისთვის.</p>
              <div className="quiz-cta-features">
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>1 წუთი</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span>პერსონალური შედეგი</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <span>ყველა ბიუჯეტი</span>
                </div>
              </div>
              <Link to="/quiz" className="btn btn-primary quiz-cta-btn">
                ქვიზის დაწყება
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="builder-cta">
        <div className="container">
          <div className="quiz-cta-inner">
            <div className="quiz-cta-visual">
              <span className="quiz-cta-icon">�</span>
              <div className="quiz-cta-dots">
                <span /><span /><span />
              </div>
            </div>
            <div className="quiz-cta-content">
              <span className="quiz-cta-badge">კონფიგურატორი</span>
              <h2>ააწყვე შენი რვეული</h2>
              <p>აირჩიე ფორმატი, ქაღალდი, ფურცლების რაოდენობა და ყდა — შექმენი <strong>ზუსტად შენზე მორგებული</strong> რვეული 4 მარტივ ნაბიჯში.</p>
              <div className="quiz-cta-features">
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                  <span>4 ფორმატი</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  <span>5 ქაღალდის ტიპი</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <span>₾8-დან</span>
                </div>
              </div>
              <Link to="/notebook-builder" className="btn btn-primary quiz-cta-btn">
                აწყობის დაწყება
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <FeaturedProducts />
    </>
  )
}

/* ── Notebook Builder Page ────────────────────────── */

const notebookFormats = [
  { key: 'a6', label: 'ჯიბის (A6)', dims: '105 × 148 მმ', icon: '📒', price: 8 },
  { key: 'a5', label: 'სტანდარტული (A5)', dims: '148 × 210 მმ', icon: '📓', price: 12 },
  { key: 'b5', label: 'სტუდენტური (B5)', dims: '176 × 250 მმ', icon: '📔', price: 15 },
  { key: 'a4', label: 'დიდი (A4)', dims: '210 × 297 მმ', icon: '📕', price: 18 },
]

const notebookPapers = [
  { key: 'lined', label: 'ხაზიანი', desc: 'კლასიკური ვარიანტი წერისა და კონსპექტისთვის', icon: '📝', priceAdd: 0 },
  { key: 'grid', label: 'უჯრიანი', desc: 'მათემატიკისთვის, ცხრილებისა და სქემებისთვის', icon: '🔲', priceAdd: 0 },
  { key: 'dotted', label: 'წერტილოვანი', desc: 'Bullet journal-ისა და დაგეგმვისთვის', icon: '⬚', priceAdd: 2 },
  { key: 'blank', label: 'სუფთა', desc: 'სკეტჩებისა და თავისუფალი იდეებისთვის', icon: '📄', priceAdd: 2 },
  { key: 'sketch', label: 'სქეტჩის ქაღალდი (120 გ/მ²)', desc: 'სქელი ქაღალდი მარკერისა და აქვარელისთვის', icon: '🎨', priceAdd: 6 },
]

const notebookPages = [
  { key: '48', label: '48 ფურცელი', desc: 'მსუბუქი, ჩანთაში დასატარებლად', level: 1, priceAdd: 0 },
  { key: '96', label: '96 ფურცელი', desc: 'უნივერსალური', level: 2, priceAdd: 4 },
  { key: '160', label: '160 ფურცელი', desc: 'მთელი სემესტროსთვის', level: 3, priceAdd: 8 },
  { key: '200', label: '200 ფურცელი', desc: 'მრავალსაგნიანი', level: 4, priceAdd: 12 },
]

const notebookCovers = [
  { key: 'soft', label: 'რბილი', icon: '📃', priceAdd: 0 },
  { key: 'hard', label: 'მაყარი', icon: '📘', priceAdd: 5 },
  { key: 'kraft', label: 'კრაფტი', icon: '🌿', priceAdd: 4 },
  { key: 'leather', label: 'ტყავის', icon: '✨', priceAdd: 25 },
]

function NotebookBuilderPage() {
  const [step, setStep] = useState(0)
  const [format, setFormat] = useState('')
  const [paper, setPaper] = useState('')
  const [pages, setPages] = useState('')
  const [cover, setCover] = useState('')
  const [showResult, setShowResult] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const steps = [
    { title: 'ფორმატი', subtitle: 'აირჩიე რვეულის ფორმატი' },
    { title: 'ქაღალდი', subtitle: 'რომელი ქაღალდი გინდა?' },
    { title: 'ფურცლები', subtitle: 'რამდენი ფურცელი გჭირდება?' },
    { title: 'ყდა', subtitle: 'აირჩიე ყდის ტიპი' },
  ]

  const progress = ((step + 1) / steps.length) * 100

  const handleSelectFormat = (key: string) => { setFormat(key); setStep(1) }
  const handleSelectPaper = (key: string) => { setPaper(key); setStep(2) }
  const handleSelectPages = (key: string) => { setPages(key); setStep(3) }
  const handleSelectCover = (key: string) => { setCover(key); setShowResult(true) }

  const handleBack = () => {
    if (showResult) { setShowResult(false); return }
    if (step > 0) setStep(step - 1)
  }

  const handleRestart = () => {
    setStep(0); setFormat(''); setPaper(''); setPages(''); setCover(''); setShowResult(false)
  }

  const selectedFormat = notebookFormats.find(f => f.key === format)
  const selectedPaper = notebookPapers.find(p => p.key === paper)
  const selectedPages = notebookPages.find(p => p.key === pages)
  const selectedCover = notebookCovers.find(c => c.key === cover)

  const totalPrice = (selectedFormat?.price || 0)
    + (selectedPaper?.priceAdd || 0)
    + (selectedPages?.priceAdd || 0)
    + (selectedCover?.priceAdd || 0)

  return (
    <section className="builder-page">
      <div className="mb-hero">
        <div className="container">
          <span className="section-tag">კონფიგურატორი</span>
          <h1>ააწყვე შენი რვეული</h1>
          <p>აირჩიე ფორმატი, ქაღალდი, ფურცლების რაოდენობა და ყდა — შექმენი ზუსტად შენზე მორგებული რვეული</p>
        </div>
      </div>

      <div className="container mb-container">
        <div className="mb-layout">
          {/* ── Summary sidebar ── */}
          <div className="mb-summary">
            <h4>შენი კონფიგურაცია</h4>
            <div className="mb-summary-items">
              <div className={`mb-summary-item ${format ? 'filled' : ''}`}>
                <span className="mb-sum-label">ფორმატი</span>
                <span className="mb-sum-value">{selectedFormat ? `${selectedFormat.label} (${selectedFormat.dims})` : '—'}</span>
              </div>
              <div className={`mb-summary-item ${paper ? 'filled' : ''}`}>
                <span className="mb-sum-label">ქაღალდი</span>
                <span className="mb-sum-value">{selectedPaper ? selectedPaper.label : '—'}</span>
              </div>
              <div className={`mb-summary-item ${pages ? 'filled' : ''}`}>
                <span className="mb-sum-label">ფურცლები</span>
                <span className="mb-sum-value">{selectedPages ? selectedPages.label : '—'}</span>
              </div>
              <div className={`mb-summary-item ${cover ? 'filled' : ''}`}>
                <span className="mb-sum-label">ყდა</span>
                <span className="mb-sum-value">{selectedCover ? selectedCover.label : '—'}</span>
              </div>
            </div>
            {(format || paper || pages || cover) && (
              <div className="mb-summary-price">
                <span>სავარაუდო ფასი</span>
                <strong>₾{totalPrice}</strong>
              </div>
            )}
          </div>

          {/* ── Step content ── */}
          <div className="mb-steps">
            {!showResult && (
              <>
                <div className="mb-progress">
                  <div className="mb-progress-bar">
                    <div className="mb-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="mb-step-label">{steps[step].title} — ნაბიჯი {step + 1}/{steps.length}</span>
                </div>

                <div className="mb-step-header">
                  <h3>{steps[step].subtitle}</h3>
                </div>
              </>
            )}

            {/* Step 0: Format */}
            {!showResult && step === 0 && (
              <div className="mb-options-grid cols-4">
                {notebookFormats.map(f => (
                  <button key={f.key} className={`mb-option ${format === f.key ? 'selected' : ''}`} onClick={() => handleSelectFormat(f.key)}>
                    <span className="mb-opt-icon">{f.icon}</span>
                    <span className="mb-opt-label">{f.label}</span>
                    <span className="mb-opt-desc">{f.dims}</span>
                    <span className="mb-opt-price">₾{f.price}-დან</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Paper */}
            {!showResult && step === 1 && (
              <div className="mb-options-grid cols-1">
                {notebookPapers.map(p => (
                  <button key={p.key} className={`mb-option-row ${paper === p.key ? 'selected' : ''}`} onClick={() => handleSelectPaper(p.key)}>
                    <span className="mb-opt-icon">{p.icon}</span>
                    <div className="mb-opt-text">
                      <span className="mb-opt-label">{p.label}</span>
                      <span className="mb-opt-desc">{p.desc}</span>
                    </div>
                    {p.priceAdd > 0 && <span className="mb-opt-add">+₾{p.priceAdd}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Pages */}
            {!showResult && step === 2 && (
              <div className="mb-options-grid cols-4">
                {notebookPages.map(p => (
                  <button key={p.key} className={`mb-option ${pages === p.key ? 'selected' : ''}`} onClick={() => handleSelectPages(p.key)}>
                    <div className="mb-firmness-bar">
                      {[1, 2, 3, 4].map(i => (
                        <span key={i} className={`mb-firm-dot ${i <= p.level ? 'active' : ''}`} />
                      ))}
                    </div>
                    <span className="mb-opt-label">{p.label}</span>
                    <span className="mb-opt-desc">{p.desc}</span>
                    {p.priceAdd > 0 && <span className="mb-opt-add">+₾{p.priceAdd}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Cover */}
            {!showResult && step === 3 && (
              <div className="mb-options-grid cols-4">
                {notebookCovers.map(c => (
                  <button key={c.key} className={`mb-option ${cover === c.key ? 'selected' : ''}`} onClick={() => handleSelectCover(c.key)}>
                    <span className="mb-opt-icon">{c.icon}</span>
                    <span className="mb-opt-label">{c.label}</span>
                    {c.priceAdd > 0 && <span className="mb-opt-add">+₾{c.priceAdd}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Result */}
            {showResult && (
              <div className="mb-result">
                <div className="mb-result-header">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h3>შენი რვეული მზადაა!</h3>
                  <p>აი, შენი კონფიგურაციის შეჯამება</p>
                </div>

                <div className="mb-result-specs">
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedFormat?.icon}</span>
                    <div>
                      <strong>{selectedFormat?.label}</strong>
                      <span>{selectedFormat?.dims}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedPaper?.icon}</span>
                    <div>
                      <strong>{selectedPaper?.label}</strong>
                      <span>{selectedPaper?.desc}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">📚</span>
                    <div>
                      <strong>{selectedPages?.label}</strong>
                      <span>{selectedPages?.desc}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedCover?.icon}</span>
                    <div>
                      <strong>{selectedCover?.label} ყდა</strong>
                      <span>გამძლე და მოსახერხებელი ყოველდღიური გამოყენებისთვის</span>
                    </div>
                  </div>
                </div>

                <div className="mb-result-total">
                  <div>
                    <span>საბოლოო ფასი</span>
                    <strong>₾{totalPrice}</strong>
                  </div>
                  <div className="mb-result-btns">
                    <button className="btn btn-outline" onClick={handleRestart}>თავიდან აწყობა</button>
                    <button className="btn btn-primary">შეკვეთა</button>
                  </div>
                </div>
              </div>
            )}

            {/* Back button */}
            {(step > 0 || showResult) && !showResult && (
              <button className="mb-back-btn" onClick={handleBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                წინა ნაბიჯი
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Collection Page ─────────────────────────────── */
const COLLECTION_PAGE_SIZE = 24

function toProduct(p: CollectionProductsResponse['items'][number]): Product {
  return { ...p, originalPrice: p.originalPrice ?? undefined, tag: p.tag ?? undefined }
}

function CollectionRoute() {
  const { slug = '' } = useParams<{ slug: string }>()
  return <CollectionPage key={slug} slug={slug} />
}

function CollectionPage({ slug }: { slug: string }) {
  const { categories } = useData()
  const [collection, setCollection] = useState<CollectionResponse | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [onSale, setOnSale] = useState(false)
  const [priceDraft, setPriceDraft] = useState({ min: '', max: '' })
  const [price, setPrice] = useState<{ min?: number; max?: number }>({})
  const [page, setPage] = useState(1)

  const [result, setResult] = useState<CollectionProductsResponse | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [loadedKey, setLoadedKey] = useState('')

  const queryKey = JSON.stringify({ category, sortBy, onSale, price, page })
  const loadingProducts = loadedKey !== queryKey

  useEffect(() => {
    window.scrollTo(0, 0)
    collectionsApi.getBySlug(slug).then(setCollection).catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => {
    let cancelled = false
    collectionsApi.getProducts(slug, {
      category: category || undefined,
      minPrice: price.min,
      maxPrice: price.max,
      onSale,
      sortBy: sortBy || undefined,
      page,
      pageSize: COLLECTION_PAGE_SIZE,
    }).then(res => {
      if (cancelled) return
      const mapped = res.items.map(toProduct)
      setResult(res)
      setItems(prev => (page === 1 ? mapped : [...prev, ...mapped]))
      setLoadedKey(queryKey)
    }).catch(err => {
      if (!cancelled) console.error('Failed to load collection products:', err)
    })
    return () => { cancelled = true }
  }, [slug, category, sortBy, onSale, price, page, queryKey])

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault()
    setPrice({
      min: priceDraft.min === '' ? undefined : Number(priceDraft.min),
      max: priceDraft.max === '' ? undefined : Number(priceDraft.max),
    })
    setPage(1)
  }

  const resetFilters = () => {
    setCategory('')
    setOnSale(false)
    setPriceDraft({ min: '', max: '' })
    setPrice({})
    setPage(1)
  }

  const hasActiveFilters = category !== '' || onSale || price.min !== undefined || price.max !== undefined
  const categoryName = (s: string) => categories.find(c => c.slug === s)?.name ?? s

  if (notFound) {
    return (
      <div className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>კოლექცია ვერ მოიძებნა</h2>
        <p style={{ margin: '16px 0 32px', color: 'var(--secondary)' }}>კოლექცია არ არსებობს ან აღარ არის აქტიური.</p>
        <Link to="/" className="btn btn-primary">მთავარ გვერდზე დაბრუნება</Link>
      </div>
    )
  }

  if (!collection) {
    return <div className="container collection-loading">იტვირთება...</div>
  }

  return (
    <section className="collection-page">
      <div className="collection-hero">
        <img src={collection.bannerImage ?? collection.coverImage} alt={collection.name} className="collection-hero-bg" />
        <div className="collection-hero-overlay">
          <div className="container">
            <span className="collection-hero-tag">კოლექცია</span>
            <h1>{collection.name}</h1>
            {collection.description && <p>{collection.description}</p>}
          </div>
        </div>
      </div>

      <div className="container">
        <form className="collection-filters" onSubmit={applyPrice}>
          <select
            className="sort-select"
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}
            aria-label="კატეგორია"
          >
            <option value="">ყველა კატეგორია</option>
            {result?.availableCategories.map(s => (
              <option key={s} value={s}>{categoryName(s)}</option>
            ))}
          </select>

          <div className="price-range">
            <input
              type="number" min={0} step="0.01" placeholder="ფასი ₾-დან" aria-label="მინიმალური ფასი"
              value={priceDraft.min} onChange={e => setPriceDraft({ ...priceDraft, min: e.target.value })}
            />
            <span>—</span>
            <input
              type="number" min={0} step="0.01" placeholder="₾-მდე" aria-label="მაქსიმალური ფასი"
              value={priceDraft.max} onChange={e => setPriceDraft({ ...priceDraft, max: e.target.value })}
            />
            <button type="submit" className="btn btn-outline btn-sm">გაფილტვრა</button>
          </div>

          <label className="checkbox-label">
            <input type="checkbox" checked={onSale} onChange={e => { setOnSale(e.target.checked); setPage(1) }} />
            მხოლოდ ფასდაკლებული
          </label>

          <select
            className="sort-select"
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1) }}
            aria-label="დალაგება"
          >
            <option value="">რეკომენდებული</option>
            <option value="price-asc">ფასი: დაბალიდან</option>
            <option value="price-desc">ფასი: მაღალიდან</option>
            <option value="name">სახელით</option>
            <option value="newest">უახლესი</option>
          </select>
        </form>

        <div className="catalog-toolbar">
          <span className="results-count">{result ? `${result.totalCount} ნივთი ნაპოვნია` : 'იტვირთება...'}</span>
          {hasActiveFilters && (
            <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>ფილტრების გასუფთავება</button>
          )}
        </div>

        {items.length === 0 && !loadingProducts ? (
          <div className="collection-empty">ამ ფილტრებით პროდუქტი ვერ მოიძებნა.</div>
        ) : (
          <div className="products-grid">
            {items.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {result && items.length < result.totalCount && (
          <div className="products-cta">
            <button className="btn btn-outline" disabled={loadingProducts} onClick={() => setPage(p => p + 1)}>
              {loadingProducts ? 'იტვირთება...' : 'მეტის ჩატვირთვა'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Category Page ───────────────────────────────── */
function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toggleCart, isInCart } = useCart()
  const { categories, products } = useData()
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const category = categories.find(c => c.slug === slug)
  const categoryProducts = products.filter(p => p.category === slug)

  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  if (!category) {
    return (
      <div className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>კატეგორია ვერ მოიძებნა</h2>
        <p style={{ margin: '16px 0 32px', color: 'var(--secondary)' }}>მოთხოვნილი კატეგორია არ არსებობს.</p>
        <Link to="/" className="btn btn-primary">მთავარ გვერდზე დაბრუნება</Link>
      </div>
    )
  }

  return (
    <section className="category-page">
      {/* ── Hero Banner ── */}
      <div className="category-hero">
        <img src={category.image} alt={category.name} className="category-hero-bg" />
        <div className="category-hero-overlay">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              უკან
            </button>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
            <span className="category-count">{sortedProducts.length} პროდუქტი</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="container">
        <div className="catalog-toolbar">
          <div className="toolbar-left">
            <span className="results-count">{sortedProducts.length} ნივთი ნაპოვნია</span>
          </div>
          <div className="toolbar-right">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="default">სორტირება</option>
              <option value="price-asc">ფასი: დაბალიდან</option>
              <option value="price-desc">ფასი: მაღალიდან</option>
            </select>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="ბადე"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="სია"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Grid View ── */}
        {viewMode === 'grid' && (
          <div className="catalog-grid">
            {sortedProducts.map((product) => (
              <div key={product.id} className="catalog-card">
                <div className="catalog-card-image">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  {product.tag && (
                    <span className={`product-tag tag-${product.tag === 'ფასდაკლება' ? 'sale' : product.tag === 'ბესტსელერი' ? 'best' : 'new'}`}>
                      {product.tag}
                    </span>
                  )}
                  <div className="product-actions">
                    <button className="action-btn" aria-label="სურვილების სიაში">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                    <button className="action-btn" aria-label="კალათაში">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="catalog-card-info">
                  <Link to={`/product/${product.id}`} className="product-name-link"><h3>{product.name}</h3></Link>
                  <p className="catalog-card-desc">{product.description}</p>
                  <div className="catalog-card-specs">
                    <div className="spec">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                      <span>{product.dimensions}</span>
                    </div>
                    <div className="spec">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <span>{product.material}</span>
                    </div>
                    <div className="spec">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>{product.color}</span>
                    </div>
                  </div>
                  <div className="catalog-card-footer">
                    <div className="product-pricing">
                      <span className="product-price">₾{product.price}</span>
                      {product.originalPrice && (
                        <span className="product-original">₾{product.originalPrice}</span>
                      )}
                    </div>
                    <button className={`btn btn-sm ${isInCart(product.id) ? 'btn-in-cart' : 'btn-primary'}`} onClick={() => toggleCart(product)}>
                      {isInCart(product.id) ? '✓ კალათაშია' : 'კალათაში'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && (
          <div className="catalog-list">
            {sortedProducts.map((product) => (
              <div key={product.id} className="list-card">
                <Link to={`/product/${product.id}`} className="list-card-image">
                  <img src={product.image} alt={product.name} />
                  {product.tag && (
                    <span className={`product-tag tag-${product.tag === 'ფასდაკლება' ? 'sale' : product.tag === 'ბესტსელერი' ? 'best' : 'new'}`}>
                      {product.tag}
                    </span>
                  )}
                </Link>
                <div className="list-card-body">
                  <div className="list-card-top">
                    <Link to={`/product/${product.id}`} className="product-name-link"><h3>{product.name}</h3></Link>
                    <div className="product-pricing">
                      <span className="product-price">₾{product.price}</span>
                      {product.originalPrice && (
                        <span className="product-original">₾{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <p className="list-card-desc">{product.description}</p>
                  <div className="list-card-specs">
                    <div className="spec-pill">
                      <strong>ზომა:</strong> {product.dimensions}
                    </div>
                    <div className="spec-pill">
                      <strong>მასალა:</strong> {product.material}
                    </div>
                    <div className="spec-pill">
                      <strong>ფერი:</strong> {product.color}
                    </div>
                  </div>
                  <div className="list-card-actions">
                    <button className={`btn btn-sm ${isInCart(product.id) ? 'btn-in-cart' : 'btn-primary'}`} onClick={() => toggleCart(product)}>
                      {isInCart(product.id) ? '✓ კალათაშია' : 'კალათაში დამატება'}
                    </button>
                    <button className="btn btn-outline btn-sm">სურვილების სია</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Other Categories ── */}
      <div className="container other-categories">
        <h3>სხვა კატეგორიები</h3>
        <div className="other-cats-row">
          {categories.filter(c => c.slug !== slug).map(c => (
            <Link to={`/category/${c.slug}`} key={c.id} className="other-cat-card">
              <img src={c.image} alt={c.name} />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   APP & ROUTES
   ══════════════════════════════════════════════════ */

/* ── Cart Page ───────────────────────────────────── */
function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [checkoutForm, setCheckoutForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '' })
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ invoiceNumber: string } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await ordersApi.create({
        customerName: checkoutForm.customerName,
        customerPhone: checkoutForm.customerPhone,
        customerEmail: checkoutForm.customerEmail,
        customerAddress: checkoutForm.customerAddress,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      })
      setOrderSuccess({ invoiceNumber: result.invoiceNumber })
      clearCart()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'შეკვეთის გაფორმება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #C9A96E)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2>შეკვეთა წარმატებით გაფორმდა!</h2>
            <p>ინვოისის ნომერი: <strong>#{orderSuccess.invoiceNumber}</strong></p>
            <p>PDF ინვოისი გამოგეგზავნათ მეილზე.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>მაღაზიაში დაბრუნება</Link>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <h2>კალათა ცარიელია</h2>
            <p>ჯერ არაფერი დაგიმატებია კალათაში</p>
            <Link to="/" className="btn btn-primary">მაღაზიაში დაბრუნება</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>შენი კალათა</h1>
          <span className="cart-items-count">{totalItems} ნივთი</span>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <h3>{product.name}</h3>
                      <p className="cart-item-meta">{product.material} · {product.color}</p>
                      <p className="cart-item-dims">{product.dimensions}</p>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(product.id)} aria-label="წაშლა">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="შემცირება">−</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="გაზრდა">+</button>
                    </div>
                    <div className="cart-item-price">
                      <span className="product-price">₾{product.price * quantity}</span>
                      {quantity > 1 && <span className="cart-unit-price">₾{product.price} / ცალი</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="clear-cart-btn" onClick={clearCart}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              კალათის გასუფთავება
            </button>
          </div>

          <div className="cart-summary">
            <h3>შეკვეთის შეჯამება</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>ნივთები ({totalItems})</span>
                <span>₾{totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>მიტანა</span>
                <span>{totalPrice >= 200 ? <span className="free-delivery">უფასო</span> : '₾25'}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>ჯამი</span>
                <span>₾{totalPrice >= 200 ? totalPrice : totalPrice + 25}</span>
              </div>
            </div>
            {totalPrice < 200 && (
              <p className="delivery-hint">
                დაამატე კიდევ ₾{200 - totalPrice} უფასო მიტანისთვის
              </p>
            )}

            <form className="checkout-form" onSubmit={handleCheckout}>
              <h4>შეკვეთის გაფორმება</h4>
              <div className="form-group">
                <label htmlFor="checkout-name">სახელი და გვარი *</label>
                <input type="text" id="checkout-name" value={checkoutForm.customerName} onChange={e => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })} required placeholder="მაგ: გიორგი მაისურაძე" />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-phone">ტელეფონი *</label>
                <input type="tel" id="checkout-phone" value={checkoutForm.customerPhone} onChange={e => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })} required placeholder="+995 5XX XXX XXX" />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-email">ელ. ფოსტა *</label>
                <input type="email" id="checkout-email" value={checkoutForm.customerEmail} onChange={e => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })} required placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-address">მისამართი *</label>
                <input type="text" id="checkout-address" value={checkoutForm.customerAddress} onChange={e => setCheckoutForm({ ...checkoutForm, customerAddress: e.target.value })} required placeholder="მაგ: თბილისი, რუსთაველის გამზ. 12" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? 'მუშავდება...' : 'შეკვეთის დადასტურება'}
              </button>
            </form>

            <Link to="/" className="btn btn-outline btn-full">მაღაზიაში დაბრუნება</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Layout() {
  return (
    <AuthProvider>
    <DataProvider>
      <CartProvider>
        <Navbar />
        <Outlet />
        <Footer />
        <a
          href="https://wa.me/995568222234"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          aria-label="WhatsApp"
        >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.054 9.376L1.054 31.2l6.042-1.94A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.598c-.39 1.1-1.932 2.014-3.168 2.28-.844.18-1.946.324-5.658-1.216-4.752-1.97-7.808-6.8-8.044-7.116-.228-.316-1.912-2.548-1.912-4.86s1.21-3.448 1.64-3.92c.43-.47.938-.588 1.252-.588.314 0 .628.002.902.016.29.014.678-.11 1.06.81.392.94 1.332 3.252 1.448 3.488.118.236.196.51.04.824-.158.316-.236.512-.472.788-.236.274-.496.612-.708.822-.236.236-.482.492-.208.964.274.472 1.218 2.012 2.616 3.26 1.798 1.604 3.314 2.1 3.786 2.336.472.236.748.196 1.024-.118.274-.314 1.178-1.374 1.492-1.844.314-.472.628-.392 1.06-.236.432.158 2.742 1.294 3.212 1.53.472.236.786.354.902.55.118.196.118 1.138-.27 2.24z" />
        </svg>
      </a>
    </CartProvider>
    </DataProvider>
    </AuthProvider>
  )
}

/* ── Product Detail Page ─────────────────────────── */
function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toggleCart, isInCart } = useCart()
  const { categories, products } = useData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const product = products.find(p => p.id === id)

  if (!product) {
    return (
      <div className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>პროდუქტი ვერ მოიძებნა</h2>
        <p style={{ margin: '16px 0 32px', color: 'var(--secondary)' }}>მოთხოვნილი პროდუქტი არ არსებობს.</p>
        <Link to="/" className="btn btn-primary">მთავარ გვერდზე დაბრუნება</Link>
      </div>
    )
  }

  const category = categories.find(c => c.slug === product.category)
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
  const inCart = isInCart(product.id)

  return (
    <section className="product-detail">
      <div className="container">
        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <Link to="/">მთავარი</Link>
          <span className="breadcrumb-sep">/</span>
          {category && (
            <>
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
              <span className="breadcrumb-sep">/</span>
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="detail-layout">
          {/* ── Image Gallery ── */}
          <div className="detail-gallery">
            <div className="detail-main-image">
              <img src={product.image} alt={product.name} />
              {product.tag && (
                <span className={`product-tag tag-${product.tag === 'ფასდაკლება' ? 'sale' : product.tag === 'ბესტსელერი' ? 'best' : 'new'}`}>
                  {product.tag}
                </span>
              )}
            </div>
            <div className="detail-thumbs">
              <div className="detail-thumb active">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="detail-thumb">
                <img src={product.image} alt={product.name} style={{ objectPosition: 'left' }} />
              </div>
              <div className="detail-thumb">
                <img src={product.image} alt={product.name} style={{ objectPosition: 'right' }} />
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="detail-info">
            <div className="detail-top">
              <button className="back-link" onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                უკან
              </button>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-pricing">
              <span className="detail-price">₾{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="detail-original">₾{product.originalPrice}</span>
                  <span className="detail-discount">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                </>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-specs">
              <h4>მახასიათებლები</h4>
              <div className="detail-specs-grid">
                <div className="detail-spec-item">
                  <span className="detail-spec-label">ზომა</span>
                  <span className="detail-spec-value">{product.dimensions}</span>
                </div>
                <div className="detail-spec-item">
                  <span className="detail-spec-label">მასალა</span>
                  <span className="detail-spec-value">{product.material}</span>
                </div>
                <div className="detail-spec-item">
                  <span className="detail-spec-label">ფერი</span>
                  <span className="detail-spec-value">{product.color}</span>
                </div>
                <div className="detail-spec-item">
                  <span className="detail-spec-label">კატეგორია</span>
                  <span className="detail-spec-value">{category?.name || product.category}</span>
                </div>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className={`btn btn-lg ${inCart ? 'btn-in-cart' : 'btn-primary'}`}
                onClick={() => toggleCart(product)}
              >
                {inCart ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    კალათაშია — ამოშლა
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    კალათაში დამატება
                  </>
                )}
              </button>
              <button className="btn btn-outline btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                სურვილების სია
              </button>
            </div>

            <div className="detail-guarantees">
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>ორიგინალი პროდუქცია</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>უფასო მიტანა ₾200+</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>14 დღიანი დაბრუნება</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3>მსგავსი პროდუქტები</h3>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   AUTH CONTEXT
   ══════════════════════════════════════════════════ */

type AuthContextType = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('windlife-admin-token'))

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    localStorage.setItem('windlife-admin-token', res.token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('windlife-admin-token')
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

/* ══════════════════════════════════════════════════
   ADMIN LOGIN PAGE
   ══════════════════════════════════════════════════ */

function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin', { replace: true })
    } catch {
      setError('არასწორი მომხმარებელი ან პაროლი')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <h1>ადმინ პანელი</h1>
          <p>შედით სისტემაში ცვლილებების განსახორციელებლად</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-username">მომხმარებელი</label>
            <input type="text" id="admin-username" value={username} onChange={e => setUsername(e.target.value)} placeholder="მომხმარებლის სახელი" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">პაროლი</label>
            <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="პაროლი" required />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'შესვლა...' : 'შესვლა'}
          </button>
        </form>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   ADMIN PAGE
   ══════════════════════════════════════════════════ */

const emptyProductForm = {
  name: '',
  price: 0,
  originalPrice: undefined as number | undefined,
  image: '',
  tag: '',
  category: '',
  description: '',
  dimensions: '',
  material: '',
  color: '',
}

function AdminPage() {
  const { categories, heroSlides, products, addCategory, updateCategory, removeCategory, addSlide, removeSlide, addProduct, updateProduct, removeProduct } = useData()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'slides' | 'collections'>('categories')

  // Category form
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image: '', icon: '', count: 0 })
  const [editingCatId, setEditingCatId] = useState<string | null>(null)

  // Product form
  const [prodForm, setProdForm] = useState({ ...emptyProductForm })
  const [editingProdId, setEditingProdId] = useState<string | null>(null)
  const [prodFilterCat, setProdFilterCat] = useState<string>('all')

  // Slide form
  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', description: '', image: '', buttonText: '', buttonLink: '', accent: '#7B1E2B' })

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // ── Category handlers ──
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catForm.name || !catForm.slug || !catForm.image) return
    if (editingCatId !== null) {
      updateCategory(editingCatId, catForm)
      setEditingCatId(null)
    } else {
      addCategory(catForm)
    }
    setCatForm({ name: '', slug: '', description: '', image: '', icon: '', count: 0 })
  }

  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id)
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, icon: cat.icon || '', count: cat.count })
  }

  const cancelEditCat = () => {
    setEditingCatId(null)
    setCatForm({ name: '', slug: '', description: '', image: '', icon: '', count: 0 })
  }

  // ── Product handlers ──
  const handleProdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodForm.name || !prodForm.image || !prodForm.category) return
    const data = {
      ...prodForm,
      price: Number(prodForm.price),
      originalPrice: prodForm.originalPrice ? Number(prodForm.originalPrice) : undefined,
      tag: prodForm.tag || undefined,
    }
    if (editingProdId !== null) {
      updateProduct(editingProdId, data)
      setEditingProdId(null)
    } else {
      addProduct(data)
    }
    setProdForm({ ...emptyProductForm })
  }

  const startEditProd = (p: Product) => {
    setEditingProdId(p.id)
    setProdForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      tag: p.tag || '',
      category: p.category,
      description: p.description,
      dimensions: p.dimensions,
      material: p.material,
      color: p.color,
    })
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const cancelEditProd = () => {
    setEditingProdId(null)
    setProdForm({ ...emptyProductForm })
  }

  // ── Slide handlers ──
  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slideForm.title || !slideForm.image) return
    addSlide(slideForm)
    setSlideForm({ title: '', subtitle: '', description: '', image: '', buttonText: '', buttonLink: '', accent: '#7B1E2B' })
  }

  // ── Image upload handler ──
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('ფაილის ზომა არ უნდა აღემატებოდეს 2 MB-ს.')
      return
    }
    setUploading(true)
    try {
      const url = await uploadApi.upload(file)
      onSuccess(url)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'ფოტოს ატვირთვა ვერ მოხერხდა.')
    } finally {
      setUploading(false)
    }
  }

  // Filtered products
  const filteredProducts = prodFilterCat === 'all' ? products : products.filter(p => p.category === prodFilterCat)

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div className="container">
          <span className="section-tag">ადმინისტრირება</span>
          <h1>ადმინ პანელი</h1>
          <p>კატეგორიების, პროდუქტების და სლაიდების მართვა</p>
          <button className="btn btn-outline admin-logout-btn" onClick={() => { logout(); navigate('/') }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            გასვლა
          </button>
        </div>
      </div>

      <div className="container admin-content">
        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            კატეგორიები ({categories.length})
          </button>
          <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            პროდუქტები ({products.length})
          </button>
          <button className={`admin-tab ${activeTab === 'slides' ? 'active' : ''}`} onClick={() => setActiveTab('slides')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            სლაიდები ({heroSlides.length})
          </button>
          <button className={`admin-tab ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => setActiveTab('collections')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            კოლექციები
          </button>
        </div>

        {activeTab === 'collections' && (
          <CollectionsAdmin uploading={uploading} onUpload={handleImageUpload} />
        )}

        {/* ════════════ Categories Tab ════════════ */}
        {activeTab === 'categories' && (
          <div className="admin-section">
            <div className="admin-grid">
              <div className="admin-form-card">
                <h3>{editingCatId !== null ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორიის დამატება'}</h3>
                <form onSubmit={handleCatSubmit}>
                  <div className="form-group">
                    <label htmlFor="cat-name">სახელი *</label>
                    <input type="text" id="cat-name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="მაგ: რვეულები" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-slug">Slug (URL) *</label>
                    <input type="text" id="cat-slug" value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="მაგ: notebooks" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-desc">აღწერა</label>
                    <textarea id="cat-desc" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="კატეგორიის აღწერა..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-image">ფოტო (კატეგორიის გვერდი) * (მაქს. 2 MB)</label>
                    <input type="file" id="cat-image" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, url => setCatForm({ ...catForm, image: url }))
                    }} />
                    {uploading && <span className="upload-status">იტვირთება...</span>}
                  </div>
                  {catForm.image && (
                    <div className="admin-preview-image"><img src={catForm.image} alt="Preview" /></div>
                  )}
                  <div className="form-group">
                    <label htmlFor="cat-icon">აიკონი (მთავარ გვერდზე) (მაქს. 2 MB)</label>
                    <input type="file" id="cat-icon" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" disabled={uploading} onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, url => setCatForm({ ...catForm, icon: url }))
                    }} />
                    {uploading && <span className="upload-status">იტვირთება...</span>}
                  </div>
                  {catForm.icon && (
                    <div className="admin-preview-image" style={{ maxWidth: 80 }}><img src={catForm.icon} alt="Icon preview" /></div>
                  )}
                  {/* Preview card */}
                  {(catForm.name || catForm.icon) && (
                    <div className="admin-cat-preview">
                      <p style={{ fontSize: 12, color: 'var(--secondary)', marginBottom: 8 }}>როგორ გამოჩნდება მთავარ გვერდზე:</p>
                      <div className="category-card-preview">
                        <div className="category-icon-preview">
                          {catForm.icon ? <img src={catForm.icon} alt="" /> : <span>?</span>}
                        </div>
                        <h4>{catForm.name || 'კატეგორია'}</h4>
                        <span style={{ fontSize: 12, color: 'var(--secondary)' }}>{catForm.count} ნივთი</span>
                        <p style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 4 }}>{catForm.description || 'აღწერა'}</p>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="cat-count">ნივთების რაოდენობა</label>
                    <input type="number" id="cat-count" value={catForm.count} onChange={e => setCatForm({ ...catForm, count: parseInt(e.target.value) || 0 })} min={0} />
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingCatId !== null ? 'შენახვა' : 'დამატება'}
                    </button>
                    {editingCatId !== null && (
                      <button type="button" className="btn btn-outline" onClick={cancelEditCat}>გაუქმება</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-list">
                <h3>არსებული კატეგორიები</h3>
                {categories.length === 0 ? (
                  <div className="admin-empty"><p>კატეგორიები არ არის დამატებული</p></div>
                ) : (
                  <div className="admin-items">
                    {categories.map(cat => (
                      <div key={cat.id} className={`admin-item ${editingCatId === cat.id ? 'editing' : ''}`}>
                        <div className="admin-item-image">
                          <img src={cat.image} alt={cat.name} />
                        </div>
                        <div className="admin-item-info">
                          <h4>{cat.name}</h4>
                          <span className="admin-item-slug">/{cat.slug}</span>
                          <p>{cat.description}</p>
                          <span className="admin-item-count">{cat.count} ნივთი · {products.filter(p => p.category === cat.slug).length} პროდუქტი</span>
                        </div>
                        <div className="admin-item-actions">
                          <button className="admin-edit-btn" onClick={() => startEditCat(cat)} aria-label="რედაქტირება">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="admin-delete-btn" onClick={() => removeCategory(cat.id)} aria-label="წაშლა">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ Products Tab ════════════ */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-grid">
              <div className="admin-form-card">
                <h3>{editingProdId !== null ? 'პროდუქტის რედაქტირება' : 'ახალი პროდუქტის დამატება'}</h3>
                <form onSubmit={handleProdSubmit}>
                  <div className="form-group">
                    <label htmlFor="prod-name">სახელი *</label>
                    <input type="text" id="prod-name" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} placeholder="პროდუქტის სახელი" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-category">კატეგორია *</label>
                    <select id="prod-category" value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value })} required className="sort-select" style={{ width: '100%' }}>
                      <option value="">აირჩიეთ კატეგორია</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="prod-price">ფასი (₾) *</label>
                      <input type="number" id="prod-price" value={prodForm.price || ''} onChange={e => setProdForm({ ...prodForm, price: Number(e.target.value) })} placeholder="0" min={0} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-original-price">ძველი ფასი (₾)</label>
                      <input type="number" id="prod-original-price" value={prodForm.originalPrice ?? ''} onChange={e => setProdForm({ ...prodForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="არასავალდებულო" min={0} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-image">ფოტო * (მაქს. 2 MB)</label>
                    <input type="file" id="prod-image" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, url => setProdForm({ ...prodForm, image: url }))
                    }} />
                    {uploading && <span className="upload-status">იტვირთება...</span>}
                  </div>
                  {prodForm.image && (
                    <div className="admin-preview-image"><img src={prodForm.image} alt="Preview" /></div>
                  )}
                  <div className="form-group">
                    <label htmlFor="prod-tag">თეგი</label>
                    <select id="prod-tag" value={prodForm.tag} onChange={e => setProdForm({ ...prodForm, tag: e.target.value })} className="sort-select" style={{ width: '100%' }}>
                      <option value="">თეგის გარეშე</option>
                      <option value="ახალი">ახალი</option>
                      <option value="ბესტსელერი">ბესტსელერი</option>
                      <option value="ფასდაკლება">ფასდაკლება</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-desc">აღწერა</label>
                    <textarea id="prod-desc" value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} placeholder="პროდუქტის აღწერა..." rows={3} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="prod-dims">ზომები</label>
                      <input type="text" id="prod-dims" value={prodForm.dimensions} onChange={e => setProdForm({ ...prodForm, dimensions: e.target.value })} placeholder="მაგ: A5, 96 ფურცელი" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-color">ფერი</label>
                      <input type="text" id="prod-color" value={prodForm.color} onChange={e => setProdForm({ ...prodForm, color: e.target.value })} placeholder="მაგ: შინდისფერი" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-material">მასალა</label>
                    <input type="text" id="prod-material" value={prodForm.material} onChange={e => setProdForm({ ...prodForm, material: e.target.value })} placeholder="მაგ: ქაღალდი 80 გ/მ², მყარი ყდა" />
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingProdId !== null ? 'შენახვა' : 'დამატება'}
                    </button>
                    {editingProdId !== null && (
                      <button type="button" className="btn btn-outline" onClick={cancelEditProd}>გაუქმება</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-list">
                <div className="admin-list-header">
                  <h3>პროდუქტები</h3>
                  <select className="sort-select" value={prodFilterCat} onChange={e => setProdFilterCat(e.target.value)}>
                    <option value="all">ყველა კატეგორია</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="admin-empty"><p>პროდუქტები არ არის</p></div>
                ) : (
                  <div className="admin-items">
                    {filteredProducts.map(prod => (
                      <div key={prod.id} className={`admin-item ${editingProdId === prod.id ? 'editing' : ''}`}>
                        <div className="admin-item-image">
                          <img src={prod.image} alt={prod.name} />
                          {prod.tag && <span className={`admin-prod-tag tag-${prod.tag === 'ფასდაკლება' ? 'sale' : prod.tag === 'ბესტსელერი' ? 'best' : 'new'}`}>{prod.tag}</span>}
                        </div>
                        <div className="admin-item-info">
                          <h4>{prod.name}</h4>
                          <div className="admin-prod-meta">
                            <span className="admin-prod-price">₾{prod.price}</span>
                            {prod.originalPrice && <span className="admin-prod-old-price">₾{prod.originalPrice}</span>}
                            <span className="admin-item-slug">{categories.find(c => c.slug === prod.category)?.name || prod.category}</span>
                          </div>
                          <p>{prod.description}</p>
                          {prod.dimensions && <span className="admin-item-count">{prod.dimensions} · {prod.material} · {prod.color}</span>}
                        </div>
                        <div className="admin-item-actions">
                          <button className="admin-edit-btn" onClick={() => startEditProd(prod)} aria-label="რედაქტირება">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="admin-delete-btn" onClick={() => removeProduct(prod.id)} aria-label="წაშლა">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ Slides Tab ════════════ */}
        {activeTab === 'slides' && (
          <div className="admin-section">
            <div className="admin-grid">
              <div className="admin-form-card">
                <h3>ახალი სლაიდის დამატება</h3>
                <form onSubmit={handleAddSlide}>
                  <div className="form-group">
                    <label htmlFor="slide-title">სათაური *</label>
                    <input type="text" id="slide-title" value={slideForm.title} onChange={e => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="მაგ: სასკოლო სეზონი" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-subtitle">ქვესათაური</label>
                    <input type="text" id="slide-subtitle" value={slideForm.subtitle} onChange={e => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="მაგ: ყველა რვეულზე -30%" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-desc">აღწერა</label>
                    <textarea id="slide-desc" value={slideForm.description} onChange={e => setSlideForm({ ...slideForm, description: e.target.value })} placeholder="სლაიდის აღწერა..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-image">ფოტო * (მაქს. 2 MB)</label>
                    <input type="file" id="slide-image" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, url => setSlideForm({ ...slideForm, image: url }))
                    }} />
                    {uploading && <span className="upload-status">იტვირთება...</span>}
                  </div>
                  {slideForm.image && (
                    <div className="admin-preview-image wide"><img src={slideForm.image} alt="Preview" /></div>
                  )}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="slide-btn-text">ღილაკის ტექსტი</label>
                      <input type="text" id="slide-btn-text" value={slideForm.buttonText} onChange={e => setSlideForm({ ...slideForm, buttonText: e.target.value })} placeholder="მაგ: აქციის ნახვა" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="slide-btn-link">ღილაკის ბმული</label>
                      <input type="text" id="slide-btn-link" value={slideForm.buttonLink} onChange={e => setSlideForm({ ...slideForm, buttonLink: e.target.value })} placeholder="მაგ: /category/notebooks" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-accent">აქცენტის ფერი</label>
                    <div className="color-picker-row">
                      <input type="color" id="slide-accent" value={slideForm.accent} onChange={e => setSlideForm({ ...slideForm, accent: e.target.value })} />
                      <span>{slideForm.accent}</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>სლაიდის დამატება</button>
                </form>
              </div>

              <div className="admin-list">
                <h3>არსებული სლაიდები</h3>
                {heroSlides.length === 0 ? (
                  <div className="admin-empty"><p>სლაიდები არ არის დამატებული</p></div>
                ) : (
                  <div className="admin-items">
                    {heroSlides.map(slide => (
                      <div key={slide.id} className="admin-item slide-item">
                        <div className="admin-item-image wide">
                          <img src={slide.image} alt={slide.title} />
                          <span className="admin-slide-accent" style={{ background: slide.accent }} />
                        </div>
                        <div className="admin-item-info">
                          <h4>{slide.title}</h4>
                          <span className="admin-item-slug">{slide.subtitle}</span>
                          <p>{slide.description}</p>
                          {slide.buttonText && <span className="admin-item-count">{slide.buttonText} → {slide.buttonLink}</span>}
                        </div>
                        <div className="admin-item-actions">
                          <button className="admin-delete-btn" onClick={() => removeSlide(slide.id)} aria-label="წაშლა">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Admin: Collections ──────────────────────────── */

const collectionStatusLabels: Record<CollectionStatus, string> = {
  active: 'აქტიური',
  scheduled: 'დაგეგმილი',
  expired: 'დასრულებული',
  inactive: 'არააქტიური',
}

const productTags = ['ახალი', 'ბესტსელერი', 'ფასდაკლება']

const emptyCollectionForm: SaveCollectionRequest = {
  name: '',
  slug: '',
  description: '',
  coverImage: '',
  bannerImage: null,
  isActive: true,
  startDate: null,
  endDate: null,
  displayOrder: 0,
  showOnHomepage: true,
  showInSlider: false,
  selectionMode: 'manual',
  rules: { categorySlug: null, tag: null, minPrice: null, maxPrice: null, onSaleOnly: false },
  productIds: [],
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInputValue(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString('ka-GE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

type CollectionsAdminProps = {
  uploading: boolean
  onUpload: (file: File, onSuccess: (url: string) => void) => void
}

function CollectionsAdmin({ uploading, onUpload }: CollectionsAdminProps) {
  const { products, categories, refreshCollections } = useData()
  const [items, setItems] = useState<CollectionAdminResponse[]>([])
  const [form, setForm] = useState<SaveCollectionRequest>(emptyCollectionForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    collectionsApi.getAllForAdmin()
      .then(setItems)
      .catch(err => alert(err instanceof Error ? err.message : 'კოლექციების ჩატვირთვა ვერ მოხერხდა.'))
  }, [])

  useEffect(() => { load() }, [load])

  const rules = form.rules ?? emptyCollectionForm.rules!
  const setRules = (patch: Partial<typeof rules>) => setForm({ ...form, rules: { ...rules, ...patch } })

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyCollectionForm)
    setProductSearch('')
  }

  const startEdit = (c: CollectionAdminResponse) => {
    setEditingId(c.id)
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImage: c.coverImage,
      bannerImage: c.bannerImage,
      isActive: c.isActive,
      startDate: c.startDate,
      endDate: c.endDate,
      displayOrder: c.displayOrder,
      showOnHomepage: c.showOnHomepage,
      showInSlider: c.showInSlider,
      selectionMode: c.selectionMode,
      rules: c.rules,
      productIds: c.productIds,
    })
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.coverImage) {
      alert('ატვირთეთ კოლექციის საყდაურის ფოტო.')
      return
    }
    const payload: SaveCollectionRequest = {
      ...form,
      rules: form.selectionMode === 'rules' ? rules : null,
      productIds: form.selectionMode === 'manual' ? form.productIds : [],
    }
    setSaving(true)
    try {
      if (editingId) await collectionsApi.update(editingId, payload)
      else await collectionsApi.create(payload)
      resetForm()
      load()
      refreshCollections()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'შენახვა ვერ მოხერხდა.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: CollectionAdminResponse) => {
    if (!confirm(`წაიშალოს კოლექცია „${c.name}“? პროდუქტები არ წაიშლება.`)) return
    try {
      await collectionsApi.delete(c.id)
      if (editingId === c.id) resetForm()
      load()
      refreshCollections()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'წაშლა ვერ მოხერხდა.')
    }
  }

  const toggleProduct = (id: string) => {
    setForm({
      ...form,
      productIds: form.productIds.includes(id)
        ? form.productIds.filter(p => p !== id)
        : [...form.productIds, id],
    })
  }

  const search = productSearch.trim().toLowerCase()
  const pickerProducts = products.filter(p => !search || p.name.toLowerCase().includes(search))

  return (
    <div className="admin-section">
      <div className="admin-grid">
        <div className="admin-form-card">
          <h3>{editingId ? 'კოლექციის რედაქტირება' : 'ახალი კოლექცია'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="col-name">დასახელება *</label>
              <input type="text" id="col-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="მაგ: სასკოლო შეთავაზებები" required />
            </div>
            <div className="form-group">
              <label htmlFor="col-slug">Slug (URL) *</label>
              <input type="text" id="col-slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="მაგ: back-to-school" required />
              {form.slug && <span className="form-hint">/collection/{form.slug}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="col-desc">აღწერა</label>
              <textarea id="col-desc" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="form-group">
              <label htmlFor="col-cover">Cover ფოტო * (მთავარი გვერდის ბლოკი)</label>
              <input type="file" id="col-cover" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => {
                const file = e.target.files?.[0]
                if (file) onUpload(file, url => setForm(f => ({ ...f, coverImage: url })))
              }} />
            </div>
            {form.coverImage && <div className="admin-preview-image"><img src={form.coverImage} alt="Cover preview" /></div>}

            <div className="form-group">
              <label htmlFor="col-banner">ბანერის ფოტო (სლაიდერი / კოლექციის გვერდი)</label>
              <input type="file" id="col-banner" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => {
                const file = e.target.files?.[0]
                if (file) onUpload(file, url => setForm(f => ({ ...f, bannerImage: url })))
              }} />
              {uploading && <span className="upload-status">იტვირთება...</span>}
            </div>
            {form.bannerImage && (
              <div className="admin-preview-image wide">
                <img src={form.bannerImage} alt="Banner preview" />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, bannerImage: null, showInSlider: false })}>ბანერის წაშლა</button>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="col-start">დაწყება</label>
                <input type="datetime-local" id="col-start" value={toLocalInputValue(form.startDate)} onChange={e => setForm({ ...form, startDate: fromLocalInputValue(e.target.value) })} />
              </div>
              <div className="form-group">
                <label htmlFor="col-end">დასრულება</label>
                <input type="datetime-local" id="col-end" value={toLocalInputValue(form.endDate)} onChange={e => setForm({ ...form, endDate: fromLocalInputValue(e.target.value) })} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="col-order">რიგითობა</label>
              <input type="number" id="col-order" min={0} value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
            </div>

            <div className="form-checks">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                აქტიურია
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.showOnHomepage} onChange={e => setForm({ ...form, showOnHomepage: e.target.checked })} />
                მთავარ გვერდზე გამოჩენა
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.showInSlider} disabled={!form.bannerImage} onChange={e => setForm({ ...form, showInSlider: e.target.checked })} />
                სლაიდერში გამოჩენა {!form.bannerImage && <small>(საჭიროა ბანერი)</small>}
              </label>
            </div>

            <div className="form-group">
              <label>პროდუქტების შერჩევა</label>
              <div className="segmented">
                {(['manual', 'rules'] as CollectionSelectionMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    className={form.selectionMode === mode ? 'active' : ''}
                    onClick={() => setForm({ ...form, selectionMode: mode })}
                  >
                    {mode === 'manual' ? 'ხელით შერჩევა' : 'წესებით'}
                  </button>
                ))}
              </div>
            </div>

            {form.selectionMode === 'manual' ? (
              <div className="form-group">
                <label htmlFor="col-product-search">პროდუქტები (არჩეულია {form.productIds.length})</label>
                <input type="text" id="col-product-search" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="ძებნა..." />
                <div className="product-picker">
                  {pickerProducts.map(p => (
                    <label key={p.id} className="product-picker-item">
                      <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                      <img src={p.image} alt="" />
                      <span>{p.name}</span>
                      <strong>₾{p.price}</strong>
                    </label>
                  ))}
                  {pickerProducts.length === 0 && <p className="form-hint">პროდუქტი ვერ მოიძებნა</p>}
                </div>
              </div>
            ) : (
              <div className="rules-box">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="rule-category">კატეგორია</label>
                    <select id="rule-category" className="sort-select" style={{ width: '100%' }} value={rules.categorySlug ?? ''} onChange={e => setRules({ categorySlug: e.target.value || null })}>
                      <option value="">ყველა</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="rule-tag">თეგი</label>
                    <select id="rule-tag" className="sort-select" style={{ width: '100%' }} value={rules.tag ?? ''} onChange={e => setRules({ tag: e.target.value || null })}>
                      <option value="">ყველა</option>
                      {productTags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="rule-min">მინ. ფასი (₾)</label>
                    <input type="number" id="rule-min" min={0} step="0.01" value={rules.minPrice ?? ''} onChange={e => setRules({ minPrice: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rule-max">მაქს. ფასი (₾)</label>
                    <input type="number" id="rule-max" min={0} step="0.01" value={rules.maxPrice ?? ''} onChange={e => setRules({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" checked={rules.onSaleOnly} onChange={e => setRules({ onSaleOnly: e.target.checked })} />
                  მხოლოდ ფასდაკლებული პროდუქტები
                </label>
                <p className="form-hint">პროდუქტები ავტომატურად განახლდება, როცა კატალოგი შეიცვლება.</p>
              </div>
            )}

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving || uploading}>
                {saving ? 'ინახება...' : editingId ? 'შენახვა' : 'დამატება'}
              </button>
              {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>გაუქმება</button>}
            </div>
          </form>
        </div>

        <div className="admin-list">
          <h3>კოლექციები</h3>
          {items.length === 0 ? (
            <div className="admin-empty"><p>კოლექციები არ არის დამატებული</p></div>
          ) : (
            <div className="admin-items">
              {items.map(c => (
                <div key={c.id} className={`admin-item ${editingId === c.id ? 'editing' : ''}`}>
                  <div className="admin-item-image">
                    <img src={c.coverImage} alt={c.name} />
                  </div>
                  <div className="admin-item-info">
                    <h4>
                      {c.name}{' '}
                      <span className={`status-badge status-${c.status}`}>{collectionStatusLabels[c.status]}</span>
                    </h4>
                    <span className="admin-item-slug">/collection/{c.slug}</span>
                    <p>{formatDate(c.startDate)} → {formatDate(c.endDate)}</p>
                    <span className="admin-item-count">
                      #{c.displayOrder} · {c.productCount} პროდუქტი ({c.selectionMode === 'manual' ? 'ხელით' : 'წესებით'})
                      {c.showOnHomepage && ' · მთავარი'}
                      {c.showInSlider && ' · სლაიდერი'}
                    </span>
                  </div>
                  <div className="admin-item-actions">
                    <button className="admin-edit-btn" onClick={() => startEdit(c)} aria-label="რედაქტირება">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(c)} aria-label="წაშლა">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/collection/:slug', element: <CollectionRoute /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/business', element: <BusinessPage /> },
      { path: '/quiz', element: <StationeryQuizPage /> },
      { path: '/notebook-builder', element: <NotebookBuilderPage /> },
      { path: '/admin/login', element: <AdminLoginPage /> },
      { path: '/admin', element: <RequireAuth><AdminPage /></RequireAuth> },
    ],
  },
]

export default Layout
