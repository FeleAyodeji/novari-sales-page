
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Scarcity from './components/Scarcity';
import Pricing from './components/Pricing';
import Trust from './components/Trust';
import FAQ from './components/FAQ';
import StickyCTA from './components/StickyCTA';
import WhatsAppOrder from './components/WhatsAppOrder';
import WhatsAppFloating from './components/WhatsAppFloating';
import OrderFormModal from './components/OrderFormModal';
import ThemeToggle from './components/ThemeToggle';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

interface UserLocation {
  city: string;
  region: string;
  country: string;
  ip: string;
}

const DEFAULT_CONTENT = {
  settings: {
    adminPassword: "Engineer@2021"
  },
  hero: {
    headline: "Command Respect.",
    subheadline: "Own The Moment.",
    description: "Elevate your presence with a timepiece that speaks of legacy. Engineered for the bold Nigerian leader who demands excellence in every second.",
    anniversaryOffer: "Anniversary Celebration Offer"
  },
  pricing: {
    productName: "The Novari Elite",
    currentPrice: 42500,
    oldPrice: 85000,
    whatsappNumber: "2348000000000",
    orderMessage: "Hello Novari! I want to order the Novari Elite Watch set for ₦42,500. Please take my order.",
    stockCount: 7
  },
  marketing: {
    fbPixelId: "",
    ttPixelId: "",
    googleAnalyticsId: ""
  },
  media: {
    mainImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=2000&auto=format&fit=crop",
    sideImage1: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
    sideImage2: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop",
    productVideo: ""
  },
  products: [
    { icon: 'fa-water', label: 'Water Resistant', value: '30M Depth' },
    { icon: 'fa-gem', label: 'Sapphire Glass', value: 'Scratch Proof' },
    { icon: 'fa-battery-full', label: 'Japanese Quartz', value: '5-Year Battery' },
    { icon: 'fa-layer-group', label: 'Stainless Steel', value: '316L Grade' }
  ],
  testimonials: [
    { name: "Oluwaseun K.", location: "Lagos", text: "I was skeptical at first, but the quality is amazing. I wore it to my brother's wedding and everyone was asking where I got it. 10/10!", stars: 5 },
    { name: "Chinedu A.", location: "Abuja", text: "Delivery was fast. It took only 2 days to get to me in Abuja. The box it came in is also very luxury. Highly recommended.", stars: 5 },
    { name: "Amina B.", location: "Port Harcourt", text: "Bought this as a gift for my husband. He loves it so much. It looks way more expensive than the price.", stars: 5 }
  ]
};

const App: React.FC = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('novari_content');
    return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
  });

  // Silent Geolocation Fetching
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserLocation({
          city: data.city || 'Lagos',
          region: data.region || 'Lagos State',
          country: data.country_name || 'Nigeria',
          ip: data.ip
        });
      } catch (error) {
        console.error("Geolocation failed:", error);
        setUserLocation({ city: 'Lagos', region: 'Lagos State', country: 'Nigeria', ip: 'Unknown' });
      }
    };
    fetchLocation();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('novari_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          if (minutes > 0) { minutes--; seconds = 59; }
          else { if (hours > 0) { hours--; minutes = 59; seconds = 59; } }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const updateContent = (newContent: any) => setContent(newContent);

  if (showAdmin) {
    if (!isAuthenticated) {
      return (
        <AdminLogin 
          correctPassword={content.settings?.adminPassword || "Engineer@2021"} 
          onSuccess={() => setIsAuthenticated(true)} 
          onCancel={() => setShowAdmin(false)} 
        />
      );
    }
    return (
      <AdminDashboard 
        content={content} 
        userLocation={userLocation}
        onSave={updateContent} 
        onClose={() => setShowAdmin(false)} 
        onLogout={() => {
          setIsAuthenticated(false);
          setShowAdmin(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 left-4 z-[70] p-3 bg-zinc-800/20 hover:bg-zinc-800/80 rounded-full text-[10px] text-white opacity-0 hover:opacity-100 transition-all cursor-default"
        title="Admin Shortcut: Alt + A"
      >
        <i className="fa-solid fa-lock"></i>
      </button>
      
      <Hero 
        timeLeft={timeLeft} 
        onOrderClick={() => setIsModalOpen(true)} 
        data={content.hero} 
      />
      <ProductShowcase specs={content.products} media={content.media} />
      <Benefits />
      <Scarcity 
        timeLeft={timeLeft} 
        stock={content.pricing.stockCount} 
        userCity={userLocation?.city}
      />
      <Testimonials reviews={content.testimonials} />
      <Pricing 
        onOrderClick={() => setIsModalOpen(true)} 
        data={content.pricing} 
      />
      <Trust />
      <FAQ />
      <WhatsAppOrder whatsappNumber={content.pricing.whatsappNumber} />
      
      <footer className="bg-zinc-100 dark:bg-zinc-900 py-12 px-4 text-center border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-6">
          <p className="font-serif text-3xl tracking-[0.2em] mb-1">NOVARI</p>
          <div className="w-16 h-[1px] bg-zinc-400 dark:bg-zinc-600 mb-2"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Mark Your Moment.</p>
        </div>
        <p className="text-zinc-500 text-sm">© 2024 Novari Nigeria. All rights reserved.</p>
      </footer>

      <StickyCTA onOrderClick={() => setIsModalOpen(true)} price={content.pricing.currentPrice} />
      <WhatsAppFloating whatsappNumber={content.pricing.whatsappNumber} />
      <OrderFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        whatsappNumber={content.pricing.whatsappNumber} 
        currentPrice={content.pricing.currentPrice}
        userLocation={userLocation}
      />
    </div>
  );
};

export default App;
