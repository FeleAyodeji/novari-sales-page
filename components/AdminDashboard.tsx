
import React, { useState, useRef } from 'react';

interface AdminDashboardProps {
  content: any;
  userLocation: any;
  onSave: (newContent: any) => void;
  onClose: () => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ content, userLocation, onSave, onClose, onLogout }) => {
  const [formData, setFormData] = useState(content);
  const [activeTab, setActiveTab] = useState('hero');
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, hero: { ...formData.hero, [e.target.name]: e.target.value } });
  };

  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, pricing: { ...formData.pricing, [e.target.name]: e.target.value } });
  };

  const handleMarketingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, marketing: { ...formData.marketing, [e.target.name]: e.target.value } });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, media: { ...formData.media, [e.target.name]: e.target.value } });
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ 
      ...formData, 
      settings: { ...formData.settings, [e.target.name]: e.target.value } 
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Please use images under 2MB to ensure they save correctly to your browser.");
      return;
    }

    setIsUploading(fieldName);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({
        ...formData,
        media: { ...formData.media, [fieldName]: base64String }
      });
      setIsUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = () => {
    try {
      onSave(formData);
      onClose();
    } catch (e) {
      alert("Storage limit exceeded! Try using smaller images or providing links instead of direct uploads.");
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'pricing', label: 'Pricing & Stock' },
    { id: 'media', label: 'Media Assets' },
    { id: 'marketing', label: 'Ads & Pixels' },
    { id: 'content', label: 'Testimonials' },
    { id: 'traffic', label: 'Traffic Insights' },
    { id: 'settings', label: 'Dashboard Settings' }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-2xl font-bold tracking-tighter">NOVARI <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-500 ml-2 font-sans tracking-widest uppercase">Admin</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="px-4 py-2 text-xs text-red-500 hover:text-red-700 transition-colors font-bold uppercase tracking-widest">Logout</button>
          <div className="w-[1px] h-6 bg-zinc-200"></div>
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">Cancel</button>
          <button onClick={saveChanges} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all">Save Changes</button>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full p-6 gap-8">
        <aside className="w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 max-h-[calc(100vh-160px)] overflow-y-auto">
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Edit Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Headline</label>
                  <input name="headline" value={formData.hero.headline} onChange={handleHeroChange} className="w-full border p-3 rounded-lg focus:ring-2 ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Sub-Headline</label>
                  <input name="subheadline" value={formData.hero.subheadline} onChange={handleHeroChange} className="w-full border p-3 rounded-lg focus:ring-2 ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Main Description</label>
                  <textarea name="description" value={formData.hero.description} onChange={handleHeroChange} className="w-full border p-3 rounded-lg h-32 focus:ring-2 ring-black outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Live Traffic Insights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 text-white p-8 rounded-3xl border border-zinc-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <i className="fa-solid fa-earth-africa text-8xl"></i>
                  </div>
                  <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Current Visitor Detected</h3>
                  {userLocation ? (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-4xl font-serif gold-text">{userLocation.city}</p>
                        <p className="text-sm text-zinc-400">{userLocation.region}, {userLocation.country}</p>
                      </div>
                      <div className="pt-4 border-t border-zinc-800">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                          <span>IP Address:</span>
                          <span className="text-white">{userLocation.ip}</span>
                        </div>
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold tracking-widest">Active Now</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Locating visitor...</p>
                  )}
                </div>
                
                <div className="bg-white border border-zinc-200 p-8 rounded-3xl">
                  <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Tracking Capabilities</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-map-pin text-zinc-900"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Geo-Personalization</p>
                        <p className="text-[10px] text-zinc-500">Funnel text is currently automatically adapting to show local scarcity based on the IPs detected.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-whatsapp text-green-500"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Order Source Tracking</p>
                        <p className="text-[10px] text-zinc-500">All incoming WhatsApp messages now include the buyer's approximate location data for your records.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Prices & WhatsApp</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Discount Price (₦)</label>
                  <input type="number" name="currentPrice" value={formData.pricing.currentPrice} onChange={handlePricingChange} className="w-full border p-3 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Original Price (₦)</label>
                  <input type="number" name="oldPrice" value={formData.pricing.oldPrice} onChange={handlePricingChange} className="w-full border p-3 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">WhatsApp Number (incl. 234)</label>
                  <input name="whatsappNumber" value={formData.pricing.whatsappNumber} onChange={handlePricingChange} className="w-full border p-3 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Stock Left Counter</label>
                  <input type="number" name="stockCount" value={formData.pricing.stockCount} onChange={handlePricingChange} className="w-full border p-3 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold border-b pb-4">Product Media</h2>
              <div className="grid gap-8">
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                  <label className="block text-sm font-bold uppercase text-zinc-600 mb-4">Main Showcase</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 bg-zinc-200 rounded-xl overflow-hidden border border-zinc-300 flex items-center justify-center relative group">
                      {formData.media.productVideo ? (
                        <video src={formData.media.productVideo} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={formData.media.mainImage} className="w-full h-full object-cover" alt="Preview" />
                      )}
                      {isUploading === 'mainImage' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Uploading...</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-2">
                        <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2">
                          <i className="fa-solid fa-image"></i>
                          Upload Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'mainImage')} />
                        </label>
                        <label className="cursor-pointer border border-zinc-300 bg-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-50 transition-colors flex items-center gap-2">
                          <i className="fa-solid fa-video"></i>
                          Upload Video
                          <input type="file" accept="video/mp4" className="hidden" onChange={(e) => handleFileUpload(e, 'productVideo')} />
                        </label>
                      </div>
                      <input name="mainImage" value={formData.media.mainImage} onChange={handleMediaChange} className="w-full border p-2 rounded-lg text-xs" placeholder="Or paste link..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Dashboard Settings</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Admin Access Password</label>
                  <input 
                    type="password" 
                    name="adminPassword" 
                    value={formData.settings?.adminPassword || ""} 
                    onChange={handleSettingsChange} 
                    className="w-full border p-3 rounded-lg focus:ring-2 ring-black outline-none" 
                    placeholder="Enter new password"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2 italic">Important: If you forget this password, you will need to clear your browser data to reset it to 'Engineer@2021'.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Tracking Pixels</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border">
                  <i className="fa-brands fa-facebook text-blue-600 text-2xl"></i>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400">Facebook Pixel ID</label>
                    <input name="fbPixelId" value={formData.marketing.fbPixelId} onChange={handleMarketingChange} placeholder="e.g. 1234567890" className="w-full bg-transparent outline-none py-1 border-b" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Testimonials</h2>
              <div className="space-y-4">
                {formData.testimonials.map((t: any, i: number) => (
                  <div key={i} className="border p-4 rounded-xl space-y-2">
                    <input 
                      value={t.name} 
                      onChange={(e) => {
                        const next = [...formData.testimonials];
                        next[i].name = e.target.value;
                        setFormData({...formData, testimonials: next});
                      }}
                      className="font-bold w-full outline-none" 
                    />
                    <textarea 
                      value={t.text} 
                      onChange={(e) => {
                        const next = [...formData.testimonials];
                        next[i].text = e.target.value;
                        setFormData({...formData, testimonials: next});
                      }}
                      className="w-full text-sm text-zinc-500 bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
