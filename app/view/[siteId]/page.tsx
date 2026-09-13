'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { PublicNodeRenderer } from '@/components/renderers/PublicNodeRenderer';
import { Node } from '@/types';

export default function PublicSitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const resolvedParams = React.use(params);
  const { siteId } = resolvedParams;
  const [nodes, setNodes] = useState<Node[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'sites', siteId));
        if (siteDoc.exists()) {
          setNodes(siteDoc.data()?.pageData || []);
        } else {
          setNodes([]);
        }
      } catch (error) {
        console.error("Error fetching site:", error);
        setNodes([]);
      }
    };
    fetchData();
  }, [siteId]);

  if (nodes === null) {
    return <div className="h-screen flex items-center justify-center bg-white text-neutral-400">Loading site...</div>;
  }

  if (nodes.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-neutral-400">
        This site is empty or has not been published yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {nodes.map((node) => <PublicNodeRenderer key={node.id} node={node} />)}
    </div>
  );
}