
import React, { useState } from 'react';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  currentPrice: number;
  userLocation: any;
  onCaptureLead: (lead: any) => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, whatsappNumber, currentPrice, userLocation, onCaptureLead }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    
    // Calculate actual total based on the selected quantity and its specific discount
    let total = currentPrice;
    if (formData.quantity === '2') total = Math.floor(currentPrice * 1.8);
    if (formData.quantity === '3') total = Math.floor(currentPrice * 2.5);
    
    // Create Lead Object for CRM
    const newLead = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      quantity: formData.quantity,
      location: userLocation,
      timestamp: Date.now(),
      status: 'New'
    };

    // Capture in CRM
    onCaptureLead(newLead);

    // Show success message instead of redirecting
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose}></div>
      <div className="relative bg-zinc-900 border-2 gold-border w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.3)] transform transition-all">
        
        {!isSubmitted ? (
          <>
            <div className="gold-bg text-black p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Complete Your Novari Order</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Pay on Delivery Available Nationwide</p>
              </div>
              <button onClick={handleClose} className="text-black/50 hover:text-black">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
                <i className="fa-solid fa-location-dot gold-text"></i>
                <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">
                  Shipping to: <span className="text-white">{userLocation?.city || 'Your Location'}, Nigeria</span>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required name="name" placeholder="e.g. Kolawole Chinedu" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all" value={formData.name} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input required type="email" name="email" placeholder="email@example.com" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input required type="tel" name="phone" placeholder="080 123 4567" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all" value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Quantity</label>
                  <select name="quantity" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all" value={formData.quantity} onChange={handleChange}>
                    <option value="1">1 Piece (₦{currentPrice.toLocaleString()})</option>
                    <option value="2">2 Pieces (₦{Math.floor(currentPrice * 1.8).toLocaleString()})</option>
                    <option value="3">3 Pieces (₦{Math.floor(currentPrice * 2.5).toLocaleString()})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Delivery Address</label>
                <textarea required name="address" placeholder="Full Home/Office Address" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none h-20 resize-none focus:border-gold transition-all" value={formData.address} onChange={handleChange}></textarea>
              </div>

              <button type="submit" className="w-full gold-bg text-black font-black py-5 rounded-xl text-lg shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                Confirm My Order
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <h3 className="text-3xl font-serif text-white mb-2 tracking-tight">Order Received!</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Thank you for choosing Novari, <span className="text-white font-bold">{formData.name}</span>.<br />
                Our concierge will contact you shortly on <span className="text-white font-bold">{formData.phone}</span> to confirm your delivery details.
              </p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-800">
               <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Estimated Delivery</p>
               <p className="text-white font-bold">24 - 48 Hours</p>
            </div>
            <button 
              onClick={handleClose}
              className="w-full border-2 gold-border gold-text py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFormModal;
