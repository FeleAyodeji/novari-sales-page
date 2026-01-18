
import React from 'react';

interface WhatsAppOrderProps {
  whatsappNumber: string;
}

const WhatsAppOrder: React.FC<WhatsAppOrderProps> = ({ whatsappNumber }) => {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const finalNumber = cleanNumber.startsWith('0') ? '234' + cleanNumber.substring(1) : cleanNumber;

  const message = encodeURIComponent("Hello Novari! I'm interested in the Novari Elite Watch Anniversary Offer. Please guide me on how to complete my order.");
  const whatsappUrl = `https://wa.me/${finalNumber}?text=${message}`;

  return (
    <section className="py-16 bg-zinc-900 border-t border-zinc-800 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#25D366] rounded-full mb-8 shadow-[0_0_30px_rgba(37,211,102,0.3)] animate-bounce">
          <i className="fa-brands fa-whatsapp text-white text-4xl"></i>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl mb-6 tracking-wide text-white">Prefer To Order On WhatsApp?</h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Skip the forms and chat directly with our sales team. We can process your order and answer any questions you have in real-time. Mark your moment with Novari.
        </p>
        
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black px-12 py-6 rounded-full text-xl transition-all hover:scale-105 shadow-xl tracking-wider"
        >
          <i className="fa-brands fa-whatsapp text-2xl"></i>
          ORDER VIA WHATSAPP
        </a>
      </div>
    </section>
  );
};

export default WhatsAppOrder;
