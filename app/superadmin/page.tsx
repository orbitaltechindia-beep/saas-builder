'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase/client';
import { collection, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  Globe, Check, X, Server, Cpu, Link2, ShieldCheck, Loader2, 
  UserCheck, Mail, Power, Sparkles, Ban 
} from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
  approved?: boolean;
  active?: boolean;
  customDomainRequest?: string;
  customDomain?: string;
  domainStatus?: 'pending' | 'live' | 'failed';
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

interface ManualDomainState {
  userId: string;
  email: string;
  domain: string;
}

export default function SuperadminPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [view, setView] = useState<'clients' | 'enquiries'>('clients');
  const [manualDomain, setManualDomain] = useState<ManualDomainState | null>(null);

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

  // 3. Actions
  const approveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { approved: true, active: true });
  };

  const toggleUserActivation = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateDoc(doc(db, 'users', userId), { active: newStatus });
    const userDoc = await getDoc(doc(db, 'users', userId));
    const siteId = userDoc.data()?.activeSiteId;
    if (siteId) await updateDoc(doc(db, 'sites', siteId), { status: newStatus ? 'live' : 'paused' });
  };

  const approveMoreEdits = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { aiFollowupLimit: 22, followupIncreaseRequest: null });
    alert("Increased edit limit by 10 for this client!");
  };

  const rejectDomain = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { customDomainRequest: null, domainStatus: 'failed' });
    alert("Domain rejected. Client can now request a new one.");
  };

  const approveDomain = async (userId: string, domain: string) => {
    try {
      const vercelRes = await fetch('/api/setup-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const vercelData = await vercelRes.json();

      if (!vercelData.success) {
        alert("Vercel API failed: " + vercelData.error + "\n\nPlease use Manual Map instead.");
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      const siteId = userDoc.data()?.activeSiteId;
      if (!siteId) { alert("Client hasn't created a website yet!"); return; }

      await updateDoc(doc(db, 'users', userId), { customDomain: domain, domainStatus: 'live' });
      await setDoc(doc(db, 'domains', domain), { siteId, ownerId: userId });
      alert(`Success! ${domain} was automatically added to Vercel.`);
    } catch (error) {
      alert("An error occurred. Try Manual Map.");
    }
  };

  const manualMapDomain = async () => {
    if (!manualDomain || !manualDomain.domain) return;
    const { userId, domain } = manualDomain;
    const userDoc = await getDoc(doc(db, 'users', userId));
    const siteId = userDoc.data()?.activeSiteId;
    if (!siteId) { alert("Client hasn't created a website yet!"); return; }

    await updateDoc(doc(db, 'users', userId), { customDomain: domain, domainStatus: 'live' });
    await setDoc(doc(db, 'domains', domain), { siteId, ownerId: userId });
    alert(`Success! ${domain} was manually mapped.`);
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Server size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Control Center</h1>
              <p className="text-neutral-400 text-sm">Manage clients, provision domains, and view enquiries.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg"><Cpu className="text-blue-500" size={20} /></div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Clients</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg"><UserCheck className="text-yellow-500" size={20} /></div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending Approvals</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin' && !u.approved).length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg"><Link2 className="text-orange-500" size={20} /></div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending Domains</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.customDomainRequest && u.domainStatus !== 'live').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg"><Mail className="text-green-500" size={20} /></div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Enquiries</p>
              <h2 className="text-2xl font-bold">{enquiries.length}</h2>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex gap-1 mb-6 bg-neutral-900 p-1 rounded-lg w-fit border border-neutral-800">
          <button 
            onClick={() => setView('clients')} 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${view === 'clients' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Client Provisioning
          </button>
          <button 
            onClick={() => setView('enquiries')} 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${view === 'enquiries' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Enquiries ({enquiries.length})
          </button>
        </div>

        {/* Clients Table */}
        {view === 'clients' && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-950/50 border-b border-neutral-800">
                  <tr>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Client</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Requested Domain</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                      <td className="p-5 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{user.email}</span>
                          <div className="flex gap-2 mt-1">
                            {user.role === 'superadmin' && <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">(Admin)</span>}
                            {user.active === false && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">(Deactivated)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        {user.customDomainRequest ? (
                          <span className="font-mono text-xs bg-neutral-800 text-blue-400 px-3 py-1.5 rounded-md flex items-center gap-2 w-fit">
                            <Globe size={12} /> {user.customDomainRequest}
                          </span>
                        ) : (
                          <span className="text-neutral-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-5">
                        {user.domainStatus === 'live' ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium flex items-center gap-1 w-fit">
                            <ShieldCheck size={12} /> Live
                          </span>
                        ) : user.customDomainRequest ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium flex items-center gap-1 w-fit">
                            <Link2 size={12} /> Pending
                          </span>
                        ) : user.domainStatus === 'failed' ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-medium flex items-center gap-1 w-fit">
                            <X size={12} /> Failed
                          </span>
                        ) : (
                          <span className="text-neutral-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2 items-end">
                          {!user.approved && user.role === 'admin' && (
                            <button 
                              onClick={() => approveUser(user.id)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors w-full justify-center"
                            >
                              <UserCheck size={12} /> Approve User
                            </button>
                          )}
                          
                          {user.followupIncreaseRequest && (
                            <button 
                              onClick={() => approveMoreEdits(user.id)} 
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors w-full justify-center"
                            >
                              <Sparkles size={12} /> Approve More Edits
                            </button>
                          )}

                          {user.customDomainRequest && user.domainStatus !== 'live' && (
                            <div className="flex gap-2 w-full">
                              <button 
                                onClick={() => approveDomain(user.id, user.customDomainRequest!)} 
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors justify-center"
                              >
                                <Check size={12} /> Auto-Provision
                              </button>
                              <button 
                                onClick={() => rejectDomain(user.id)} 
                                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 text-xs rounded-md transition-colors"
                                title="Reject Domain"
                              >
                                <Ban size={12} />
                              </button>
                            </div>
                          )}

                          {user.role === 'admin' && user.approved && (
                            <button 
                              onClick={() => setManualDomain({ userId: user.id, email: user.email, domain: user.customDomainRequest || '' })} 
                              className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors w-full justify-center"
                            >
                              <Globe size={12} /> Manual Map
                            </button>
                          )}

                          {user.role === 'admin' && user.approved && (
                            <button 
                              onClick={() => toggleUserActivation(user.id, user.active !== false)} 
                              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors w-full justify-center ${user.active === false ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                              <Power size={12} /> {user.active === false ? 'Activate' : 'Deactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enquiries Table */}
        {view === 'enquiries' && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-950/50 border-b border-neutral-800">
                  <tr>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Name</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Phone</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Course</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Source (Domain)</th>
                    <th className="p-5 text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-neutral-500">No enquiries yet.</td></tr>
                  ) : (
                    enquiries.map(enq => (
                      <tr key={enq.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                        <td className="p-5 font-medium text-white">{enq.name}</td>
                        <td className="p-5 text-blue-400">{enq.phone}</td>
                        <td className="p-5 text-neutral-300">{enq.course || '-'}</td>
                        <td className="p-5 text-neutral-500 text-sm">{enq.source}</td>
                        <td className="p-5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${enq.status === 'New' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                            {enq.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Manual Domain Modal */}
      {manualDomain && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Manual Domain Mapping</h3>
              <button onClick={() => setManualDomain(null)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-neutral-400 text-sm mb-6">
              Manually map a domain for <span className="text-white font-medium">{manualDomain.email}</span>. This will bypass the Vercel API and update the database directly.
            </p>
            
            <label className="text-xs text-neutral-400 uppercase tracking-wider mb-2 block">Domain Name</label>
            <input 
              type="text" 
              value={manualDomain.domain} 
              onChange={(e) => setManualDomain({ ...manualDomain, domain: e.target.value })} 
              placeholder="www.example.com"
              className="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none mb-8 transition-colors"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setManualDomain(null)} 
                className="flex-1 bg-neutral-800 text-white px-4 py-2.5 rounded-lg hover:bg-neutral-700 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={manualMapDomain} 
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Confirm & Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}