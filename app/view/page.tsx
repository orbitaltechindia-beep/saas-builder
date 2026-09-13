'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { PublicNodeRenderer } from '@/components/renderers/PublicNodeRenderer';
import { Node } from '@/types';

export default function PublicDomainPage() {
  const [nodes, setNodes] = useState<Node[] | null>(null);

  useEffect(() => {
    // Get the hostname directly from the browser (e.g., infinityclasses.vercel.app)
    const hostname = window.location.hostname;
    
    const fetchSite = async () => {
      try {
        // 1. Look up the domain in the public 'domains' collection
        const domainDoc = await getDoc(doc(db, 'domains', hostname));
        
        if (domainDoc.exists()) {
          const siteId = domainDoc.data().siteId;
          
          // 2. Fetch the actual website data
          const siteDoc = await getDoc(doc(db, 'sites', siteId));
          if (siteDoc.exists()) {
            setNodes(siteDoc.data()?.pageData || []);
            return;
          }
        }
        setNodes([]); // Not found
      } catch (error) {
        console.error("Domain routing error:", error);
        setNodes([]);
      }
    };
    fetchSite();
  }, []);

  if (nodes === null) {
    return <div className="h-screen flex items-center justify-center bg-white text-neutral-400">Loading site...</div>;
  }

  if (nodes.length === 0) {
    return <div className="h-screen flex items-center justify-center bg-white text-neutral-400">Site not published yet.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {nodes.map(node => <PublicNodeRenderer key={node.id} node={node} />)}
    </div>
  );
}