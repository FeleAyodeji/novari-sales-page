
import React, { useState } from 'react';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  currentPrice: number;
  userLocation: any;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, whatsappNumber, currentPrice, userLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: '1'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = currentPrice * parseInt(formData.quantity);
    
    const locationString = userLocation 
      ? `${userLocation.city}, ${userLocation.region}, ${userLocation.country} (IP: ${userLocation.ip})` 
      : 'Location data unavailable';

    const message = `*NEW ORDER FROM NOVARI WEBSITE* 🚀
---
*Product:* Novari Elite Anniversary Watch
*Quantity:* ${formData.quantity}
*Total Amount:* ₦${total.toLocaleString()}
---
*CUSTOMER DETAILS*
*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Address:* ${formData.address}
---
*VISITOR INSIGHTS* 📍
*Detected Location:* ${locationString}
---
Please confirm my order and send payment details. Mark my moment!`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-zinc-900 border-2 gold-border w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.3)] transform transition-all">
        <div className="gold-bg text-black p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Complete Your Novari Order</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Pay on Delivery Available Nationwide</p>
          </div>
          <button onClick={onClose} className="text-black/50 hover:text-black">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
            <i className="fa-solid fa-location-dot gold-text"></i>
            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">
              Shipping to: <span className="text-white">{userLocation?.city || 'Your Location'}, Nigeria</span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
            <input required name="name" placeholder="e.g. Kolawole Chinedu" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white outline-none focus:border-gold transition-all" value={formData.name} onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone</label>
              <input required type="tel" name="phone" placeholder="080 123 4567" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white outline-none focus:border-gold transition-all" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quantity</label>
              <select name="quantity" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white outline-none focus:border-gold transition-all" value={formData.quantity} onChange={handleChange}>
                <option value="1">1 Piece (₦{currentPrice.toLocaleString()})</option>
                <option value="2">2 Pieces (₦{(currentPrice * 1.8).toLocaleString()})</option>
                <option value="3">3 Pieces (₦{(currentPrice * 2.5).toLocaleString()})</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Delivery Address</label>
            <textarea required name="address" placeholder="Full Address" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white outline-none h-24 resize-none focus:border-gold transition-all" value={formData.address} onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="w-full gold-bg text-black font-black py-6 rounded-xl text-lg shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3">
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            SUBMIT VIA WHATSAPP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderFormModal;
