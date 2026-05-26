import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { Link, useParams, useNavigate, useLocation, Outlet } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import './App.css'

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */

type Product = {
  id: number
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

const categories = [
  {
    id: 1,
    slug: 'chairs',
    name: 'სამისხდომო',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80',
    count: 48,
    description: 'კომფორტული სავარძლები, სკამები და პუფები ყველა ოთახისთვის',
  },
  {
    id: 2,
    slug: 'tables',
    name: 'მაგიდები',
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500&q=80',
    count: 35,
    description: 'სასადილო, ჟურნალის, სამუშაო და კონსოლის მაგიდები',
  },
  {
    id: 3,
    slug: 'beds',
    name: 'საწოლები',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
    count: 24,
    description: 'ერთადგილიანი და ორადგილიანი საწოლები ლეიბით და ულეიბოდ',
  },
  {
    id: 4,
    slug: 'lighting',
    name: 'განათება',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80',
    count: 62,
    description: 'ჭაღები, მაგიდის ნათურები, კედლის სანათები და LED ლენტები',
  },
]

const allProducts: Product[] = [
  // ── სამისხდომო ──
  {
    id: 1,
    name: 'Nordic სავარძელი',
    price: 890,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&q=80',
    tag: 'ახალი',
    category: 'chairs',
    description: 'სკანდინავიური სტილის სავარძელი მაღალი ზურგით და რბილი ბალიშებით. იდეალურია მისაღებისა და საკითხავი კუთხისთვის.',
    dimensions: '75 × 80 × 105 სმ',
    material: 'მუხის ხე, ბამბის ქსოვილი',
    color: 'ნაცრისფერი',
  },
  {
    id: 2,
    name: 'Velvet დივანი',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    tag: 'ბესტსელერი',
    category: 'chairs',
    description: 'ელეგანტური ხავერდის დივანი სამადგილიანი, მოდერნისტული დიზაინით. ქაფის შიგთავსი უზრუნველყოფს მაქსიმალურ კომფორტს.',
    dimensions: '220 × 90 × 82 სმ',
    material: 'ხავერდის ქსოვილი, მეტალის ფეხები',
    color: 'მწვანე',
  },
  {
    id: 3,
    name: 'Lounge კრესლო',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80',
    category: 'chairs',
    description: 'მარტივი და თანამედროვე ლაუნჟ კრესლო ფართო სავარძლითა და ერგონომიული ფორმით.',
    dimensions: '82 × 85 × 78 სმ',
    material: 'ტყავი, ორაკულის ხე',
    color: 'ყავისფერი',
  },
  {
    id: 4,
    name: 'რხევადი სავარძელი',
    price: 680,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
    tag: 'ფასდაკლება',
    category: 'chairs',
    description: 'კლასიკური რხევადი სავარძელი თანამედროვე ინტერპრეტაციით. მშვიდი საღამოებისთვის.',
    dimensions: '65 × 95 × 100 სმ',
    material: 'ნაძვის ხე, ბამბა',
    color: 'კრემისფერი',
  },
  {
    id: 5,
    name: 'ბარის სკამი',
    price: 320,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=80',
    tag: 'ახალი',
    category: 'chairs',
    description: 'მინიმალისტური ბარის სკამი რეგულირებადი სიმაღლით. იდეალურია სამზარეულოს კუნძულისთვის.',
    dimensions: '42 × 42 × 75 სმ',
    material: 'მეტალი, ხელოვნური ტყავი',
    color: 'შავი',
  },
  {
    id: 6,
    name: 'Accent სავარძელი',
    price: 950,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
    category: 'chairs',
    description: 'აქცენტის სავარძელი ნათელი ფერებით, რომელიც ოთახს განსაკუთრებულ ხასიათს შესძენს.',
    dimensions: '70 × 75 × 85 სმ',
    material: 'ლინენი, თითის ხე',
    color: 'ყვითელი',
  },

  // ── მაგიდები ──
  {
    id: 7,
    name: 'Minimalist ჟურნალის მაგიდა',
    price: 450,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80',
    category: 'tables',
    description: 'მინიმალისტური ჟურნალის მაგიდა მრგვალი ფორმით. ბუნებრივი ხის ზედაპირი თბილ ატმოსფეროს ქმნის.',
    dimensions: 'Ø80 × 45 სმ',
    material: 'მუხის ხე, მეტალის ფეხები',
    color: 'ნატურალური მუხა',
  },
  {
    id: 8,
    name: 'ხის სასადილო მაგიდა',
    price: 1350,
    originalPrice: 1600,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80',
    tag: 'ფასდაკლება',
    category: 'tables',
    description: '6-ადგილიანი სასადილო მაგიდა მასიური ხისგან. გამძლე კონსტრუქცია ყოველდღიური გამოყენებისთვის.',
    dimensions: '180 × 90 × 76 სმ',
    material: 'მასიური ცაცხვის ხე',
    color: 'მუქი კაკალი',
  },
  {
    id: 9,
    name: 'სამუშაო მაგიდა',
    price: 780,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    category: 'tables',
    description: 'ფართო სამუშაო მაგიდა ჩაშენებული კაბელების მართვის სისტემით. იდეალურია სახლის ოფისისთვის.',
    dimensions: '140 × 65 × 75 სმ',
    material: 'MDF, მეტალის ჩარჩო',
    color: 'თეთრი / ხის კომბინაცია',
  },
  {
    id: 10,
    name: 'კონსოლის მაგიდა',
    price: 520,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
    tag: 'ახალი',
    category: 'tables',
    description: 'ელეგანტური კონსოლის მაგიდა ჰოლისა და კორიდორისთვის. ორი თარო შესანახისთვის.',
    dimensions: '120 × 35 × 80 სმ',
    material: 'მუხა, ლითონის ფეხები',
    color: 'ოქროსფერი / თეთრი',
  },
  {
    id: 11,
    name: 'მრგვალი სასადილო მაგიდა',
    price: 980,
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=500&q=80',
    category: 'tables',
    description: '4-ადგილიანი მრგვალი სასადილო მაგიდა კომპაქტური სივრცეებისთვის.',
    dimensions: 'Ø110 × 76 სმ',
    material: 'მარმარილოს ზედაპირი, მეტალის ფეხი',
    color: 'თეთრი მარმარილო',
  },

  // ── საწოლები ──
  {
    id: 12,
    name: 'საწოლი Oslo',
    price: 1890,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
    category: 'beds',
    description: 'სკანდინავიური სტილის ორადგილიანი საწოლი ტაფტინგის თავსართით. ჩაშენებული ლეიბის მექანიზმი.',
    dimensions: '160 × 200 × 120 სმ',
    material: 'მუხის ხე, ხავერდის ტაპიცერება',
    color: 'ნაცრისფერი',
  },
  {
    id: 13,
    name: 'პლატფორმის საწოლი',
    price: 1450,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=500&q=80',
    tag: 'ფასდაკლება',
    category: 'beds',
    description: 'დაბალპროფილიანი პლატფორმის საწოლი იაპონური ესთეტიკით. მინიმალისტური დიზაინი.',
    dimensions: '180 × 200 × 35 სმ',
    material: 'ბამბუკი, MDF',
    color: 'ნატურალური',
  },
  {
    id: 14,
    name: 'საბავშვო საწოლი',
    price: 890,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&q=80',
    tag: 'ახალი',
    category: 'beds',
    description: 'უსაფრთხო საბავშვო საწოლი დამცავი ბარიერებით. ხარისხიანი მასალები ბავშვის ჯანმრთელობისთვის.',
    dimensions: '90 × 190 × 80 სმ',
    material: 'ფიჭვის ხე, ჰიპოალერგიული საღებავი',
    color: 'თეთრი',
  },
  {
    id: 15,
    name: 'King Size საწოლი',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80',
    tag: 'ბესტსელერი',
    category: 'beds',
    description: 'ფუფუნების King Size საწოლი რბილი ტაპიცერებით. ინტეგრირებული LED განათება თავსართში.',
    dimensions: '200 × 210 × 130 სმ',
    material: 'ხავერდი, MDF, LED',
    color: 'მუქი ნაცრისფერი',
  },
  {
    id: 16,
    name: 'დივან-საწოლი',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80',
    category: 'beds',
    description: 'ფუნქციური დივან-საწოლი მოხსნადი საფარით. იშლება ორადგილიან საწოლად.',
    dimensions: '190 × 95 × 85 სმ (გაშლილი: 190 × 140)',
    material: 'ქსოვილი, ქაფის შიგთავსი',
    color: 'ლურჯი',
  },

  // ── განათება ──
  {
    id: 17,
    name: 'Pendant ჭაღი',
    price: 340,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80',
    tag: 'ახალი',
    category: 'lighting',
    description: 'თანამედროვე Pendant ჭაღი გეომეტრიული ფორმით. E27 ბუდე, LED-თან თავსებადი.',
    dimensions: 'Ø40 × 35 სმ (კაბელი: 150 სმ)',
    material: 'ლითონი, მინა',
    color: 'შავი / ოქროსფერი',
  },
  {
    id: 18,
    name: 'Boho თაროები',
    price: 520,
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80',
    tag: 'ახალი',
    category: 'lighting',
    description: 'ბოჰო სტილის კედლის თარო ინტეგრირებული LED განათებით. დეკორატიული და ფუნქციური.',
    dimensions: '80 × 20 × 25 სმ',
    material: 'მანგოს ხე, LED ლენტი',
    color: 'ნატურალური ხე',
  },
  {
    id: 19,
    name: 'მაგიდის ნათურა Arc',
    price: 280,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80',
    category: 'lighting',
    description: 'ელეგანტური Arc მაგიდის ნათურა რეგულირებადი თავით. 3 სიკაშკაშის რეჟიმი.',
    dimensions: '18 × 18 × 55 სმ',
    material: 'ლითონი, ქსოვილის აბაჟური',
    color: 'სპილენძი',
  },
  {
    id: 20,
    name: 'იატაკის ნათურა',
    price: 490,
    originalPrice: 620,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    tag: 'ფასდაკლება',
    category: 'lighting',
    description: 'მინიმალისტური იატაკის ნათურა მისაღები ოთახისთვის. თბილი, დიფუზური შუქი.',
    dimensions: '35 × 35 × 165 სმ',
    material: 'ბამბუკი, ბრინჯის ქაღალდი',
    color: 'ნატურალური',
  },
  {
    id: 21,
    name: 'კედლის სანათი Sconce',
    price: 190,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80',
    tag: 'ახალი',
    category: 'lighting',
    description: 'მოდერნისტული კედლის სანათი ზემოთ და ქვემოთ მიმართული შუქით.',
    dimensions: '10 × 12 × 20 სმ',
    material: 'ალუმინი',
    color: 'თეთრი',
  },
  {
    id: 22,
    name: 'ჭაღი Crystal',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=500&q=80',
    tag: 'ბესტსელერი',
    category: 'lighting',
    description: 'ბრწყინვალე კრისტალის ჭაღი სასადილო ოთახისთვის. 8 ნათურის ბუდე.',
    dimensions: 'Ø65 × 50 სმ',
    material: 'კრისტალი, ქრომი',
    color: 'გამჭვირვალე / ვერცხლი',
  },
]

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
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
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
      const saved = localStorage.getItem('auro-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('auro-cart', JSON.stringify(items))
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

  const removeFromCart = useCallback((productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
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

  const isInCart = useCallback((productId: number) => {
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
        <Link to="/" className="logo">AURO</Link>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#categories" onClick={(e) => { e.preventDefault(); scrollToSection('categories') }}>კატეგორიები</a>
          <a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('products') }}>პროდუქცია</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about') }}>ჩვენ შესახებ</a>
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

/* ── Hero ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-tag">ახალი კოლექცია 2026</span>
          <h1>შექმენი შენი<br />სივრცე სტილით</h1>
          <p className="hero-desc">
            აღმოაჩინე უნიკალური ავეჯი, რომელიც შენს სახლს
            თბილ და თანამედროვე სივრცედ აქცევს.
          </p>
          <div className="hero-buttons">
            <a href="#products" className="btn btn-primary">კოლექციის ნახვა</a>
            <a href="#about" className="btn btn-outline">მეტი ჩვენ შესახებ</a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">2K+</span>
              <span className="stat-label">პროდუქტი</span>
            </div>
            <div className="stat">
              <span className="stat-num">15K+</span>
              <span className="stat-label">კმაყოფილი კლიენტი</span>
            </div>
            <div className="stat">
              <span className="stat-num">98%</span>
              <span className="stat-label">პოზიტიური შეფასება</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
              alt="თანამედროვე ავეჯი"
            />
            <div className="hero-img-badge">
              <span className="badge-price">-30%</span>
              <span className="badge-text">სეზონური ფასდაკლება</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Categories (Home) ──────────────────────────── */
function CategoriesSection() {
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">კატეგორიები</span>
          <h2>აირჩიე კატეგორია</h2>
          <p className="section-desc">იპოვე ავეჯი შენი სახლის ყველა ოთახისთვის</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card">
              <img src={cat.image} alt={cat.name} />
              <div className="category-overlay">
                <h3>{cat.name}</h3>
                <span>{cat.count} ნივთი</span>
              </div>
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
  const featured = allProducts.filter(p => p.tag).slice(0, 8)
  return (
    <section className="featured-products" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">პროდუქცია</span>
          <h2>პოპულარული ნივთები</h2>
          <p className="section-desc">ჩვენი ყველაზე მოთხოვნადი ავეჯი</p>
        </div>
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="products-cta">
          <Link to="/category/chairs" className="btn btn-outline">ყველა პროდუქტის ნახვა</Link>
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
        <div className="banner-image">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700&q=80"
            alt="ინტერიერის დიზაინი"
          />
        </div>
        <div className="banner-content">
          <span className="section-tag">ჩვენ შესახებ</span>
          <h2>ვქმნით სივრცეებს,<br />სადაც ცხოვრება სასიამოვნოა</h2>
          <p>
            AURO-ში ვირჩევთ მხოლოდ უმაღლესი ხარისხის მასალებს და ვთანამშრომლობთ
            საუკეთესო დიზაინერებთან, რომ ყველა ნივთი იყოს ფუნქციური, ესთეტიკური
            და გამძლე.
          </p>
          <div className="banner-features">
            <div className="feature">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>ხარისხის გარანტია</strong>
                <span>5 წლიანი გარანტია</span>
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
                <span>30 დღის განმავლობაში</span>
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
            <Link to="/" className="logo">AURO</Link>
            <p>თანამედროვე ავეჯი თანამედროვე ცხოვრებისთვის. ვქმნით კომფორტს და სტილს შენს სივრცეში.</p>
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
              <Link to="/category/chairs">სამისხდომო</Link>
              <Link to="/category/tables">მაგიდები</Link>
              <Link to="/category/beds">საწოლები</Link>
              <Link to="/category/lighting">განათება</Link>
            </div>
            <div className="footer-col">
              <h4>ინფორმაცია</h4>
              <a href="#about">ჩვენ შესახებ</a>
              <a href="#">მიტანის პირობები</a>
              <a href="#">დაბრუნების პოლიტიკა</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>კონტაქტი</h4>
              <a href="tel:+995555123456">+995 555 12 34 56</a>
              <a href="mailto:info@auro.ge">info@auro.ge</a>
              <span>თბილისი, საქართველო</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 AURO. ყველა უფლება დაცულია.</p>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════
   PAGES
   ══════════════════════════════════════════════════ */

/* ── Home Page ───────────────────────────────────── */
function HomePage() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedProducts />
      <Banner />
    </>
  )
}

/* ── Category Page ───────────────────────────────── */
function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toggleCart, isInCart } = useCart()
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const category = categories.find(c => c.slug === slug)
  const categoryProducts = allProducts.filter(p => p.category === slug)

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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
            <button className="btn btn-primary btn-full">შეკვეთის გაფორმება</button>
            <Link to="/" className="btn btn-outline btn-full">მაღაზიაში დაბრუნება</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Layout() {
  return (
    <CartProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </CartProvider>
  )
}

/* ── Product Detail Page ─────────────────────────── */
function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toggleCart, isInCart } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const product = allProducts.find(p => p.id === Number(id))

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
  const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>5 წლიანი გარანტია</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>უფასო მიტანა ₾200+</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>30 დღიანი დაბრუნება</span>
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

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
    ],
  },
]

export default Layout
