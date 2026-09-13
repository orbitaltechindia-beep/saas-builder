'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { LayoutGrid, Globe, LogOut, Plus, Settings, Eye, Pause, Play, Trash2 } from 'lucide-react';

interface ClientSite {
  id: string;
  name: string;
  template: string;
  status: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [domainRequest, setDomainRequest] = useState('');
  const [domainTab, setDomainTab] = useState<'free' | 'branded'>('free');
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push('/login'); return; }
      setUser(firebaseUser);

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCurrentDomain(data.customDomain || null);
        setDomainStatus(data.domainStatus || null);
        setDomainRequest(data.customDomainRequest || '');
      }
      
      const saved = localStorage.getItem(`saas_sites_${firebaseUser.uid}`);
      if (saved) setSites(JSON.parse(saved));
    });
    return () => unsub();
  }, [router]);

    const handleSelectTemplate = async (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const newSiteId = `site-${Date.now()}`;
    // Removed the strict type cast 'as 'live' | 'paused''
    const newSite = { id: newSiteId, name: `${template.name} Site`, template: templateId, status: 'live' };
    const updatedSites = [...sites, newSite];
    setSites(updatedSites);
    localStorage.setItem(`saas_sites_${user.uid}`, JSON.stringify(updatedSites));
    await updateDoc(doc(db, 'users', user.uid), { activeSiteId: newSiteId });
    setShowTemplateModal(false);
    router.push(`/editor/${newSiteId}/page-home?template=${templateId}`);
  };

   const handleDomainRequest = async () => {
    if (!domainRequest || !user) return;
    
    // Clean the input based on the selected tab
    let finalDomain = domainRequest.trim();
    if (domainTab === 'free') {
      // Remove all spaces for the free domain slug
      finalDomain = finalDomain.replace(/\s+/g, '');
      finalDomain = `${finalDomain}.vercel.app`;
    } else {
      // Branded domain: just remove spaces
      finalDomain = finalDomain.replace(/\s+/g, '');
    }

    // Save the cleaned domain to Firestore
    await updateDoc(doc(db, 'users', user.uid), { customDomainRequest: finalDomain, domainStatus: 'pending' });
    setDomainStatus('pending');
    alert(`Domain request sent for ${finalDomain}!`);
  };

  const handlePauseResume = async (siteId: string) => {
    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        const newStatus = s.status === 'live' ? 'paused' : 'live';
        // Update Firestore status
        updateDoc(doc(db, 'sites', siteId), { status: newStatus });
        return { ...s, status: newStatus };
      }
      return s;
    });
    setSites(updatedSites);
    localStorage.setItem(`saas_sites_${user.uid}`, JSON.stringify(updatedSites));
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm("Are you sure you want to permanently delete this website?")) return;
    
    const updatedSites = sites.filter(s => s.id !== siteId);
    setSites(updatedSites);
    localStorage.setItem(`saas_sites_${user.uid}`, JSON.stringify(updatedSites));
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'sites', siteId));
    alert("Website deleted successfully.");
  };

  const handleViewLive = (siteId: string) => {
    // If client has an active custom domain, open that. Otherwise, open the default view route.
    if (currentDomain) {
      window.open(`https://${currentDomain}`, '_blank');
    } else {
      window.open(`/view/${siteId}`, '_blank');
    }
  };

  if (!user) return <div className="h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-neutral-900 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-8">Orbital Builder</h1>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-2 text-sm text-white bg-neutral-900 p-2 rounded-md px-3 py-2">
              <LayoutGrid size={16} /> Dashboard
            </button>
            <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white p-2 rounded-md px-3 py-2">
              <Globe size={16} /> Domains
            </button>
            <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white p-2 rounded-md px-3 py-2">
              <Settings size={16} /> Settings
            </button>
          </nav>
        </div>
        <button onClick={() => { signOut(auth); router.push('/login'); }} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-500">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Websites</h2>
            <p className="text-neutral-500 mt-1 text-sm">Welcome back, {user.email}</p>
          </div>
          <button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus size={16} /> New Website
          </button>
        </div>

        {/* Domain Card */}
                {/* Setup Domain Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-12 max-w-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe size={18} /> Setup Domain</h3>
          
          {/* Tabs */}
          <div className="flex border-b border-neutral-800 mb-6">
            <button 
              onClick={() => { setDomainTab('free'); setDomainRequest(''); }} 
              className={`pb-3 px-4 text-sm font-medium transition-colors ${domainTab === 'free' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}
            >
              Free Domain
            </button>
            <button 
              onClick={() => { setDomainTab('branded'); setDomainRequest(''); }} 
              className={`pb-3 px-4 text-sm font-medium transition-colors ${domainTab === 'branded' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}
            >
              Branded Domain
            </button>
          </div>

          {currentDomain ? (
            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-sm bg-green-500/10 text-green-400 px-3 py-1.5 rounded-md border border-green-500/20">{currentDomain}</span>
              <span className="text-green-400 text-xs flex items-center gap-1"><span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> Live</span>
            </div>
          ) : domainStatus === 'pending' ? (
            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-sm bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-md border border-yellow-500/20">{domainRequest}</span>
              <span className="text-yellow-400 text-xs flex items-center gap-1"><span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span> Pending Approval</span>
            </div>
          ) : (
            <div className="mt-3">
              {domainTab === 'free' ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={domainRequest} 
                    onChange={(e) => setDomainRequest(e.target.value.replace(/\s+/g, ''))} 
                    placeholder="yourname" 
                    className="flex-1 bg-neutral-800 text-sm border border-neutral-700 p-2 rounded-l-md outline-none focus:border-blue-500"
                  />
                  <span className="bg-neutral-700 text-neutral-400 text-sm p-2 rounded-r-md border border-neutral-700">.vercel.app</span>
                  <button onClick={handleDomainRequest} className="bg-white text-black text-sm px-4 py-2 rounded-md font-medium hover:bg-neutral-200 ml-2">Request</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={domainRequest} 
                    onChange={(e) => setDomainRequest(e.target.value)} 
                    placeholder="www.yourdomain.com" 
                    className="flex-1 bg-neutral-800 text-sm border border-neutral-700 p-2 rounded-md outline-none focus:border-blue-500"
                  />
                  <button onClick={handleDomainRequest} className="bg-white text-black text-sm px-4 py-2 rounded-md font-medium hover:bg-neutral-200 ml-2">Request</button>
                </div>
              )}
              <p className="text-neutral-600 text-xs mt-3">
                {domainTab === 'free' ? 'Get a free subdomain instantly. No DNS setup required.' : 'Connect a domain you already own. Requires DNS setup.'}
              </p>
            </div>
          )}
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sites.length === 0 ? (
            <div className="col-span-full text-center py-20 text-neutral-600 border-2 border-dashed border-neutral-800 rounded-lg">
              No websites yet. Click "New Website" to get started.
            </div>
          ) : (
            sites.map(site => (
              <div key={site.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group transition-all">
                <div className="h-32 bg-neutral-800 relative">
                  {site.status === 'paused' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-yellow-400 text-sm font-medium">
                      <Pause size={16} className="mr-1" /> Paused
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">{site.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1 mb-4">ID: {site.id}</p>
                  
                  <div className="flex gap-2 border-t border-neutral-800 pt-3">
                    <button 
                      onClick={() => handleViewLive(site.id)} 
                      className="flex-1 bg-neutral-800 text-white text-xs px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-neutral-700"
                      title="View Live Site"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button 
                      onClick={() => router.push(`/editor/${site.id}/page-home?template=${site.template}`)} 
                      className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-blue-700"
                      title="Edit Site"
                    >
                      <Settings size={14} /> Edit
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handlePauseResume(site.id)} 
                      className="flex-1 bg-neutral-800 text-neutral-300 text-xs px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-neutral-700"
                    >
                      {site.status === 'live' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                    </button>
                    <button 
                      onClick={() => handleDelete(site.id)} 
                      className="flex-1 bg-red-900/30 text-red-400 text-xs px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-red-900/50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Choose a Premium Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-neutral-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEMPLATES.map(template => (
                <div key={template.id} onClick={() => handleSelectTemplate(template.id)} className="border border-neutral-800 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-all group">
                  <div className={`h-40 ${template.thumbnail} group-hover:scale-105 transition-transform`}></div>
                  <div className="p-4">
                    <h4 className="font-bold text-white">{template.name}</h4>
                    <p className="text-sm text-neutral-500 mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}