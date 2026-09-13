'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { Globe, Check, X, Server, Cpu, Link2, ShieldCheck } from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
  customDomainRequest?: string;
  customDomain?: string;
  domainStatus?: 'pending' | 'live';
}

export default function SuperadminPanel() {
  const [users, setUsers] = useState<ClientUser[]>([]);

  useEffect(() => {
    // Real-time listener for users collection
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientUser)));
    });
    return () => unsub();
  }, []);

     const approveDomain = async (userId: string, domain: string) => {
    try {
      // 1. Automatically add domain to Vercel
      const vercelRes = await fetch('/api/provision-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const vercelData = await vercelRes.json();

      if (!vercelData.success) {
        alert("Failed to provision on Vercel: " + vercelData.error);
        return;
      }

      // 2. Get the user's activeSiteId
      const userDoc = await getDoc(doc(db, 'users', userId));
      const siteId = userDoc.data()?.activeSiteId;

      if (!siteId) {
        alert("Client hasn't created a website yet! Vercel domain added, but no site mapped.");
        return;
      }

      // 3. Automatically update Firestore User & Domains collection
      await updateDoc(doc(db, 'users', userId), {
        customDomain: domain,
        domainStatus: 'live'
      });

      await setDoc(doc(db, 'domains', domain), {
        siteId: siteId,
        ownerId: userId
      });

      alert(`Success! ${domain} was automatically added to Vercel and mapped to the client's website.`);
      
    } catch (error) {
      console.error("Automation Error:", error);
      alert("An error occurred during automation.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-11 w-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Server size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Superadmin Control Center</h1>
            <p className="text-neutral-400 text-sm">Manage clients and provision custom domains.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Cpu className="text-blue-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Clients</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Link2 className="text-yellow-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending Domains</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.customDomainRequest && !u.customDomain).length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Live Domains</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.domainStatus === 'live').length}</h2>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800">
            <h3 className="font-bold text-lg">Client Provisioning</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Client Email</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Requested Domain</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Status</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                  <td className="p-5 font-medium text-white">{user.email}</td>
                  <td className="p-5">
                    {user.customDomainRequest ? (
                      <span className="font-mono text-sm bg-neutral-800 text-blue-400 px-3 py-1.5 rounded-md flex items-center gap-2 w-fit">
                        <Globe size={14} /> {user.customDomainRequest}
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-sm">No request</span>
                    )}
                  </td>
                  <td className="p-5">
                    {user.domainStatus === 'live' ? (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <ShieldCheck size={14} /> Live
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-xs font-medium flex items-center gap-1">
                        <Link2 size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {user.customDomainRequest && user.domainStatus !== 'live' ? (
                      <button 
                        onClick={() => approveDomain(user.id, user.customDomainRequest!)} 
                        className="bg-green-600 text-white px-4 py-2 text-xs rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors ml-auto"
                      >
                        <Check size={12} /> Approve & Provision
                      </button>
                    ) : (
                      <span className="text-neutral-600 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}