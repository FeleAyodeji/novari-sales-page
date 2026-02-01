
import React, { useState, useEffect } from 'react';

interface WhatsAppFloatingProps {
  whatsappNumber: string;
}

const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({ whatsappNumber }) => {
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const finalNumber = cleanNumber.startsWith('0') ? '234' + cleanNumber.substring(1) : cleanNumber;

  const message = encodeURIComponent("Hi Novari, I have a question about the Novari Elite watch.");
  const whatsappUrl = `https://wa.me/${finalNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-[60] flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 right-6 md:bottom-10 md:right-10 ${
        isStickyVisible ? 'bottom-24 md:bottom-10' : 'bottom-6 md:bottom-10'
      }`}
      aria-label="Chat with Novari"
    >
      <i className="fa-brands fa-whatsapp text-3xl"></i>
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
      </span>
    </a>
  );
};

export default WhatsAppFloating;
