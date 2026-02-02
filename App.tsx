
import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Scarcity from './components/Scarcity';
import Pricing from './components/Pricing';
import Trust from './components/Trust';
import FAQ from './components/FAQ';
import StickyCTA from './components/StickyCTA';
import WhatsAppFloating from './components/WhatsAppFloating';
import OrderFormModal from './components/OrderFormModal';
import ThemeToggle from './components/ThemeToggle';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { supabase } from './supabase';

interface UserLocation {
  city: string;
  region: string;
  country: string;
  ip: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: string;
  quantity: string;
  location: UserLocation | null;
  timestamp: number;
  status: 'New' | 'Contacted' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const DEFAULT_CONTENT = {
  lastUpdated: Date.now(),
  settings: {
    adminPassword: "Engineer@2021",
    crmWebhookUrl: "",
    autoFollowUpEnabled: true
  },
  hero: {
    headline: "Command Respect.",
    subheadline: "Own The Moment.",
    description: "Elevate your presence with a timepiece that speaks of legacy. Engineered for the bold Nigerian leader who demands excellence in every second.",
    anniversaryOffer: "Anniversary Celebration Offer"
  },
  pricing: {
    productName: "The Novari Elite",
    subDescription: "FULL LUXURY SET INCLUDED",
    currentPrice: 42500,
    oldPrice: 85000,
    priceQty2: 76500,
    priceQty3: 106250,
    whatsappNumber: "09013359052",
    orderMessage: "Hello Novari! I want to order the Novari Elite Watch set for ₦42,500. Please take my order.",
    stockCount: 7,
    features: [
      "1x Premium The Novari Elite Watch",
      "BONUS: Signature Novari Display Box (Valued at ₦5,000)",
      "BONUS: Free Nationwide Shipping (Valued at ₦3,500)"
    ]
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
  benefits: [
    {
      title: "Boost Your Confidence",
      desc: "Nothing says 'I have arrived' like a Novari timepiece. Feel the surge of confidence when you check the time or shake a business partner's hand.",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Perfect For Every Occasion",
      desc: "Whether you're wearing an Agbada for a traditional wedding or a bespoke suit for a corporate presentation, the Novari fits perfectly with your lifestyle.",
      img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Built For The Long Run",
      desc: "Made with industrial-grade 316L stainless steel. It won't rust, it won't fade, and it won't let you down. A legacy piece for years to come.",
      img: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop"
    }
  ],
  faqs: [
    {
      q: "How long does delivery take?",
      a: "For Lagos and Abuja, we deliver within 24-48 hours. For other states in Nigeria, it typically takes 3-5 working days."
    },
    {
      q: "Can I pay when I see the watch?",
      a: "Yes! We offer Payment on Delivery (PoD) nationwide. You can inspect the watch to ensure it meets your expectations before making payment."
    },
    {
      q: "Does it come with a box?",
      a: "Absolutely. Every Sovereign Elite watch comes with our signature luxury padded box, user manual, and warranty card."
    },
    {
      q: "What if the watch stops working?",
      a: "We provide a 12-month mechanical warranty. If you experience any manufacturing defects, we will repair or replace it free of charge."
    },
    {
      q: "Is it real water resistant?",
      a: "Yes, it is rated at 3ATM (30 Meters). It is safe for rain, hand washing, and accidental splashes. We do not recommend swimming or diving with it."
    }
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
  const [hasHydrated, setHasHydrated] = useState(false); 
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [dbSynced, setDbSynced] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('novari_content_cache');
      return cached ? JSON.parse(cached) : DEFAULT_CONTENT;
    } catch (e) {
      return DEFAULT_CONTENT;
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Pixel Injection Logic
  useEffect(() => {
    if (!hasHydrated) return;

    // Facebook Pixel
    if (content.marketing?.fbPixelId) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${content.marketing.fbPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Google Analytics
    if (content.marketing?.googleAnalyticsId) {
      const gaScript = document.createElement('script');
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${content.marketing.googleAnalyticsId}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${content.marketing.googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // TikTok Pixel
    if (content.marketing?.ttPixelId) {
      const ttScript = document.createElement('script');
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","trackWithContext","setAndTrack"],ttq.setAndTrack=function(t,e){ttq.instances[0].setAndTrack(t,e)};for(var i=0;i<ttq.methods.length;i++)ttq[ttq.methods[i]]=function(s){return function(){ttq.push([s].concat(Array.prototype.slice.call(arguments,0)))}}(ttq.methods[i]);ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${content.marketing.ttPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(ttScript);
    }
  }, [hasHydrated, content.marketing]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
    };
    initAuth();
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data: dbConfig } = await supabase
          .from('site_config')
          .select('content')
          .eq('id', 1)
          .maybeSingle();

        if (dbConfig?.content) {
          const remoteContent = dbConfig.content;
          
          const remoteStr = JSON.stringify(remoteContent);
          const localStr = JSON.stringify(content);
          
          if (remoteStr !== localStr) {
            if (!content.lastUpdated || remoteContent.lastUpdated >= content.lastUpdated) {
              setContent(remoteContent);
              try {
                localStorage.setItem('novari_content_cache', remoteStr);
              } catch (e) {
                console.warn('Storage cache failed.');
              }
            }
          }
        }

        if (isAuthenticated) {
          const { data: dbLeads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .order('timestamp', { ascending: false });
          
          if (!leadsError && dbLeads) {
            setLeads(dbLeads as Lead[]);
          }
        }
      } catch (err) {
        console.warn('Silent hydration error:', err);
      } finally {
        setHasHydrated(true);
      }
    };
    hydrate();
  }, [isAuthenticated]);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setUserLocation({
          city: data.city || 'Lagos',
          region: data.region || 'Lagos State',
          country: data.country_name || 'Nigeria',
          ip: data.ip
        });
      })
      .catch(() => {
        setUserLocation({ city: 'Lagos', region: 'Lagos State', country: 'Nigeria', ip: 'Unknown' });
      });
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    const syncToDB = async () => {
      setDbSynced(false);
      try {
        const { data: currentRemote } = await supabase
          .from('site_config')
          .select('content')
          .eq('id', 1)
          .maybeSingle();
        
        const remoteTimestamp = currentRemote?.content?.lastUpdated || 0;
        
        if (content.lastUpdated < remoteTimestamp) {
          setDbSynced(true);
          return;
        }

        const { error } = await supabase
          .from('site_config')
          .upsert({ id: 1, content: content }, { onConflict: 'id' });
        
        if (error) throw error;
        setDbSynced(true);
        try {
          localStorage.setItem('novari_content_cache', JSON.stringify(content));
        } catch (e) {
          console.warn('Storage quota exceeded.');
        }
      } catch (e) {
        console.error('Database Sync Error:', e);
        setDbSynced(false);
      }
    };

