
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black transition-colors duration-500"></div>
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"></div>
      
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex flex-col items-start pointer-events-none">
        <h2 className="font-serif text-xl md:text-2xl tracking-[0.2em] text-zinc-900 dark:text-white leading-tight">NOVARI</h2>
        <div className="w-full h-[1px] bg-zinc-900 dark:bg-white my-1"></div>
        <p className="text-[6px] md:text-[8px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Mark Your Moment.</p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        <span className="gold-text uppercase tracking-widest text-sm font-bold mb-4 block animate-pulse">
          {data.anniversaryOffer}
        </span>
        <h1 className="font-serif text-4xl md:text-7xl mb-6 leading-tight tracking-tight text-zinc-900 dark:text-white">
          {data.headline}<br />
          <span className="gold-text">{data.subheadline}</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          {data.description}
        </p>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl mb-10 inline-block shadow-lg">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest mb-3">Flash Sale Ends In:</p>
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

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={onOrderClick}
            className="gold-bg text-black font-black px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)] tracking-wide"
          >
            CLAIM MY 50% DISCOUNT NOW
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
