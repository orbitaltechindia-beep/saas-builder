'use client';
import { useState, useEffect } from 'react';
import { Globe, Check, X, Server, Cpu, Link2, ShieldCheck } from 'lucide-react';

interface ClientUser {
  id: string;
  company: string;
  owner: string;
  status: 'pending' | 'live' | 'denied';
  domain: string;
  dnsStatus: 'pending' | 'verified';
  templateAssigned: string;
}

export default function SuperadminPanel() {
  const [users, setUsers] = useState<ClientUser[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saas_clients');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      // Default mock data if empty
      const defaultUsers: ClientUser[] = [
        { id: '1', company: 'Infinity Classes', owner: 'admin@infinity.edu', status: 'pending', domain: 'www.infinityclasses.edu', dnsStatus: 'pending', templateAssigned: 'None' },
        { id: '2', company: 'FitCoach Pro', owner: 'john@fitcoach.com', status: 'live', domain: 'fitcoach.yoursaas.com', dnsStatus: 'verified', templateAssigned: 'SaaS Hero' },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('saas_clients', JSON.stringify(defaultUsers));
    }
  }, []);

     const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { 
          ...u, 
          status, 
          dnsStatus: (status === 'live' ? 'verified' : 'pending') as 'verified' | 'pending', 
          templateAssigned: status === 'live' ? 'Infinity Premium' : 'None' 
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('saas_clients', JSON.stringify(updatedUsers));
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
            <p className="text-neutral-400 text-sm">Provision domains, verify DNS, and assign premium templates. (Data persists locally)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Cpu className="text-blue-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Active Domains</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.status === 'live').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <Link2 className="text-yellow-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Pending DNS</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.dnsStatus === 'pending').length}</h2>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">SSL Certificates</p>
              <h2 className="text-2xl font-bold">{users.filter(u => u.dnsStatus === 'verified').length}</h2>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="font-bold text-lg">Client Provisioning</h3>
            <button className="text-blue-400 text-sm hover:text-blue-300">View DNS Logs →</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Client Brand</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Assigned Domain</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">DNS / SSL Status</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase">Active Template</th>
                <th className="p-5 text-xs font-medium text-neutral-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                  <td className="p-5">
                    <div className="font-semibold text-white">{user.company}</div>
                    <div className="text-neutral-500 text-xs mt-1">{user.owner}</div>
                  </td>
                  <td className="p-5">
                    <span className="font-mono text-sm bg-neutral-800 text-blue-400 px-3 py-1.5 rounded-md flex items-center gap-2 w-fit">
                      <Globe size={14} /> {user.domain}
                    </span>
                  </td>
                  <td className="p-5">
                    {user.dnsStatus === 'verified' ? (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <ShieldCheck size={14} /> Verified & Secured
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-xs font-medium flex items-center gap-1">
                        <Link2 size={14} /> Awaiting DNS Pointing
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    {user.templateAssigned !== 'None' ? (
                      <span className="text-sm text-white bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-md">
                        {user.templateAssigned}
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {user.status === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => updateStatus(user.id, 'live')} 
                          className="bg-green-600 text-white px-4 py-2 text-xs rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors"
                        >
                          <Check size={12} /> Approve & Provision
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1 justify-end">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> Live
                      </span>
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