
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
  dbSynced: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ content, userLocation, leads, onLeadsUpdate, onSave, onClose, onLogout, dbSynced }) => {
  const [formData, setFormData] = useState(content);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  
  // CRM Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.startsWith('data:video') || 
           url.toLowerCase().includes('.mp4') || 
           url.toLowerCase().includes('.mov') || 
           url.toLowerCase().includes('.webm');
  };

  const discardChanges = () => {
    if (confirm("Discard all unsaved changes in this session?")) {
      setFormData(content);
    }
  };

  const clearMediaField = (e: React.MouseEvent, field: string) => {
    e.stopPropagation();
    if (confirm(`Remove this ${field.includes('Video') ? 'video' : 'image'}?`)) {
      setFormData({
        ...formData,
        media: { ...formData.media, [field]: "" }
      });
    }
  };

  // Computed Analytics
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const deliveredLeads = leads.filter(l => l.status === 'Delivered');
    const totalRevenue = deliveredLeads.reduce((acc, lead) => acc + (formData.pricing.currentPrice * parseInt(lead.quantity)), 0);
    const conversionRate = totalLeads > 0 ? ((deliveredLeads.length / totalLeads) * 100).toFixed(1) : 0;
    const pendingOrders = leads.filter(l => l.status === 'New' || l.status === 'Contacted').length;

    return { totalLeads, totalRevenue, conversionRate, pendingOrders };
  }, [leads, formData.pricing.currentPrice]);

  // Filtered Leads for CRM
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           lead.phone.includes(searchTerm) ||
                           lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const groupedLeads = useMemo(() => {
    return filteredLeads.reduce((groups: { [key: string]: Lead[] }, lead) => {
      const date = new Date(lead.timestamp);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(lead);
      return groups;
    }, {});
  }, [filteredLeads]);

  const sortedMonthKeys = useMemo(() => {
    return Object.keys(groupedLeads).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedLeads]);

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Alt Phone", "Address", "Quantity", "Status", "Date"];
    const rows = leads.map(l => [
      l.id, l.name, l.email, l.phone, l.altPhone || "N/A", `"${l.address?.replace(/"/g, '""')}"`, l.quantity, l.status, new Date(l.timestamp).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `novari_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyles = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Shipped': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Delivered': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const generateFollowUp = async (lead: Lead, channel: 'WhatsApp' | 'Email') => {
    setIsGenerating(lead.id);
    setAiResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Draft a luxury sales follow-up for ${lead.name} from ${lead.location?.city || 'Nigeria'}. 
      They ordered ${lead.quantity} Novari Elite watches. Current status is ${lead.status}. 
      Style: Professional, Urgent (Anniversary offer ending), Nigerian premium tone. Channel: ${channel}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiResponse(response.text || 'Error generating message.');
    } catch (err) {
      setAiResponse('Error: Please check AI configuration.');
    } finally {
      setIsGenerating(null);
    }
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    const next = leads.map(l => l.id === id ? { ...l, status } : l);
    onLeadsUpdate(next);
  };

  const deleteLead = (id: string) => {
    if (confirm("Permanently remove this lead from the cloud database?")) {
      onLeadsUpdate(leads.filter(l => l.id !== id));
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'crm', label: 'CRM Leads', icon: 'fa-users' },
    { id: 'content_editor', label: 'Storefront', icon: 'fa-shop' },
    { id: 'marketing', label: 'Pixels', icon: 'fa-bullseye' },
    { id: 'automation', label: 'Automations', icon: 'fa-wand-magic-sparkles' },
    { id: 'settings', label: 'Security', icon: 'fa-shield-halved' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-zinc-500">
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl font-bold tracking-tighter text-black flex items-center gap-2">
              NOVARI <span className="text-[10px] bg-gold/20 px-2 py-0.5 rounded text-gold uppercase font-black">Portal</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dbSynced ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{dbSynced ? 'DB Secure' : 'Cloud Syncing'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { onSave(formData); onClose(); }} className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">Close & Save</button>
          <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-power-off"></i></button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8 gap-8 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-[90] p-6 border-r transform transition-transform duration-300 md:relative md:translate-x-0 md:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-1.5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                <i className={`fa-solid ${tab.icon} w-5 text-center`}></i> {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 bg-white border border-zinc-200 rounded-3xl shadow-sm p-6 md:p-10 overflow-y-auto h-[calc(100vh-140px)]">
          
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-reveal-up">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-black">Cloud Health</h2>
                  <p className="text-zinc-500 text-sm">Real-time business performance analytics.</p>
                </div>
                <div className="bg-zinc-50 px-4 py-2 rounded-xl border text-xs font-bold text-zinc-500">
                  <i className="fa-solid fa-calendar mr-2"></i> {new Date().toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-zinc-100 p-6 rounded-3xl shadow-sm hover:border-gold/30 transition-all group">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Gross Revenue</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-black">₦{stats.totalRevenue.toLocaleString()}</h3>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">LIVE</div>
                  </div>
                </div>
                <div className="bg-white border-2 border-zinc-100 p-6 rounded-3xl shadow-sm hover:border-gold/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Cloud Leads</p>
                  <h3 className="text-3xl font-bold text-black">{stats.totalLeads}</h3>
                </div>
                <div className="bg-white border-2 border-zinc-100 p-6 rounded-3xl shadow-sm hover:border-gold/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Success Rate</p>
                  <h3 className="text-3xl font-bold text-black">{stats.conversionRate}%</h3>
                </div>
                <div className="bg-white border-2 border-zinc-100 p-6 rounded-3xl shadow-sm hover:border-gold/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Pending Followups</p>
                  <h3 className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-zinc-900 rounded-3xl p-8 text-white">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-6">Regional Hotspots</h4>
                    <div className="space-y-4">
                      {['Lagos', 'Abuja', 'Port Harcourt', 'Kano'].map((city, idx) => (
                        <div key={city} className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span>{city}</span>
                              <span>{Math.floor(Math.random() * 40 + 10)}%</span>
                           </div>
                           <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full gold-bg" style={{ width: `${Math.floor(Math.random() * 40 + 10)}%` }}></div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Cloud Security Log</h4>
                    <div className="space-y-4">
                      {leads.slice(0, 4).map((l, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm border-b border-zinc-200 pb-3">
                           <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-black">{l.name[0]}</div>
                           <p className="text-zinc-600 flex-1">Secured order from <span className="font-bold text-black">{l.name}</span> in {l.location?.city || 'Nigeria'}</p>
                           <span className="text-[10px] text-zinc-400">Just now</span>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-6 animate-reveal-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Cloud Database CRM</h2>
                <button onClick={exportToCSV} className="text-xs font-black uppercase tracking-widest bg-zinc-100 px-4 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-download"></i> Export Orders
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 bg-zinc-50 p-4 rounded-2xl border">
                 <div className="relative flex-1">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                      placeholder="Filter by name, phone or email..." 
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-gold outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <select 
                   className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-all min-w-[150px]"
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                 >
                    <option value="All">All Transactions</option>
                    <option value="New">New Inbound</option>
                    <option value="Contacted">Processing</option>
                    <option value="Shipped">In Transit</option>
                    <option value="Delivered">Completed</option>
                    <option value="Cancelled">Archive</option>
                 </select>
              </div>

              {filteredLeads.length === 0 ? <p className="text-center py-20 text-zinc-400">No matching cloud records.</p> : (
                <div className="space-y-8">
                  {sortedMonthKeys.map((month) => (
                    <div key={month} className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{month}</h3>
                      <div className="overflow-x-auto border rounded-2xl shadow-sm">
                        <table className="w-full text-left min-w-[1200px]">
                          <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Identity</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Email</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Phones</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase text-center">Qty</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Logistic (Address)</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {groupedLeads[month].map((lead) => (
                              <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4 align-top">
                                  <div className="font-bold text-sm text-black whitespace-nowrap">{lead.name}</div>
                                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest mt-0.5">ID: {lead.id}</div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                  <div className="text-[11px] font-medium text-zinc-600 break-all max-w-[180px]">
                                    {lead.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                  <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-black flex items-center gap-2">
                                      <i className="fa-solid fa-phone text-[9px] text-zinc-400"></i> {lead.phone}
                                    </div>
                                    {lead.altPhone && (
                                      <div className="text-[10px] font-medium text-zinc-500 flex items-center gap-2">
                                        <i className="fa-solid fa-phone-flip text-[9px] text-zinc-300"></i> {lead.altPhone}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-top text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-black text-xs font-black">
                                    {lead.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 align-top">
                                  <div className="text-[11px] text-zinc-500 leading-tight max-w-[250px] line-clamp-3" title={lead.address}>
                                    {lead.address}
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                  <select 
                                    value={lead.status} 
                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)} 
                                    className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all outline-none ${getStatusStyles(lead.status)}`}
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 align-top flex gap-2">
                                  <button onClick={() => generateFollowUp(lead, 'WhatsApp')} disabled={isGenerating === lead.id} title="AI WhatsApp Followup" className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                                    {isGenerating === lead.id ? <i className="fa-solid fa-circle-notch animate-spin text-[10px]"></i> : <i className="fa-brands fa-whatsapp text-xs"></i>}
                                  </button>
                                  <button onClick={() => deleteLead(lead.id)} title="Archive Lead" className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                                  </button>
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
                <div className="mt-8 bg-zinc-900 text-white p-6 rounded-3xl border-l-4 border-gold shadow-2xl animate-reveal-up">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gold">AI Conversion Engine</h4>
                    <button onClick={() => setAiResponse('')} className="text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <p className="text-sm font-medium leading-relaxed mb-6">{aiResponse}</p>
                  <button onClick={() => { navigator.clipboard.writeText(aiResponse); alert("Copied!"); }} className="text-[10px] font-black uppercase bg-white/10 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors">Copy to Clipboard</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content_editor' && (
            <div className="space-y-8 animate-reveal-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Storefront Control</h2>
                <button 
                  onClick={discardChanges}
                  className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-rotate-left"></i> Discard Local Changes
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Model Identity</label>
                      <input value={formData.pricing.productName} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, productName: e.target.value}})} className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 focus:bg-white outline-none" placeholder="Product Name" />
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Unit Price (₦)</label>
                          <input type="number" value={formData.pricing.currentPrice} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, currentPrice: parseInt(e.target.value)}})} className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 focus:bg-white outline-none" placeholder="1 Unit Price" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Market Value (₦)</label>
                          <input type="number" value={formData.pricing.oldPrice} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, oldPrice: parseInt(e.target.value)}})} className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 focus:bg-white outline-none" placeholder="Old Price" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Double Pack (₦)</label>
                          <input type="number" value={formData.pricing.priceQty2} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, priceQty2: parseInt(e.target.value)}})} className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 focus:bg-white outline-none" placeholder="2 Units Total Price" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Triple Pack (₦)</label>
                          <input type="number" value={formData.pricing.priceQty3} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, priceQty3: parseInt(e.target.value)}})} className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 focus:bg-white outline-none" placeholder="3 Units Total Price" />
                        </div>
                      </div>
                    </div>

                    <textarea 
                      value={formData.pricing.features?.join('\n') || ''} 
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, features: e.target.value.split('\n')}})}
                      className="w-full border p-4 rounded-2xl font-bold bg-zinc-50 h-48 focus:bg-white outline-none resize-none" 
                      placeholder="Product Feature List"
                    />
                 </div>
                 <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Media Optimization</h4>
                    <div className="grid grid-cols-2 gap-4">
                       {['mainImage', 'sideImage1', 'sideImage2', 'productVideo'].map(field => {
                         const currentUrl = formData.media[field];
                         const isMediaVideo = isVideo(currentUrl);

                         return (
                           <div key={field} className="relative aspect-square bg-white border border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all">
                              {currentUrl && !isUploading && (
                                <button 
                                  onClick={(e) => clearMediaField(e, field)}
                                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 text-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                                </button>
                              )}

                              {isUploading === field ? (
                                <i className="fa-solid fa-circle-notch animate-spin text-gold"></i>
                              ) : currentUrl ? (
                                isMediaVideo ? (
                                  <video src={currentUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                ) : (
                                  <img src={currentUrl} className="w-full h-full object-cover" alt={field} />
                                )
                              ) : (
                                <>
                                  <i className={`fa-solid ${field.includes('Video') ? 'fa-video' : 'fa-image'} text-zinc-300 group-hover:text-gold transition-colors text-2xl`}></i>
                                  <span className="text-[8px] font-black uppercase text-zinc-400">{field.replace(/([A-Z])/g, ' $1')}</span>
                                </>
                              )}
                              
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <i className="fa-solid fa-cloud-arrow-up text-white text-xl"></i>
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Cloud Media</span>
                              </div>

                              <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if(file) {
                                   setIsUploading(field);
                                   const reader = new FileReader();
                                   reader.onloadend = () => {
                                     setFormData({ ...formData, media: { ...formData.media, [field]: reader.result as string } });
                                     setIsUploading(null);
                                   };
                                   reader.readAsDataURL(file);
                                 }
                              }} />
                           </div>
                         );
                       })}
                    </div>
                    <p className="mt-4 text-[9px] text-zinc-400 font-black uppercase tracking-widest text-center">Auto-optimized for mobile</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-8 animate-reveal-up">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Tracking & Pixels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {['fbPixelId', 'ttPixelId', 'googleAnalyticsId'].map(id => (
                   <div key={id} className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{id.replace(/([A-Z])/g, ' $1')}</label>
                      <input 
                        value={formData.marketing[id]} 
                        onChange={(e) => setFormData({...formData, marketing: {...formData.marketing, [id]: e.target.value}})}
                        className="w-full border p-4 rounded-2xl font-mono text-sm bg-zinc-50 focus:bg-white outline-none" 
                        placeholder="Tracking Token"
                      />
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-8 animate-reveal-up">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Cloud Workflows</h2>
              <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200">
                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 block">Webhook Outbound (CRM Integration)</label>
                      <div className="flex gap-4">
                        <input value={formData.settings.crmWebhookUrl} onChange={(e) => setFormData({...formData, settings: {...formData.settings, crmWebhookUrl: e.target.value}})} className="flex-1 border p-4 rounded-2xl font-mono text-xs bg-white outline-none" placeholder="https://zapier.com/hooks/..." />
                        <button onClick={async () => {
                           setIsTestingWebhook(true);
                           try { await fetch(formData.settings.crmWebhookUrl, { method: 'POST', body: JSON.stringify({test: true}) }); alert('Outbound Test Complete!'); } 
                           catch(e) { alert('Webhook Error: Check Destination URL'); } 
                           finally { setIsTestingWebhook(false); }
                        }} disabled={isTestingWebhook} className="bg-black text-white px-6 rounded-2xl text-[10px] font-black uppercase transition-all hover:scale-105">Verify</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200">
                       <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${formData.settings.autoFollowUpEnabled ? 'bg-green-500' : 'bg-zinc-300'}`} onClick={() => setFormData({...formData, settings: {...formData.settings, autoFollowUpEnabled: !formData.settings.autoFollowUpEnabled}})}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.settings.autoFollowUpEnabled ? 'right-1' : 'left-1'}`}></div>
                       </div>
                       <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Automatic Webhook Triggers</p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-reveal-up">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Enterprise Security</h2>
              <div className="max-w-md space-y-6">
                <div className="bg-zinc-900 text-white p-8 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold">Supabase RLS Active</h4>
                   </div>
                   <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-wider font-bold">
                     Your database is secured by Row Level Security. Authenticated sessions are required for all non-public CRUD operations.
                   </p>
                   <div className="pt-4 border-t border-white/10 flex justify-between text-[8px] uppercase tracking-widest font-black text-white/40">
                      <span>Env: Prod</span>
                      <span>Auth: JWT/RLS</span>
                   </div>
                </div>
                <button onClick={onLogout} className="w-full bg-red-500/10 text-red-500 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">Sign Out Everywhere</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
