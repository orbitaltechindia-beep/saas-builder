'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase/client';
import { collection, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Globe, Check, X, Server, Cpu, Link2, ShieldCheck, Loader2, UserCheck, Mail, Power } from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
  approved?: boolean;
  active?: boolean;
  customDomainRequest?: string;
  customDomain?: string;
  domainStatus?: 'pending' | 'live';
  followupIncreaseRequest?: string | null;
}

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  course?: string;
  source: string;
  status: string;
}

export default function SuperadminPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [view, setView] = useState<'clients' | 'enquiries'>('clients');
  const [manualDomain, setManualDomain] = useState<{ userId: string, domain: string } | null>(null);

  // 1. Auth Guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push('/login'); return; }
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists() && userDoc.data()?.role === 'superadmin') {
        setIsSuperadmin(true);
        setLoading(false);
      } else {
        alert("Access Denied: You do not have Superadmin privileges.");
        router.push('/dashboard');
      }
    });
    return () => unsub();
  }, [router]);

  // 2. Fetch Data
  useEffect(() => {
    if (!isSuperadmin) return;
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientUser)));
    });
    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
      setEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry)));
    });
    return () => { unsubUsers(); unsubEnquiries(); };
  }, [isSuperadmin]);

  // 3. Approve User
  const approveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { approved: true, active: true });
    alert("User approved! They can now log in.");
  };

  // 4. Toggle User Activation (Pause/Unpause Website)
  const toggleUserActivation = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateDoc(doc(db, 'users', userId), { active: newStatus });
    
    // Rollback/Restore their active website
    const userDoc = await getDoc(doc(db, 'users', userId));
    const siteId = userDoc.data()?.activeSiteId;
    if (siteId) {
      await updateDoc(doc(db, 'sites', siteId), { status: newStatus ? 'live' : 'paused' });
    }
    alert(`Client ${newStatus ? 'activated' : 'deactivated'}. Their website is now ${newStatus ? 'live' : 'paused'}.`);
  };

  // 5. Approve More AI Edits
  const approveMoreEdits = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { aiFollowupLimit: 22, followupIncreaseRequest: null });
    alert("Increased edit limit by 10 for this client!");
  };

  // 6. Approve & Automate Domain
  const approveDomain = async (userId: string, domain: string) => {
    try {
      const vercelRes = await fetch('/api/setup-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const vercelData = await vercelRes.json();

      if (!vercelData.success) {
        alert("Vercel API failed to auto-provision. Please use 'Manual Map' below to provision it manually.");
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      const siteId = userDoc.data()?.activeSiteId;
      if (!siteId) { alert("Client hasn't created a website yet!"); return; }

      await updateDoc(doc(db, 'users', userId), { customDomain: domain, domainStatus: 'live' });
      await setDoc(doc(db, 'domains', domain), { siteId, ownerId: userId });
      alert(`Success! ${domain} was automatically added to Vercel.`);
    } catch (error) {
      console.error("Automation Error:", error);
      alert("An error occurred during automation. Try Manual Map.");
    }
  };

  // 7. Manual Domain Mapping (Fallback)
  const manualMapDomain = async () => {
    if (!manualDomain || !manualDomain.domain) return;
    const { userId, domain } = manualDomain;
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    const siteId = userDoc.data()?.activeSiteId;
    if (!siteId) { alert("Client hasn't created a website yet!"); return; }

    await updateDoc(doc(db, 'users', userId), { customDomain: domain, domainStatus: 'live' });
    await setDoc(doc(db, 'domains', domain), { siteId, ownerId: userId });
    
    alert(`Success! ${domain} was manually mapped in the database. Make sure you add it to Vercel manually.`);
    setManualDomain(null);
  };

  if (loading || !isSuperadmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-3" size={24} />
        Verifying Superadmin Access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-11 w-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Server size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Superadmin Control Center</h1>
            <p className="text-neutral-400 text-sm">Manage clients, provision domains, and view enquiries.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Cpu className="text-blue-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Clients</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <UserCheck className="text-yellow-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending Approvals</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin' && !u.approved).length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Link2 className="text-orange-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending Domains</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.customDomainRequest && !u.customDomain).length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Mail className="text-green-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Enquiries</p>
              <h2 className="text-2xl font-bold">{enquiries.length}</h2>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex gap-4 mb-8 border-b border-neutral-800">
          <button onClick={() => setView('clients')} className={`pb-3 px-4 text-sm font-medium transition-colors ${view === 'clients' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}>
            Client Provisioning
          </button>
          <button onClick={() => setView('enquiries')} className={`pb-3 px-4 text-sm font-medium transition-colors ${view === 'enquiries' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}>
            Enquiries ({enquiries.length})
          </button>
        </div>

        {/* Client Table */}
        {view === 'clients' && (
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-neutral-800"><h3 className="font-bold text-lg">Client Provisioning</h3></div>
            <table className="w-full text-left">
              <thead className="bg-neutral-800/50 border-b border-neutral-800">
                <tr>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Client Email</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Requested Domain</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Status</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                    <td className="p-5 font-medium text-white">
                      {user.email}
                      {user.role === 'superadmin' && <span className="ml-2 text-xs text-blue-400">(Admin)</span>}
                      {user.active === false && <span className="ml-2 text-xs text-red-400">(Deactivated)</span>}
                    </td>
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
                        <span className="text-green-400 text-xs font-medium flex items-center gap-1"><ShieldCheck size={14} /> Live</span>
                      ) : user.customDomainRequest ? (
                        <span className="text-yellow-400 text-xs font-medium flex items-center gap-1"><Link2 size={14} /> Pending</span>
                      ) : (
                        <span className="text-neutral-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-5 text-right space-y-2">
                      {!user.approved && user.role === 'admin' && (
                        <button onClick={() => approveUser(user.id)} className="bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 inline-flex items-center gap-1 w-full justify-center">
                          <UserCheck size={12} /> Approve User
                        </button>
                      )}
                      
                      {user.followupIncreaseRequest && (
                        <button onClick={() => approveMoreEdits(user.id)} className="bg-purple-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-purple-700 inline-flex items-center gap-1 w-full justify-center">
                          Approve More Edits
                        </button>
                      )}

                      {user.customDomainRequest && user.domainStatus !== 'live' && (
                        <button onClick={() => approveDomain(user.id, user.customDomainRequest!)} className="bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 inline-flex items-center gap-1 w-full justify-center">
                          <Check size={12} /> Auto-Provision Domain
                        </button>
                      )}

                      {/* Manual Domain Mapping UI */}
                      {manualDomain?.userId === user.id ? (
                        <div className="flex gap-1 mt-2">
                          <input 
                            type="text" 
                            value={manualDomain.domain} 
                            onChange={(e) => setManualDomain({ userId: user.id, domain: e.target.value })} 
                            className="flex-1 bg-neutral-800 text-white text-xs p-1 rounded outline-none border border-blue-500"
                          />
                          <button onClick={manualMapDomain} className="bg-green-600 text-white text-xs px-2 rounded">Map</button>
                        </div>
                      ) : (
                        user.role === 'admin' && (
                          <button onClick={() => setManualDomain({ userId: user.id, domain: user.customDomainRequest || '' })} className="bg-neutral-700 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-neutral-600 inline-flex items-center gap-1 w-full justify-center">
                            Manual Map Domain
                          </button>
                        )
                      )}

                      {user.role === 'admin' && user.approved && (
                        <button 
                          onClick={() => toggleUserActivation(user.id, user.active !== false)} 
                          className={`px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1 w-full justify-center ${user.active === false ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          <Power size={12} /> {user.active === false ? 'Activate Client' : 'Deactivate Client'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Enquiries Table */}
        {view === 'enquiries' && (
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-neutral-800"><h3 className="font-bold text-lg">Website Enquiries</h3></div>
            <table className="w-full text-left">
              <thead className="bg-neutral-800/50 border-b border-neutral-800">
                <tr>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Name</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Phone</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Course</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Source (Domain)</th>
                  <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-neutral-500">No enquiries yet.</td></tr>
                ) : (
                  enquiries.map(enq => (
                    <tr key={enq.id} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                      <td className="p-5 font-medium text-white">{enq.name}</td>
                      <td className="p-5 text-blue-400">{enq.phone}</td>
                      <td className="p-5 text-neutral-300">{enq.course || '-'}</td>
                      <td className="p-5 text-neutral-500 text-sm">{enq.source}</td>
                      <td className="p-5">
                        <span className={`text-xs px-2 py-1 rounded ${enq.status === 'New' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}