
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Lead } from '../App';

interface AdminDashboardProps {
  content: any;
  userLocation: any;
  leads: Lead[];
  onLeadsUpdate: (leads: Lead[]) => void;
  onSave: (newContent: any) => void;
  onClose: () => void;
  onLogout: () => void;
  dbSynced?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ content, userLocation, leads, onLeadsUpdate, onSave, onClose, onLogout, dbSynced }) => {
  const [formData, setFormData] = useState(content);
  const [activeTab, setActiveTab] = useState('crm');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Performance Optimization: Grouping logic for Leads using useMemo
  const groupedLeads = useMemo(() => {
    return leads.reduce((groups: { [key: string]: Lead[] }, lead) => {
      const date = new Date(lead.timestamp);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(lead);
      return groups;
    }, {});
  }, [leads]);

  // Performance Optimization: Sort month keys using useMemo
  const sortedMonthKeys = useMemo(() => {
    return Object.keys(groupedLeads).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedLeads]);

  const generateFollowUp = async (lead: Lead, channel: 'WhatsApp' | 'Email') => {
    setIsGenerating(lead.id);
    setAiResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a luxury sales closer for Novari Watches Nigeria. 
      Customer Name: ${lead.name}
      Location: ${lead.location?.city || 'Nigeria'}
      Product: Novari Elite Watch (₦${formData.pricing.currentPrice})
      Quantity: ${lead.quantity}
      Channel: ${channel}
      
      Draft a highly persuasive, premium, and friendly follow-up message to encourage the customer to complete their payment. 
      Mention that delivery to ${lead.location?.city || 'their location'} is fast. 
      Keep it professional but with a "Nigerian luxury" touch. 
      If WhatsApp, keep it concise with emojis. If Email, use a subject line.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiResponse(response.text || 'Error generating message.');
    } catch (err) {
      setAiResponse('Error: Please check your API key or connection.');
    } finally {
      setIsGenerating(null);
    }
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    const next = leads.map(l => l.id === id ? { ...l, status } : l);
    onLeadsUpdate(next);
  };

  const deleteLead = (id: string) => {
    if (confirm("Permanently remove this lead from CRM?")) {
      const updatedLeads = leads.filter(l => l.id !== id);
      onLeadsUpdate(updatedLeads);
    }
  };

  const testWebhook = async () => {
    const url = formData.settings.crmWebhookUrl;
    if (!url) {
      alert("Please enter a Webhook URL first.");
      return;
    }

    setIsTestingWebhook(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_connection',
          timestamp: Date.now(),
          message: "Testing Novari CRM Webhook Connection"
        })
      });
      
      if (response.ok || response.type === 'opaque') {
        alert("Webhook connection test sent successfully!");
      } else {
        alert(`Webhook test failed with status: ${response.status}`);
      }
    } catch (err) {
      alert(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, hero: { ...formData.hero, [e.target.name]: e.target.value } });
  };

  const handlePricingChange = (field: string, value: any) => {
    setFormData({ ...formData, pricing: { ...formData.pricing, [field]: value } });
  };

  const handleMarketingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ 
      ...formData, 
      marketing: { ...formData.marketing, [e.target.name]: e.target.value } 
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please keep it under 5MB.");
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ 
      ...formData, 
      settings: { ...formData.settings, [e.target.name]: e.target.value } 
    });
  };

  const addListItem = (key: string, template: any) => {
    setFormData({
      ...formData,
      [key]: [template, ...formData[key]]
    });
  };

  const removeListItem = (key: string, index: number) => {
    const nextList = [...formData[key]];
    nextList.splice(index, 1);
    setFormData({ ...formData, [key]: nextList });
  };

  const updateListItem = (key: string, index: number, field: string, value: any) => {
    const nextList = [...formData[key]];
    nextList[index] = { ...nextList[index], [field]: value };
    setFormData({ ...formData, [key]: nextList });
  };

  const tabs = [
    { id: 'crm', label: 'CRM Leads', icon: 'fa-users' },
    { id: 'content_editor', label: 'Content Editor', icon: 'fa-pen-to-square' },
    { id: 'marketing', label: 'Ad Pixels', icon: 'fa-chart-line' },
    { id: 'automation', label: 'Automation', icon: 'fa-robot' },
    { id: 'hero', label: 'Design & Copy', icon: 'fa-palette' },
    { id: 'traffic', label: 'Traffic Live', icon: 'fa-bolt' },
    { id: 'settings', label: 'Security', icon: 'fa-cog' }
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans transition-colors duration-300">
      <header className="bg-white border-b border-zinc-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center bg-zinc-100 rounded-lg text-zinc-600 hover:bg-zinc-200"
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg md:text-2xl font-bold tracking-tighter text-black flex items-center gap-2">
              NOVARI <span className="hidden sm:inline-block text-[10px] bg-gold/20 px-2 py-1 rounded text-gold-700 font-sans tracking-widest uppercase font-black">Admin Panel</span>
            </h1>
            {dbSynced && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-green-600">Live Cloud Sync</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onLogout} className="px-2 md:px-4 py-2 text-[10px] md:text-xs text-red-500 hover:text-red-700 transition-colors font-bold uppercase tracking-widest">Logout</button>
          <div className="hidden sm:block w-[1px] h-6 bg-zinc-200"></div>
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">Cancel</button>
          <button onClick={() => { onSave(formData); onClose(); }} className="px-4 md:px-6 py-2 bg-black text-white rounded-lg text-xs md:text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all">Save Config</button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 gap-0 md:gap-8 overflow-hidden relative">
        {/* Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[80] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white md:bg-transparent z-[90] p-6 md:p-0 border-r md:border-r-0 border-zinc-200 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-64 md:shrink-0 md:block
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-black text-white shadow-xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-200'}`}
              >
                <i className={`fa-solid ${tab.icon} w-5`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white border border-zinc-200 rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-8 overflow-y-auto h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] w-full">
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b pb-6 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Leads & Sales CRM</h2>
                  <p className="text-sm text-zinc-400">Monthly grouped potential customers and orders</p>
                </div>
                <div className="bg-gold/10 px-4 py-2 rounded-xl border border-gold/20 self-start sm:self-auto">
                  <p className="text-[10px] font-black text-gold uppercase tracking-widest">Total Active Leads</p>
                  <p className="text-xl font-bold text-black">{leads.length}</p>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="py-12 md:py-20 text-center bg-zinc-50 rounded-3xl border border-dashed">
                  <i className="fa-solid fa-inbox text-4xl text-zinc-200 mb-4"></i>
                  <p className="text-zinc-500 text-sm">No leads captured yet. Your store is live and ready!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedMonthKeys.map((month) => (
                    <div key={month} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-zinc-100"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                          {month}
                        </h3>
                        <div className="h-[1px] flex-1 bg-zinc-100"></div>
                      </div>
                      
                      <div className="overflow-x-auto border rounded-2xl shadow-sm">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                          <thead className="bg-zinc-50 border-b">
                            <tr>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Name</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Email</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Phone</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Address</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Order</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Status</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {groupedLeads[month].map((lead) => (
                              <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-sm text-black">{lead.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-[10px] text-zinc-600 font-medium break-all">{lead.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-zinc-900 font-semibold">{lead.phone}</p>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <p className="text-[10px] text-zinc-700 leading-tight">{lead.address}</p>
                                  <p className="text-[8px] text-zinc-400 uppercase font-bold mt-1">{lead.location?.city || 'Nigeria'}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-zinc-900">x{lead.quantity}</p>
                                  <p className="text-[10px] text-zinc-400 italic">ID: {lead.id}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <select 
                                    value={lead.status} 
                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                    className="text-[10px] font-black uppercase px-2 py-1 rounded-full border border-zinc-200 outline-none bg-white text-black focus:ring-1 ring-gold cursor-pointer"
                                  >
                                    <option value="New" className="text-black">New</option>
                                    <option value="Contacted" className="text-black">Contacted</option>
                                    <option value="Shipped" className="text-black">Shipped</option>
                                    <option value="Cancelled" className="text-black">Cancelled</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button onClick={() => generateFollowUp(lead, 'WhatsApp')} title="AI Follow-up" className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><i className="fa-brands fa-whatsapp"></i></button>
                                    <button onClick={() => deleteLead(lead.id)} title="Delete Lead" className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {aiResponse && (
                <div className="mt-8 p-4 md:p-6 bg-zinc-900 text-white rounded-2xl md:rounded-3xl border-2 border-gold/30 relative animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-gold text-[10px] font-black uppercase tracking-widest mb-4">AI Sales Draft</h3>
                  <div className="text-xs md:text-sm font-mono whitespace-pre-wrap text-zinc-300">{aiResponse}</div>
                  <button onClick={() => setAiResponse('')} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content_editor' && (
            <div className="space-y-8 md:space-y-12 pb-10">
              <div className="border-b pb-6">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Content & Media Editor</h2>
                <p className="text-sm text-zinc-400">Manage all visual assets and page sections in one place.</p>
              </div>

              {/* Store Identity & Contact */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-store text-gold"></i>
                  <h3 className="text-lg font-bold uppercase tracking-widest">Store Identity & Contact</h3>
                </div>
                <div className="bg-zinc-50 border p-4 md:p-6 rounded-2xl md:rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Primary Product Name</label>
                      <input 
                        value={formData.pricing.productName} 
                        onChange={(e) => handlePricingChange('productName', e.target.value)}
                        placeholder="e.g. Novari Elite Gen 3"
                        className="w-full bg-white border border-zinc-200 p-4 rounded-xl font-bold focus:ring-2 ring-gold outline-none transition-all"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Sales WhatsApp Number</label>
                      <input 
                        value={formData.pricing.whatsappNumber} 
                        onChange={(e) => handlePricingChange('whatsappNumber', e.target.value)}
                        placeholder="e.g. 2348000000000"
                        className="w-full bg-white border border-zinc-200 p-4 rounded-xl font-bold focus:ring-2 ring-gold outline-none transition-all"
                      />
                   </div>
                </div>
              </section>

              {/* Media Section */}
              <section className="space-y-6 pt-8 border-t">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-images text-gold"></i>
                  <h3 className="text-lg font-bold uppercase tracking-widest">Media Assets</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Hero / Main Showcase', field: 'mainImage' },
                    { label: 'Side Profile 1', field: 'sideImage1' },
                    { label: 'Side Profile 2', field: 'sideImage2' },
                    { label: 'Product Video (MP4)', field: 'productVideo' }
                  ].map((item) => (
                    <div key={item.field} className="group bg-zinc-50 border border-zinc-200 rounded-2xl p-4 relative">
                      <label className="block text-[9px] font-black uppercase text-zinc-400 mb-3 tracking-widest">{item.label}</label>
                      <div className="aspect-square bg-zinc-200 rounded-xl overflow-hidden border border-zinc-300 relative">
                        {formData.media[item.field] ? (
                          item.field === 'productVideo' ? (
                            <video src={formData.media[item.field]} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={formData.media[item.field]} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                            <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                            <span className="text-[9px] font-bold">No file</span>
                          </div>
                        )}
                        {isUploading === item.field && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold uppercase">Uploading...</div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <label className="flex-1 bg-black text-white text-center py-2 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-zinc-800 transition-all">
                          Change
                          <input type="file" accept={item.field === 'productVideo' ? "video/*" : "image/*"} className="hidden" onChange={(e) => handleMediaUpload(e, item.field)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Product Features / Specs */}
              <section className="space-y-6 pt-8 border-t">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-screwdriver-wrench text-gold"></i>
                    <h3 className="text-lg font-bold uppercase tracking-widest">Technical Features</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('products', { icon: 'fa-gem', label: 'New Feature', value: 'Spec Detail' })}
                    className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-start"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {formData.products.map((spec: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 border p-4 md:p-5 rounded-2xl md:rounded-3xl relative group flex flex-col sm:flex-row items-start gap-4">
                      <button onClick={() => removeListItem('products', idx)} className="absolute top-3 right-3 text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"><i className="fa-solid fa-circle-xmark"></i></button>
                      <div className="p-4 bg-white border border-zinc-200 rounded-xl text-gold flex items-center justify-center w-14 h-14 shrink-0 shadow-sm">
                        <i className={`fa-solid ${spec.icon} text-xl`}></i>
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black uppercase text-zinc-400 mb-1">Icon Class</label>
                            <input 
                              value={spec.icon} 
                              onChange={(e) => updateListItem('products', idx, 'icon', e.target.value)}
                              placeholder="fa-water"
                              className="w-full text-[10px] font-mono bg-white border border-zinc-200 px-2 py-1 rounded outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase text-zinc-400 mb-1">Label</label>
                            <input 
                              value={spec.label} 
                              onChange={(e) => updateListItem('products', idx, 'label', e.target.value)}
                              placeholder="Water Resistant"
                              className="w-full text-[10px] bg-white border border-zinc-200 px-2 py-1 rounded font-bold outline-none focus:border-gold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-zinc-400 mb-1">Value / Sub-detail</label>
                          <input 
                            value={spec.value} 
                            onChange={(e) => updateListItem('products', idx, 'value', e.target.value)}
                            placeholder="30M Depth"
                            className="w-full text-[10px] bg-white border border-zinc-200 px-2 py-1 rounded outline-none focus:border-gold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Benefits Editor */}
              <section className="space-y-6 pt-8 border-t">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-award text-gold"></i>
                    <h3 className="text-lg font-bold uppercase tracking-widest">Product Benefits</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('benefits', { title: 'New Benefit', desc: 'Detailed description...', img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000' })}
                    className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-start"
                  >
                    + Add Benefit
                  </button>
                </div>
                <div className="grid gap-4">
                  {formData.benefits.map((benefit: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 border p-4 md:p-6 rounded-2xl md:rounded-3xl relative group">
                      <button onClick={() => removeListItem('benefits', idx)} className="absolute top-4 right-4 text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"><i className="fa-solid fa-circle-xmark"></i></button>
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        <div className="w-full sm:w-24 h-24 bg-zinc-200 rounded-xl overflow-hidden shrink-0">
                          <img src={benefit.img} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <input 
                            value={benefit.title} 
                            onChange={(e) => updateListItem('benefits', idx, 'title', e.target.value)}
                            placeholder="Benefit Title"
                            className="w-full font-bold bg-transparent border-b border-zinc-200 pb-1 outline-none focus:border-gold"
                          />
                          <textarea 
                            value={benefit.desc} 
                            onChange={(e) => updateListItem('benefits', idx, 'desc', e.target.value)}
                            placeholder="Description"
                            className="w-full text-xs text-zinc-500 bg-transparent outline-none h-16 resize-none"
                          />
                          <input 
                            value={benefit.img} 
                            onChange={(e) => updateListItem('benefits', idx, 'img', e.target.value)}
                            placeholder="Image URL"
                            className="w-full text-[10px] text-zinc-400 bg-transparent outline-none italic"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Editor */}
              <section className="space-y-6 pt-8 border-t">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-circle-question text-gold"></i>
                    <h3 className="text-lg font-bold uppercase tracking-widest">FAQ Items</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('faqs', { q: 'New Question?', a: 'Detailed answer text.' })}
                    className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-start"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 border p-4 md:p-6 rounded-2xl relative group">
                      <button onClick={() => removeListItem('faqs', idx)} className="absolute top-4 right-4 text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"><i className="fa-solid fa-circle-xmark"></i></button>
                      <div className="space-y-3">
                        <input 
                          value={faq.q} 
                          onChange={(e) => updateListItem('faqs', idx, 'q', e.target.value)}
                          placeholder="Question"
                          className="w-full font-bold bg-transparent outline-none focus:text-gold"
                        />
                        <textarea 
                          value={faq.a} 
                          onChange={(e) => updateListItem('faqs', idx, 'a', e.target.value)}
                          placeholder="Answer"
                          className="w-full text-sm text-zinc-500 bg-transparent outline-none min-h-[60px] resize-none border-t border-zinc-100 pt-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b pb-6 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Ad Pixels & Tracking</h2>
                  <p className="text-sm text-zinc-400">Configure your Facebook and TikTok marketing pixels.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-zinc-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl">
                      <i className="fa-brands fa-facebook-f"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">Facebook Pixel</h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Meta Ads Tracking</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Pixel ID</label>
                      <input 
                        name="fbPixelId" 
                        value={formData.marketing.fbPixelId} 
                        onChange={handleMarketingChange}
                        placeholder="e.g. 1234567890" 
                        className="w-full border p-4 rounded-xl focus:ring-2 ring-blue-600 outline-none transition-all" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">This ID will be used to track page views and purchase conversions on Facebook.</p>
                  </div>
                </div>

                <div className="bg-zinc-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl">
                      <i className="fa-brands fa-tiktok"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">TikTok Pixel</h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">TikTok Ads Tracking</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Pixel ID</label>
                      <input 
                        name="ttPixelId" 
                        value={formData.marketing.ttPixelId} 
                        onChange={handleMarketingChange}
                        placeholder="e.g. C1234567890" 
                        className="w-full border p-4 rounded-xl focus:ring-2 ring-zinc-900 outline-none transition-all" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">This ID will be used to track page views and purchase conversions on TikTok.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-8">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Automation Settings</h2>
              <div className="bg-zinc-50 p-6 rounded-2xl md:rounded-3xl border border-zinc-200 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-solid fa-bolt-lightning text-gold"></i>
                  <h3 className="font-bold">Zapier / Webhook Integration</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Webhook Endpoint URL</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        name="crmWebhookUrl" 
                        value={formData.settings.crmWebhookUrl} 
                        onChange={handleSettingsChange} 
                        placeholder="https://hooks.zapier.com/..." 
                        className="flex-1 border p-3 rounded-xl focus:ring-2 ring-black outline-none bg-white font-mono text-xs" 
                      />
                      <button 
                        onClick={testWebhook}
                        disabled={isTestingWebhook}
                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isTestingWebhook ? (
                          <><i className="fa-solid fa-circle-notch animate-spin"></i> Testing...</>
                        ) : (
                          <><i className="fa-solid fa-paper-plane"></i> Test Connection</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-circle-info"></i> How it works
                    </p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                      Every time a lead is captured, Novari will send a POST request with the lead details (JSON format) to this URL. Perfect for syncing with Zapier, Make, or custom backends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Design & Main Copy</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Sale Price (₦)</label>
                    <input type="number" value={formData.pricing.currentPrice} onChange={(e) => handlePricingChange('currentPrice', Number(e.target.value))} className="w-full border p-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Stock Level</label>
                    <input type="number" value={formData.pricing.stockCount} onChange={(e) => handlePricingChange('stockCount', Number(e.target.value))} className="w-full border p-3 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Main Headline</label>
                  <input name="headline" value={formData.hero.headline} onChange={handleHeroChange} className="w-full border p-3 rounded-xl font-bold outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Description</label>
                  <textarea name="description" value={formData.hero.description} onChange={handleHeroChange} className="w-full border p-3 rounded-xl h-32 outline-none focus:border-gold" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4 uppercase tracking-tighter">Live Session Tracking</h2>
              <div className="bg-zinc-900 text-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-800 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fa-solid fa-earth-africa text-6xl md:text-8xl"></i></div>
                 {userLocation ? (
                   <div className="relative z-10 space-y-4">
                     <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Visitor Region</p>
                     <p className="text-2xl md:text-4xl font-serif gold-text">{userLocation.city}, {userLocation.country}</p>
                     <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between text-[10px] uppercase font-bold text-zinc-500 gap-2">
                       <span>IP: {userLocation.ip}</span>
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active</span>
                     </div>
                   </div>
                 ) : <p className="text-zinc-500">Locating visitor...</p>}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4 uppercase tracking-tighter">Security</h2>
              <div className="max-w-md">
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">New Admin Password</label>
                <input type="password" name="adminPassword" value={formData.settings.adminPassword} onChange={handleSettingsChange} className="w-full border p-3 rounded-xl outline-none focus:border-gold" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