    const timer = setTimeout(syncToDB, 3000);
    return () => clearTimeout(timer);
  }, [content, hasHydrated, isAuthenticated]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

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
  
  const addLead = async (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
    const dbPayload = {
      id: newLead.id,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      altphone: newLead.altPhone || null,
      address: newLead.address,
      quantity: newLead.quantity,
      location: newLead.location,
      timestamp: newLead.timestamp,
      status: newLead.status
    };

    try {
      const { error } = await supabase.from('leads').insert([dbPayload]);
      if (error) console.error('Supabase Save Error:', error.message);
    } catch (err) {
      console.error('Network Error:', err);
    }

    const webhookUrl = content.settings?.crmWebhookUrl;
    if (webhookUrl?.trim()) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead_captured', data: newLead, source: window.location.origin }),
      }).catch(() => {});
    }
  };

  const updateLeads = async (updatedLeads: Lead[]) => {
    if (!isAuthenticated) return;
    const prevLeads = leads;
    setLeads(updatedLeads);
    try {
      const currentIds = updatedLeads.map(l => l.id);
      const prevIds = prevLeads.map(l => l.id);
      const deletedId = prevIds.find(id => !currentIds.includes(id));
      if (deletedId) {
        await supabase.from('leads').delete().eq('id', deletedId);
      } else {
        const modifiedLead = updatedLeads.find(l => {
          const prev = prevLeads.find(p => p.id === l.id);
          return prev && prev.status !== l.status;
        });
        if (modifiedLead) {
          await supabase.from('leads').update({ status: modifiedLead.status }).eq('id', modifiedLead.id);
        }
      }
    } catch (err) { console.error('Lead status update failed:', err); }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 left-4 z-[70] p-3 bg-zinc-800/20 hover:bg-zinc-800/80 rounded-full text-[10px] text-white opacity-0 hover:opacity-100 transition-all cursor-default"
        title="Admin Portal (Alt + A)"
      >
        <i className="fa-solid fa-lock"></i>
      </button>
      
      {showAdmin ? (
        isAuthenticated ? (
          <AdminDashboard 
            content={content} 
            userLocation={userLocation}
            leads={leads}
            onLeadsUpdate={updateLeads}
            onSave={(newContent) => setContent({...newContent, lastUpdated: Date.now()})} 
            onClose={() => setShowAdmin(false)} 
            onLogout={async () => {
              await supabase.auth.signOut();
              setShowAdmin(false);
            }}
            dbSynced={dbSynced}
          />
        ) : (
          <AdminLogin onCancel={() => setShowAdmin(false)} />
        )
      ) : (
        <>
          <Hero timeLeft={timeLeft} onOrderClick={() => setIsModalOpen(true)} data={content.hero} />
          <ProductShowcase specs={content.products} media={content.media} />
          <Benefits items={content.benefits} />
          <Scarcity timeLeft={timeLeft} stock={content.pricing.stockCount} userCity={userLocation?.city} />
          <Testimonials reviews={content.testimonials} />
          <Pricing onOrderClick={() => setIsModalOpen(true)} data={content.pricing} />
          <Trust />
          <FAQ items={content.faqs} />
          <footer className="bg-zinc-100 dark:bg-zinc-900 py-12 px-4 text-center border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col items-center mb-6">
              <p className="font-serif text-3xl tracking-[0.2em] mb-1">NOVARI</p>
              <div className="w-16 h-[1px] bg-zinc-400 dark:bg-zinc-600 mb-2"></div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Mark Your Moment.</p>
            </div>
            <p className="text-zinc-500 text-sm">© 2026 Novari Nigeria. All rights reserved.</p>
          </footer>
          <StickyCTA 
            onOrderClick={() => setIsModalOpen(true)} 
            price={content.pricing.currentPrice} 
            oldPrice={content.pricing.oldPrice} 
          />
          <WhatsAppFloating whatsappNumber={content.pricing.whatsappNumber} />
          <OrderFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            whatsappNumber={content.pricing.whatsappNumber} 
            pricing={content.pricing}
            userLocation={userLocation}
            onCaptureLead={addLead}
          />
        </>
      )}
    </div>
  );
};

export default App;
