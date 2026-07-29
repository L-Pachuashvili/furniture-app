import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
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

type Category = {
  id: number
  slug: string
  name: string
  image: string
  count: number
  description: string
}

type HeroSlide = {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  accent: string
}

const categoryIcons: Record<string, ReactNode> = {
  chairs: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 28V12a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16" />
      <path d="M10 28a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h2v8M52 44v8M54 28a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-2" />
      <path d="M12 44h40" />
      <rect x="12" y="28" width="40" height="16" rx="4" />
    </svg>
  ),
  tables: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="20" width="48" height="6" rx="2" />
      <line x1="14" y1="26" x2="14" y2="52" />
      <line x1="50" y1="26" x2="50" y2="52" />
      <line x1="10" y1="52" x2="18" y2="52" />
      <line x1="46" y1="52" x2="54" y2="52" />
    </svg>
  ),
  beds: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 40V20a4 4 0 0 1 4-4h6v12h28V16h6a4 4 0 0 1 4 4v20" />
      <rect x="4" y="40" width="56" height="8" rx="3" />
      <line x1="10" y1="48" x2="10" y2="54" />
      <line x1="54" y1="48" x2="54" y2="54" />
      <rect x="14" y="22" width="10" height="6" rx="2" />
    </svg>
  ),
  lighting: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 40h16v4a2 2 0 0 1-2 2H26a2 2 0 0 1-2-2v-4z" />
      <path d="M26 46v4M38 46v4" />
      <path d="M20 40c-3-4-5-9-5-15a17 17 0 0 1 34 0c0 6-2 11-5 15" />
      <line x1="32" y1="4" x2="32" y2="8" />
      <line x1="52" y1="12" x2="49" y2="14" />
      <line x1="12" y1="12" x2="15" y2="14" />
      <line x1="56" y1="25" x2="52" y2="25" />
      <line x1="12" y1="25" x2="8" y2="25" />
    </svg>
  ),
}

const defaultCategories: Category[] = [
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

const defaultProducts: Product[] = [
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
      const saved = localStorage.getItem('taika-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('taika-cart', JSON.stringify(items))
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
        <Link to="/" className="logo">TAIKA</Link>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#categories" onClick={(e) => { e.preventDefault(); scrollToSection('categories') }}>კატეგორიები</a>
          <Link to="/about">ჩვენ შესახებ</Link>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}>კონტაქტი</a>
          <Link to="/admin" className="nav-admin-link">ადმინ პანელი</Link>
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
const defaultHeroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'ზაფხულის ფასდაკლება',
    subtitle: 'ყველა სავარძელზე -30%',
    description: 'აირჩიე შენი საყვარელი სავარძელი განსაკუთრებულ ფასად. აქცია მოქმედებს მარაგის ამოწურვამდე.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    buttonText: 'აქციის ნახვა',
    buttonLink: '/category/chairs',
    accent: '#C9A96E',
  },
  {
    id: 2,
    title: 'კორპორატიული შეთავაზება',
    subtitle: 'კომპანიებისთვის',
    description: 'გაგვიგზავნეთ განაცხადი და ჩვენი გუნდი დაგიკავშირდებათ ინდივიდუალური შეთავაზებით. ოფისის ავეჯი, HoReCa პროექტები და სხვა.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    buttonText: 'განაცხადის შევსება',
    buttonLink: '/business',
    accent: '#2A6F6F',
  },
]

/* ══════════════════════════════════════════════════
   DATA CONTEXT (Admin-managed categories & slides)
   ══════════════════════════════════════════════════ */

type DataContextType = {
  categories: Category[]
  heroSlides: HeroSlide[]
  products: Product[]
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (id: number, cat: Partial<Category>) => void
  removeCategory: (id: number) => void
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void
  removeSlide: (id: number) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  removeProduct: (id: number) => void
}

const DataContext = createContext<DataContextType | null>(null)

