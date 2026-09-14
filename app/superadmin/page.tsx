'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase/client';
import { collection, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Globe, Check, X, Server, Cpu, Link2, ShieldCheck, Loader2, UserCheck, Mail } from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
  approved?: boolean;
  customDomainRequest?: string;
  customDomain?: string;
  domainStatus?: 'pending' | 'live';
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

  // 1. Auth Guard: Check if user is logged in and is a Superadmin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

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

  // 2. Fetch Clients & Enquiries Data
  useEffect(() => {
    if (!isSuperadmin) return;
    
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientUser)));
    });

    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
      setEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry)));
    });

    return () => {
      unsubUsers();
      unsubEnquiries();
    };
  }, [isSuperadmin]);

  // 3. Approve User (Allow them to log in)
  const approveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { approved: true });
    alert("User approved! They can now log in.");
  };

  // 4. Approve & Automate Domain
  const approveDomain = async (userId: string, domain: string) => {
    try {
      const vercelRes = await fetch('/api/setup-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const vercelData = await vercelRes.json();

      if (!vercelData.success) {
        alert("Failed to provision on Vercel: " + vercelData.error);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      const siteId = userDoc.data()?.activeSiteId;

      if (!siteId) {
        alert("Client hasn't created a website yet! Vercel domain added, but no site mapped.");
        return;
      }

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

  // Loading State
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
            <p className="text-neutral-400 text-sm">Manage clients, approve signups, provision domains, and view enquiries.</p>
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

        {/* Client Provisioning Table */}
        {view === 'clients' && (
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
                    <td className="p-5 font-medium text-white">
                      {user.email}
                      {user.role === 'superadmin' && <span className="ml-2 text-xs text-blue-400">(Admin)</span>}
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
                        <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                          <ShieldCheck size={14} /> Live
                        </span>
                      ) : user.customDomainRequest ? (
                        <span className="text-yellow-400 text-xs font-medium flex items-center gap-1">
                          <Link2 size={14} /> Pending
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      {!user.approved && user.role === 'admin' && (
                        <button 
                          onClick={() => approveUser(user.id)} 
                          className="bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg mr-2 hover:bg-blue-700 inline-flex items-center gap-1"
                        >
                          <UserCheck size={12} /> Approve User
                        </button>
                      )}
                      
                      {user.customDomainRequest && user.domainStatus !== 'live' ? (
                        <button 
                          onClick={() => approveDomain(user.id, user.customDomainRequest!)} 
                          className="bg-green-600 text-white px-4 py-2 text-xs rounded-lg inline-flex items-center gap-1 hover:bg-green-700"
                        >
                          <Check size={12} /> Approve Domain
                        </button>
                      ) : (
                        (user.approved || user.role === 'superadmin') && <span className="text-neutral-600 text-sm">—</span>
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
            <div className="p-5 border-b border-neutral-800">
              <h3 className="font-bold text-lg">Website Enquiries</h3>
            </div>
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
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-neutral-500">No enquiries yet. They will appear here when users submit forms on client websites.</td>
                  </tr>
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