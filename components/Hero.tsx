
import React from 'react';

interface HeroProps {
  timeLeft: { hours: number; minutes: number; seconds: number };
  onOrderClick: () => void;
  data: {
    headline: string;
    subheadline: string;
    description: string;
    anniversaryOffer: string;
  };
}

const Hero: React.FC<HeroProps> = ({ timeLeft, onOrderClick, data }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* High-Impact Announcement Bar */}
      <div className="absolute top-0 left-0 right-0 z-[60] gold-bg py-2 overflow-hidden border-b border-black/10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-8 mx-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-2">
                <i className="fa-solid fa-bolt"></i> ANNIVERSARY DISCOUNT: 50% OFF TODAY ONLY
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-2">
                <i className="fa-solid fa-bolt"></i> FREE NATIONWIDE DELIVERY
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-2">
                <i className="fa-solid fa-bolt"></i> PAYMENT ON DELIVERY
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black transition-colors duration-1000"></div>
      
      {/* Enhanced Background with Ken Burns Effect */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none overflow-hidden">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center animate-ken-burns"></div>
      </div>
      
      <div className="absolute top-16 left-6 md:top-20 md:left-10 z-20 flex flex-col items-start pointer-events-none animate-reveal-up stagger-1">
        <h2 className="font-serif text-xl md:text-2xl tracking-[0.2em] text-zinc-900 dark:text-white leading-tight">NOVARI</h2>
        <div className="w-full h-[1px] bg-zinc-900 dark:bg-white my-1"></div>
        <p className="text-[6px] md:text-[8px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Mark Your Moment.</p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-32 px-4">
        <span className="gold-text uppercase tracking-[0.4em] text-[10px] md:text-xs font-black mb-4 block animate-reveal-up stagger-2">
          {data.anniversaryOffer || "Anniversary Celebration Offer"}
        </span>
        
        <h1 className="font-serif text-4xl md:text-7xl mb-6 leading-tight tracking-tight text-zinc-900 dark:text-white animate-reveal-up stagger-3">
          {data.headline}<br />
          <span className="gold-text italic relative inline-block">
            {data.subheadline}
            <span className="absolute inset-0 shine-effect pointer-events-none"></span>
          </span>
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-reveal-up stagger-4">
          {data.description}
        </p>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl mb-10 inline-block shadow-lg animate-reveal-up stagger-5">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest mb-3">Limited Offer Ends In:</p>
          <div className="flex gap-4 text-2xl md:text-4xl font-bold font-serif text-zinc-900 dark:text-white">
            <div className="w-12 md:w-20">
              <span className="animate-timer-tick inline-block">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[10px] block uppercase text-zinc-500 mt-1">Hrs</span>
            </div>
            <span className="gold-text">:</span>
            <div className="w-12 md:w-20">
              <span className="animate-timer-tick inline-block">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[10px] block uppercase text-zinc-500 mt-1">Min</span>
            </div>
            <span className="gold-text">:</span>
            <div className="w-12 md:w-20">
              <span className="animate-timer-tick inline-block">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[10px] block uppercase text-zinc-500 mt-1">Sec</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center animate-reveal-up stagger-5">
          <button 
            onClick={onOrderClick}
            className="gold-bg text-black font-black px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)] tracking-wide group relative overflow-hidden"
          >
            <span className="relative z-10 uppercase">Claim My 50% Discount Now</span>
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
