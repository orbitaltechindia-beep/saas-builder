'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { PublicNodeRenderer } from '@/components/renderers/PublicNodeRenderer';
import { Node } from '@/types';

function DomainViewerContent() {
  const [nodes, setNodes] = useState<Node[] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
   useEffect(() => {
    // Get domain and page path directly from browser
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    const pageId = path === '/' ? 'home' : path.substring(1).replace(/\/$/, '');
    
    const fetchSite = async () => {
      try {
        const domainDoc = await getDoc(doc(db, 'domains', hostname));
        
        if (domainDoc.exists()) {
          const siteId = domainDoc.data().siteId;
          const siteDoc = await getDoc(doc(db, 'sites', siteId));
          
          if (siteDoc.exists()) {
            if (siteDoc.data().status === 'paused') {
              setIsPaused(true);
              setNodes([]);
              return;
            }
            
            // Determine which page data to load based on URL
            const pageKey = pageId === 'home' ? 'pageData' : `pageData_${pageId}`;
            setNodes(siteDoc.data()?.[pageKey] || []);
            return;
          }
        }
        setNodes([]); 
      } catch (error) {
        console.error("Domain routing error:", error);
        setNodes([]);
      }
    };
    fetchSite();
  }, []);

  if (isPaused) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center text-white p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Site Under Maintenance</h1>
          <p className="text-neutral-400 mb-8">We are currently performing scheduled updates to improve your experience. Please check back soon!</p>
          <div className="text-xs text-neutral-600 font-mono">Developed By Orbital Technologies</div>
        </div>
      </div>
    );
  }

  if (nodes === null) {
    return <div className="h-screen flex items-center justify-center bg-white text-neutral-400">Loading site...</div>;
  }

  if (nodes.length === 0) {
    return <div className="h-screen flex items-center justify-center bg-white text-neutral-400">Site not published yet.</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        {nodes.map(node => <PublicNodeRenderer key={node.id} node={node} />)}
      </div>
      <footer className="bg-black text-white text-center p-4 text-xs font-mono w-full">
        Developed By Orbital Technologies
      </footer>
    </div>
  );
}

export default function PublicDomainPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white text-neutral-400">Loading...</div>}>
      <DomainViewerContent />
    </Suspense>
  );
}