
import React, { useState, useEffect } from 'react';

interface StickyCTAProps {
  onOrderClick: () => void;
  price: number;
  oldPrice: number;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ onOrderClick, price, oldPrice }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
      <div className="bg-black/90 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
        <div className="pl-4">
          <p className="text-zinc-500 text-[10px] font-bold tracking-widest line-through mb-0.5 opacity-60">₦{oldPrice.toLocaleString()}</p>
          <p className="text-xl font-bold gold-text leading-none">₦{price.toLocaleString()}</p>
        </div>
        <button 
          onClick={onOrderClick}
          className="gold-bg text-black font-black px-6 py-3 rounded-xl text-sm flex-1 text-center animate-pulse-gold shadow-lg"
        >
          CLAIM OFFER
        </button>
      </div>
    </div>
  );
};

export default StickyCTA;