function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('taika-categories')
      return saved ? JSON.parse(saved) : defaultCategories
    } catch {
      return defaultCategories
    }
  })

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('taika-slides')
      return saved ? JSON.parse(saved) : defaultHeroSlides
    } catch {
      return defaultHeroSlides
    }
  })

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('taika-products')
      return saved ? JSON.parse(saved) : defaultProducts
    } catch {
      return defaultProducts
    }
  })

  useEffect(() => {
    localStorage.setItem('taika-categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('taika-slides', JSON.stringify(heroSlides))
  }, [heroSlides])

  useEffect(() => {
    localStorage.setItem('taika-products', JSON.stringify(products))
  }, [products])

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: Date.now() }])
  }, [])

  const updateCategory = useCallback((id: number, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const removeCategory = useCallback((id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const addSlide = useCallback((slide: Omit<HeroSlide, 'id'>) => {
    setHeroSlides(prev => [...prev, { ...slide, id: Date.now() }])
  }, [])

  const removeSlide = useCallback((id: number) => {
    setHeroSlides(prev => prev.filter(s => s.id !== id))
  }, [])

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }])
  }, [])

  const updateProduct = useCallback((id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const removeProduct = useCallback((id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <DataContext.Provider value={{ categories, heroSlides, products, addCategory, updateCategory, removeCategory, addSlide, removeSlide, addProduct, updateProduct, removeProduct }}>
      {children}
    </DataContext.Provider>
  )
}

function HeroSlider() {
  const { heroSlides } = useData()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

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
                {categoryIcons[cat.slug]}
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
            TAIKA-ში ვირჩევთ მხოლოდ უმაღლესი ხარისხის მასალებს და ვთანამშრომლობთ
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
            <Link to="/" className="logo">TAIKA</Link>
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
              <Link to="/about">ჩვენ შესახებ</Link>
              <a href="#">მიტანის პირობები</a>
              <a href="#">დაბრუნების პოლიტიკა</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>კონტაქტი</h4>
              <a href="tel:+995568222234">+995 555 12 34 56</a>
              <a href="mailto:info@taika.ge">info@taika.ge</a>
              <span>რუსთავი, საქართველო</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 TAIKA. ყველა უფლება დაცულია.</p>
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
    setSubmitted(true)
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
          <h2>რატომ TAIKA?</h2>
          <div className="business-benefits">
            <div className="benefit">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>ხარისხის გარანტია</strong>
                <p>ყველა პროდუქტზე 5 წლიანი გარანტია</p>
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
                <p>კორპორატიული კლიენტებისთვის ინდივიდუალური ფასები</p>
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
                <strong>უფასო მიტანა და მონტაჟი</strong>
                <p>საქართველოს მასშტაბით უფასო ტრანსპორტირება</p>
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
                  placeholder="აღწერეთ თქვენი საჭიროება: რა ტიპის ავეჯი გჭირდებათ, რაოდენობა, ვადები..."
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

/* ── Mattress Quiz ───────────────────────────────── */
type QuizAnswer = {
  sleepPosition: string
  firmness: string
  bodyWeight: string
  issue: string
  budget: string
}

const quizSteps = [
  {
    key: 'sleepPosition' as const,
    question: 'როგორ გიყვარს ძილი?',
    subtitle: 'აირჩიე შენი ძირითადი ძილის პოზა',
    options: [
      { value: 'back', label: 'ზურგზე', icon: '🛌', desc: 'ზურგზე მწოლიარე' },
      { value: 'side', label: 'გვერდზე', icon: '😴', desc: 'გვერდით მწოლიარე' },
      { value: 'stomach', label: 'მუცელზე', icon: '🙇', desc: 'მუცელზე მწოლიარე' },
      { value: 'mixed', label: 'შერეული', icon: '🔄', desc: 'პოზიციას ვიცვლი' },
    ],
  },
  {
    key: 'firmness' as const,
    question: 'რა სიმტკიცეს ანიჭებ უპირატესობას?',
    subtitle: 'შენი კომფორტის პრეფერენცია',
    options: [
      { value: 'soft', label: 'რბილი', icon: '☁️', desc: 'ჩაეფლობა სხეული' },
      { value: 'medium', label: 'საშუალო', icon: '⚖️', desc: 'ბალანსი კომფორტსა და მხარდაჭერას შორის' },
      { value: 'firm', label: 'მაგარი', icon: '🪨', desc: 'მტკიცე ზედაპირი' },
      { value: 'unsure', label: 'არ ვიცი', icon: '🤔', desc: 'დამეხმარეთ არჩევაში' },
    ],
  },
  {
    key: 'bodyWeight' as const,
    question: 'რა არის შენი სხეულის წონა?',
    subtitle: 'ეს გვეხმარება სწორი მხარდაჭერის შერჩევაში',
    options: [
      { value: 'light', label: '60 კგ-მდე', icon: '🪶', desc: 'მსუბუქი' },
      { value: 'medium', label: '60-90 კგ', icon: '👤', desc: 'საშუალო' },
      { value: 'heavy', label: '90 კგ+', icon: '💪', desc: 'მძიმე' },
    ],
  },
  {
    key: 'issue' as const,
    question: 'რა პრობლემა გაწუხებს ძილისას?',
    subtitle: 'აირჩიე ყველაზე აქტუალური',
    options: [
      { value: 'back-pain', label: 'ზურგის ტკივილი', icon: '🩺', desc: 'ტკივილი ზურგში ან წელში' },
      { value: 'hot', label: 'ცხელა', icon: '🌡️', desc: 'ცხელა ძილისას' },
      { value: 'partner', label: 'პარტნიორის მოძრაობა', icon: '👥', desc: 'პარტნიორი მაღვიძებს' },
      { value: 'none', label: 'არაფერი', icon: '✅', desc: 'პრობლემა არ მაქვს' },
    ],
  },
  {
    key: 'budget' as const,
    question: 'რა ბიუჯეტი გაქვს?',
    subtitle: 'შეარჩიე შენთვის შესაფერისი ფასის დიაპაზონი',
    options: [
      { value: 'low', label: '1500₾-მდე', icon: '💰', desc: 'ეკონომიური' },
      { value: 'mid', label: '1500-2500₾', icon: '💎', desc: 'საშუალო კლასი' },
      { value: 'high', label: '2500₾+', icon: '👑', desc: 'პრემიუმ' },
    ],
  },
]

function getQuizResults(answers: QuizAnswer, productsList: Product[]): Product[] {
  return productsList
    .filter((p) => p.category === 'beds')
    .sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      if (answers.budget === 'low') {
        if (a.price <= 1500) scoreA += 3
        if (b.price <= 1500) scoreB += 3
      } else if (answers.budget === 'mid') {
        if (a.price > 1500 && a.price <= 2500) scoreA += 3
        if (b.price > 1500 && b.price <= 2500) scoreB += 3
      } else {
        if (a.price > 2500) scoreA += 3
        if (b.price > 2500) scoreB += 3
      }

      if (a.tag === 'ბესტსელერი') scoreA += 2
      if (b.tag === 'ბესტსელერი') scoreB += 2
      if (a.originalPrice) scoreA += 1
      if (b.originalPrice) scoreB += 1

      return scoreB - scoreA
    })
    .slice(0, 3)
}

function MattressQuizPage() {
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
          <h1>იპოვე შენი იდეალური საწოლი</h1>
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
              <p>შენი პასუხების საფუძველზე, ეს საწოლები საუკეთესოდ მოგერგება</p>
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
              <Link to="/category/beds" className="btn btn-primary">
                ყველა საწოლის ნახვა
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
      <CategoriesSection />
      <div className="quiz-cta">
        <div className="container">
          <div className="quiz-cta-inner">
            <div className="quiz-cta-visual">
              <span className="quiz-cta-icon">🛏️</span>
              <div className="quiz-cta-dots">
                <span /><span /><span />
              </div>
            </div>
            <div className="quiz-cta-content">
              <span className="quiz-cta-badge">ინტერაქტიული ქვიზი</span>
              <h2>ვერ ირჩევ საწოლს?</h2>
              <p>უპასუხე სულ რაღაც <strong>5 მარტივ კითხვას</strong> და ჩვენი ალგორითმი შეგარჩევს შენთვის იდეალურ საწოლს — ძილის პოზის, სხეულის წონისა და ბიუჯეტის გათვალისწინებით.</p>
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
      <div className="mattress-cta">
        <div className="container">
          <div className="quiz-cta-inner">
            <div className="quiz-cta-visual">
              <span className="quiz-cta-icon">🛏️</span>
              <div className="quiz-cta-dots">
                <span /><span /><span />
              </div>
            </div>
            <div className="quiz-cta-content">
              <span className="quiz-cta-badge">კონფიგურატორი</span>
              <h2>ააწყვე შენი იდეალური მატრასი</h2>
              <p>აირჩიე ზომა, მასალა, სიმტკიცე და გარსაცმი — შექმენი <strong>ზუსტად შენზე მორგებული</strong> მატრასი 4 მარტივ ნაბიჯში.</p>
              <div className="quiz-cta-features">
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                  <span>6 ზომა</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  <span>5 მასალა</span>
                </div>
                <div className="quiz-cta-feat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <span>₾450-დან</span>
                </div>
              </div>
              <Link to="/mattress" className="btn btn-primary quiz-cta-btn">
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

/* ── Mattress Builder Page ────────────────────────── */

const mattressSizes = [
  { key: '90x190', label: 'ერთადგილიანი', dims: '90 × 190 სმ', icon: '👤' },
  { key: '120x190', label: 'ნახევარნახევარი', dims: '120 × 190 სმ', icon: '👤+' },
  { key: '140x200', label: 'ორადგილიანი S', dims: '140 × 200 სმ', icon: '👥' },
  { key: '160x200', label: 'ორადგილიანი M', dims: '160 × 200 სმ', icon: '👥' },
  { key: '180x200', label: 'ორადგილიანი L', dims: '180 × 200 სმ', icon: '👫' },
  { key: '200x200', label: 'King Size', dims: '200 × 200 სმ', icon: '👑' },
]

const mattressMaterials = [
  { key: 'spring', label: 'ზამბარის ბლოკი', desc: 'კლასიკური მხარდაჭერა, კარგი ვენტილაცია', icon: '🔩', priceAdd: 0 },
  { key: 'pocket', label: 'დამოუკიდებელი ზამბარები', desc: 'იზოლირებული მოძრაობა, ორთოპედიული ეფექტი', icon: '🎯', priceAdd: 200 },
  { key: 'foam', label: 'მეხსიერების ქაფი', desc: 'სხეულის ფორმას იღებს, მაქსიმალური კომფორტი', icon: '☁️', priceAdd: 350 },
  { key: 'latex', label: 'ლატექსი', desc: 'ბუნებრივი მასალა, ჰიპოალერგიული, გამძლე', icon: '🌿', priceAdd: 500 },
  { key: 'hybrid', label: 'ჰიბრიდი', desc: 'ზამბარი + ქაფი — საუკეთესო ორივე სამყაროდან', icon: '⚡', priceAdd: 450 },
]

const mattressFirmness = [
  { key: 'soft', label: 'რბილი', desc: 'გვერდზე მძინარეთათვის', level: 1 },
  { key: 'medium', label: 'საშუალო', desc: 'უნივერსალური', level: 2 },
  { key: 'firm', label: 'მაგარი', desc: 'ზურგზე/მუცელზე მძინარეთათვის', level: 3 },
  { key: 'extra-firm', label: 'ძალიან მაგარი', desc: 'ორთოპედიული', level: 4 },
]

const mattressCovers = [
  { key: 'cotton', label: 'ბამბა', icon: '🧵', priceAdd: 0 },
  { key: 'bamboo', label: 'ბამბუკი', icon: '🎋', priceAdd: 80 },
  { key: 'aloe', label: 'ალოე ვერა', icon: '🌱', priceAdd: 120 },
  { key: 'cashmere', label: 'კაშმირი', icon: '✨', priceAdd: 250 },
]

function getMattressBasePrice(size: string): number {
  const prices: Record<string, number> = {
    '90x190': 450, '120x190': 580, '140x200': 720,
    '160x200': 850, '180x200': 980, '200x200': 1150,
  }
  return prices[size] || 600
}

function MattressBuilderPage() {
  const [step, setStep] = useState(0)
  const [size, setSize] = useState('')
  const [material, setMaterial] = useState('')
  const [firmness, setFirmness] = useState('')
  const [cover, setCover] = useState('')
  const [showResult, setShowResult] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const steps = [
    { title: 'ზომა', subtitle: 'აირჩიე მატრასის ზომა' },
    { title: 'მასალა', subtitle: 'რა ტიპის მატრასი გსურს?' },
    { title: 'სიმტკიცე', subtitle: 'რა სიმტკიცეს ანიჭებ უპირატესობას?' },
    { title: 'გარსაცმი', subtitle: 'აირჩიე გარსაცმის მასალა' },
  ]

  const progress = ((step + 1) / steps.length) * 100

  const handleSelectSize = (key: string) => { setSize(key); setStep(1) }
  const handleSelectMaterial = (key: string) => { setMaterial(key); setStep(2) }
  const handleSelectFirmness = (key: string) => { setFirmness(key); setStep(3) }
  const handleSelectCover = (key: string) => { setCover(key); setShowResult(true) }

  const handleBack = () => {
    if (showResult) { setShowResult(false); return }
    if (step > 0) setStep(step - 1)
  }

  const handleRestart = () => {
    setStep(0); setSize(''); setMaterial(''); setFirmness(''); setCover(''); setShowResult(false)
  }

  const totalPrice = getMattressBasePrice(size)
    + (mattressMaterials.find(m => m.key === material)?.priceAdd || 0)
    + (mattressCovers.find(c => c.key === cover)?.priceAdd || 0)

  const selectedSize = mattressSizes.find(s => s.key === size)
  const selectedMaterial = mattressMaterials.find(m => m.key === material)
  const selectedFirmness = mattressFirmness.find(f => f.key === firmness)
  const selectedCover = mattressCovers.find(c => c.key === cover)

  return (
    <section className="mattress-builder-page">
      <div className="mb-hero">
        <div className="container">
          <span className="section-tag">კონფიგურატორი</span>
          <h1>ააწყვე შენი იდეალური მატრასი</h1>
          <p>აირჩიე ზომა, მასალა, სიმტკიცე და გარსაცმი — შექმენი ზუსტად შენზე მორგებული მატრასი</p>
        </div>
      </div>

      <div className="container mb-container">
        <div className="mb-layout">
          {/* ── Summary sidebar ── */}
          <div className="mb-summary">
            <h4>შენი კონფიგურაცია</h4>
            <div className="mb-summary-items">
              <div className={`mb-summary-item ${size ? 'filled' : ''}`}>
                <span className="mb-sum-label">ზომა</span>
                <span className="mb-sum-value">{selectedSize ? `${selectedSize.label} (${selectedSize.dims})` : '—'}</span>
              </div>
              <div className={`mb-summary-item ${material ? 'filled' : ''}`}>
                <span className="mb-sum-label">მასალა</span>
                <span className="mb-sum-value">{selectedMaterial ? selectedMaterial.label : '—'}</span>
              </div>
              <div className={`mb-summary-item ${firmness ? 'filled' : ''}`}>
                <span className="mb-sum-label">სიმტკიცე</span>
                <span className="mb-sum-value">{selectedFirmness ? selectedFirmness.label : '—'}</span>
              </div>
              <div className={`mb-summary-item ${cover ? 'filled' : ''}`}>
                <span className="mb-sum-label">გარსაცმი</span>
                <span className="mb-sum-value">{selectedCover ? selectedCover.label : '—'}</span>
              </div>
            </div>
            {(size || material || cover) && (
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

            {/* Step 0: Size */}
            {!showResult && step === 0 && (
              <div className="mb-options-grid cols-3">
                {mattressSizes.map(s => (
                  <button key={s.key} className={`mb-option ${size === s.key ? 'selected' : ''}`} onClick={() => handleSelectSize(s.key)}>
                    <span className="mb-opt-icon">{s.icon}</span>
                    <span className="mb-opt-label">{s.label}</span>
                    <span className="mb-opt-desc">{s.dims}</span>
                    <span className="mb-opt-price">₾{getMattressBasePrice(s.key)}-დან</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Material */}
            {!showResult && step === 1 && (
              <div className="mb-options-grid cols-1">
                {mattressMaterials.map(m => (
                  <button key={m.key} className={`mb-option-row ${material === m.key ? 'selected' : ''}`} onClick={() => handleSelectMaterial(m.key)}>
                    <span className="mb-opt-icon">{m.icon}</span>
                    <div className="mb-opt-text">
                      <span className="mb-opt-label">{m.label}</span>
                      <span className="mb-opt-desc">{m.desc}</span>
                    </div>
                    {m.priceAdd > 0 && <span className="mb-opt-add">+₾{m.priceAdd}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Firmness */}
            {!showResult && step === 2 && (
              <div className="mb-options-grid cols-4">
                {mattressFirmness.map(f => (
                  <button key={f.key} className={`mb-option ${firmness === f.key ? 'selected' : ''}`} onClick={() => handleSelectFirmness(f.key)}>
                    <div className="mb-firmness-bar">
                      {[1, 2, 3, 4].map(i => (
                        <span key={i} className={`mb-firm-dot ${i <= f.level ? 'active' : ''}`} />
                      ))}
                    </div>
                    <span className="mb-opt-label">{f.label}</span>
                    <span className="mb-opt-desc">{f.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Cover */}
            {!showResult && step === 3 && (
              <div className="mb-options-grid cols-4">
                {mattressCovers.map(c => (
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
                  <h3>შენი მატრასი მზადაა!</h3>
                  <p>აი, შენი კონფიგურაციის შეჯამება</p>
                </div>

                <div className="mb-result-specs">
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedSize?.icon}</span>
                    <div>
                      <strong>{selectedSize?.label}</strong>
                      <span>{selectedSize?.dims}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedMaterial?.icon}</span>
                    <div>
                      <strong>{selectedMaterial?.label}</strong>
                      <span>{selectedMaterial?.desc}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">💪</span>
                    <div>
                      <strong>{selectedFirmness?.label}</strong>
                      <span>{selectedFirmness?.desc}</span>
                    </div>
                  </div>
                  <div className="mb-result-spec">
                    <span className="mb-rs-icon">{selectedCover?.icon}</span>
                    <div>
                      <strong>{selectedCover?.label} გარსაცმი</strong>
                      <span>მოხსნადი და ქიმწმენდადი</span>
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

  const product = products.find(p => p.id === Number(id))

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
                <span>5 წლიანი გარანტია</span>
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
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'slides'>('categories')

  // Category form
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image: '', count: 0 })
  const [editingCatId, setEditingCatId] = useState<number | null>(null)

  // Product form
  const [prodForm, setProdForm] = useState({ ...emptyProductForm })
  const [editingProdId, setEditingProdId] = useState<number | null>(null)
  const [prodFilterCat, setProdFilterCat] = useState<string>('all')

  // Slide form
  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', description: '', image: '', buttonText: '', buttonLink: '', accent: '#C9A96E' })

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
    setCatForm({ name: '', slug: '', description: '', image: '', count: 0 })
  }

  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id)
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, count: cat.count })
  }

  const cancelEditCat = () => {
    setEditingCatId(null)
    setCatForm({ name: '', slug: '', description: '', image: '', count: 0 })
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
    setSlideForm({ title: '', subtitle: '', description: '', image: '', buttonText: '', buttonLink: '', accent: '#C9A96E' })
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
        </div>

        {/* ════════════ Categories Tab ════════════ */}
        {activeTab === 'categories' && (
          <div className="admin-section">
            <div className="admin-grid">
              <div className="admin-form-card">
                <h3>{editingCatId !== null ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორიის დამატება'}</h3>
                <form onSubmit={handleCatSubmit}>
                  <div className="form-group">
                    <label htmlFor="cat-name">სახელი *</label>
                    <input type="text" id="cat-name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="მაგ: სამისხდომო" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-slug">Slug (URL) *</label>
                    <input type="text" id="cat-slug" value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="მაგ: chairs" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-desc">აღწერა</label>
                    <textarea id="cat-desc" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="კატეგორიის აღწერა..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cat-image">ფოტოს URL *</label>
                    <input type="url" id="cat-image" value={catForm.image} onChange={e => setCatForm({ ...catForm, image: e.target.value })} placeholder="https://..." required />
                  </div>
                  {catForm.image && (
                    <div className="admin-preview-image"><img src={catForm.image} alt="Preview" /></div>
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
                    <label htmlFor="prod-image">ფოტოს URL *</label>
                    <input type="url" id="prod-image" value={prodForm.image} onChange={e => setProdForm({ ...prodForm, image: e.target.value })} placeholder="https://..." required />
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
                      <input type="text" id="prod-dims" value={prodForm.dimensions} onChange={e => setProdForm({ ...prodForm, dimensions: e.target.value })} placeholder="მაგ: 75 × 80 × 105 სმ" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-color">ფერი</label>
                      <input type="text" id="prod-color" value={prodForm.color} onChange={e => setProdForm({ ...prodForm, color: e.target.value })} placeholder="მაგ: ნაცრისფერი" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-material">მასალა</label>
                    <input type="text" id="prod-material" value={prodForm.material} onChange={e => setProdForm({ ...prodForm, material: e.target.value })} placeholder="მაგ: მუხის ხე, ბამბის ქსოვილი" />
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
                    <input type="text" id="slide-title" value={slideForm.title} onChange={e => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="მაგ: ზაფხულის ფასდაკლება" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-subtitle">ქვესათაური</label>
                    <input type="text" id="slide-subtitle" value={slideForm.subtitle} onChange={e => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="მაგ: ყველა სავარძელზე -30%" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-desc">აღწერა</label>
                    <textarea id="slide-desc" value={slideForm.description} onChange={e => setSlideForm({ ...slideForm, description: e.target.value })} placeholder="სლაიდის აღწერა..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="slide-image">ფოტოს URL *</label>
                    <input type="url" id="slide-image" value={slideForm.image} onChange={e => setSlideForm({ ...slideForm, image: e.target.value })} placeholder="https://..." required />
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
                      <input type="text" id="slide-btn-link" value={slideForm.buttonLink} onChange={e => setSlideForm({ ...slideForm, buttonLink: e.target.value })} placeholder="მაგ: /category/chairs" />
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

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/business', element: <BusinessPage /> },
      { path: '/quiz', element: <MattressQuizPage /> },
      { path: '/mattress', element: <MattressBuilderPage /> },
      { path: '/admin', element: <AdminPage /> },
    ],
  },
]

export default Layout
