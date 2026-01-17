
import React from 'react';

const Trust: React.FC = () => {
  return (
    <section className="py-16 bg-black px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <i className="fa-solid fa-shield-halved gold-text text-3xl mb-4"></i>
          <h4 className="text-sm font-bold mb-1">100% Genuine</h4>
          <p className="text-[10px] text-zinc-500">Authentic materials only</p>
        </div>
        <div className="text-center">
          <i className="fa-solid fa-rotate-left gold-text text-3xl mb-4"></i>
          <h4 className="text-sm font-bold mb-1">Easy Returns</h4>
          <p className="text-[10px] text-zinc-500">7-Day money back</p>
        </div>
        <div className="text-center">
          <i className="fa-solid fa-handshake gold-text text-3xl mb-4"></i>
          <h4 className="text-sm font-bold mb-1">Pay on Delivery</h4>
          <p className="text-[10px] text-zinc-500">Trust before you pay</p>
        </div>
        <div className="text-center">
          <i className="fa-solid fa-award gold-text text-3xl mb-4"></i>
          <h4 className="text-sm font-bold mb-1">1 Year Warranty</h4>
          <p className="text-[10px] text-zinc-500">Full technical support</p>
        </div>
      </div>
    </section>
  );
};

export default Trust;
