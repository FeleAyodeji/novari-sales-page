
import React from 'react';

interface ScarcityProps {
  timeLeft: { hours: number; minutes: number; seconds: number };
  stock: number;
  userCity?: string;
}

const Scarcity: React.FC<ScarcityProps> = ({ timeLeft, stock, userCity }) => {
  return (
    <section className="py-16 bg-red-950/20 border-y border-red-900/30 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-2 uppercase tracking-tighter">
            RUNNING OUT FAST IN {userCity ? <span className="underline decoration-2 underline-offset-4 decoration-red-500/50">{userCity.toUpperCase()}</span> : 'YOUR AREA'}!
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">Due to high demand, we are almost out of stock {userCity ? `in ${userCity}` : 'nationwide'}. First come, first served.</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-black text-white animate-pulse">{stock.toString().padStart(2, '0')}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Left In Stock</p>
          </div>
          <div className="h-12 w-[1px] bg-zinc-800"></div>
          <div className="text-center min-w-[120px]">
            <p className="text-2xl font-bold animate-gold-glow">
              {timeLeft.hours.toString().padStart(2, '0')}:
              {timeLeft.minutes.toString().padStart(2, '0')}:
              {timeLeft.seconds.toString().padStart(2, '0')}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Deal Ends Today</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scarcity;
