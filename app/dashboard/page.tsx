'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates';
import { useRouter } from 'next/navigation';

// Define the Site object structure
interface ClientSite {
  id: string;
  name: string;
  template: string;
  isPrimary: boolean; // Is this the active site assigned to the domain?
  domain: string;     // The assigned domain
}

export default function ClientDashboard() {
  const router = useRouter();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const clientDomain = "dreams.yoursaasdomain.com"; // Default subdomain for this client

  // Load sites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saas_sites');
    if (saved) setSites(JSON.parse(saved));
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newSiteId = `site-${Date.now()}`;
    const newSite: ClientSite = {
      id: newSiteId,
      name: `${template.name} Design`,
      template: templateId,
      isPrimary: sites.length === 0 ? true : false, // First site created becomes primary by default
      domain: sites.length === 0 ? clientDomain : "Not Assigned"
    };
    
    const updatedSites = [...sites, newSite];
    setSites(updatedSites);
    localStorage.setItem('saas_sites', JSON.stringify(updatedSites));
    setShowTemplateModal(false);

    router.push(`/editor/${newSiteId}/page-home?template=${templateId}`);
  };

  const setPrimarySite = (id: string) => {
    // Mark one site as active, assign domain, unassign others
    const updatedSites = sites.map(site => ({
      ...site,
      isPrimary: site.id === id,
      domain: site.id === id ? clientDomain : "Not Assigned"
    }));
    setSites(updatedSites);
    localStorage.setItem('saas_sites', JSON.stringify(updatedSites));
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Websites</h1>
            <p className="text-neutral-500 mt-1">Active Domain: <span className="font-mono text-blue-600">{clientDomain}</span></p>
          </div>
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
              <div key={site.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all ${site.isPrimary ? 'border-blue-500 border-2 shadow-lg' : 'border-neutral-200 hover:shadow-md'}`}>
                <div className={`h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center`}>
                  {site.isPrimary && (
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase Tracking-wide">Active</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900">{site.name}</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Status: <span className={site.isPrimary ? 'text-green-600 font-medium' : 'text-neutral-400'}>{site.domain}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/editor/${site.id}/page-home?template=${site.template}`)}
                      className="flex-1 bg-neutral-900 text-white text-sm px-3 py-2 rounded hover:bg-neutral-800"
                    >
                      Edit
                    </button>
                    {!site.isPrimary && (
                      <button 
                        onClick={() => setPrimarySite(site.id)}
                        className="flex-1 border border-neutral-300 text-neutral-700 text-sm px-3 py-2 rounded hover:bg-neutral-100"
                      >
                        Set Live
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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