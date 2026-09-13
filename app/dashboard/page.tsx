'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface ClientSite {
  id: string;
  name: string;
  template: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [domainRequest, setDomainRequest] = useState('');
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<string | null>(null);

  // Auth Listener & Load User Data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }
      setUser(firebaseUser);

      // Load user's domain request status
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCurrentDomain(data.customDomain || null);
        setDomainStatus(data.domainStatus || null);
        setDomainRequest(data.customDomainRequest || '');
      }

      // Load sites (still using localStorage for now, but tied to user UID)
      const saved = localStorage.getItem(`saas_sites_${firebaseUser.uid}`);
      if (saved) setSites(JSON.parse(saved));
    });
    return () => unsub();
  }, [router]);

  const handleSelectTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newSiteId = `site-${Date.now()}`;
    const newSite = { id: newSiteId, name: `${template.name} Site`, template: templateId };
    const updatedSites = [...sites, newSite];
    
    setSites(updatedSites);
    localStorage.setItem(`saas_sites_${user.uid}`, JSON.stringify(updatedSites));
    setShowTemplateModal(false);

    router.push(`/editor/${newSiteId}/page-home?template=${templateId}`);
  };

  const handleDomainRequest = async () => {
    if (!domainRequest || !user) return;
    // Save the domain request to Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      customDomainRequest: domainRequest,
      domainStatus: 'pending'
    });
    setDomainStatus('pending');
    alert('Domain request sent! The Superadmin will review it shortly.');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) return <div className="h-screen bg-neutral-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Websites</h1>
            <p className="text-neutral-500 mt-1">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/superadmin')} className="text-neutral-500 hover:text-neutral-900 text-sm hidden md:block">
              Superadmin Panel
            </button>
            <button onClick={handleLogout} className="text-neutral-500 hover:text-red-600 text-sm">
              Sign Out
            </button>
          </div>
        </div>

        {/* Domain Request Card */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Custom Domain</h2>
          {currentDomain ? (
            <div className="flex items-center gap-3 mt-4">
              <span className="font-mono text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-md border border-green-200">
                {currentDomain}
              </span>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> Live
              </span>
            </div>
          ) : domainStatus === 'pending' ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-sm bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-md border border-yellow-200">
                {domainRequest}
              </span>
              <span className="text-yellow-600 text-sm font-medium flex items-center gap-1">
                <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span> Awaiting Superadmin Approval
              </span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <input 
                type="text" 
                value={domainRequest} 
                onChange={(e) => setDomainRequest(e.target.value)} 
                placeholder="www.yourdomain.com" 
                className="flex-1 border border-neutral-300 p-3 rounded-lg outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleDomainRequest} 
                className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800"
              >
                Request Domain
              </button>
            </div>
          )}
        </div>

        {/* Sites Grid */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Your Designs</h2>
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            + New Website
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sites.length === 0 ? (
            <div className="col-span-full text-center py-20 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
              No websites yet. Click "New Website" to get started.
            </div>
          ) : (
            sites.map(site => (
              <div key={site.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/editor/${site.id}/page-home?template=${site.template}`)}>
                <div className="h-32 bg-gradient-to-br from-neutral-100 to-neutral-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900">{site.name}</h3>
                  <p className="text-sm text-neutral-500">Last edited: Just now</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Choose a Premium Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-neutral-400 hover:text-neutral-900 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEMPLATES.map(template => (
                <div 
                  key={template.id} 
                  onClick={() => handleSelectTemplate(template.id)}
                  className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className={`h-40 ${template.thumbnail} group-hover:scale-105 transition-transform`}></div>
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900">{template.name}</h3>
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