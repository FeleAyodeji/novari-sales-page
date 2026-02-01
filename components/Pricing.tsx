
import React from 'react';

interface PricingProps {
  onOrderClick: () => void;
  data: {
    productName: string;
    subDescription?: string;
    currentPrice: number;
    oldPrice: number;
    whatsappNumber: string;
    features?: string[];
  };
}

const Pricing: React.FC<PricingProps> = ({ onOrderClick, data }) => {
  const defaultFeatures = [
    `1x Premium ${data.productName} Watch`,
    "BONUS: Signature Novari Display Box (Valued at ₦5,000)",
    "BONUS: Free Nationwide Shipping (Valued at ₦3,500)"
  ];

  const featuresToRender = data.features && data.features.length > 0 ? data.features : defaultFeatures;

  return (
    <section id="order" className="py-24 bg-zinc-900/20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900 border-2 gold-border rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          <div className="gold-bg text-black text-center py-4 font-black uppercase tracking-[0.3em] text-sm">
            Novari Anniversary Offer
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-serif mb-2 tracking-wide text-white">{data.productName}</h3>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">{data.subDescription || "Full Luxury Set Included"}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-zinc-500 line-through text-xl">₦{data.oldPrice.toLocaleString()}</p>
                <p className="text-5xl font-bold gold-text">₦{data.currentPrice.toLocaleString()}</p>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded mt-2 inline-block animate-pulse">SAVE 50% TODAY</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {featuresToRender.map((feature, idx) => {
                const isBonus = feature.toLowerCase().startsWith('bonus:');
                const cleanFeature = isBonus ? feature.substring(6).trim() : feature;
                
                return (
                  <div key={idx} className="flex items-center gap-3 text-zinc-300">
                    <i className="fa-solid fa-circle-check text-green-500"></i>
                    {isBonus && <span className="font-semibold text-white">BONUS:</span>}
                    <span>{cleanFeature}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <button 
                onClick={onOrderClick}
                className="w-full gold-bg text-black font-black py-6 rounded-xl text-xl hover:brightness-110 transition-all flex flex-col items-center gap-1 group shadow-[0_0_20px_rgba(212,175,55,0.2)] tracking-wider"
              >
                <span>GET THE DEAL NOW</span>
                <span className="text-[10px] opacity-70 group-hover:opacity-100 uppercase tracking-widest font-bold">Secure your anniversary discount</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
