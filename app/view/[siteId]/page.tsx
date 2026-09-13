import { adminDb } from '@/lib/firebase/admin';
import { PublicNodeRenderer } from '@/components/renderers/PublicNodeRenderer';
import { Node } from '@/types';

// Next.js 16 requires params to be a Promise
export default async function PublicSitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  
  let nodes: Node[] = [];

  try {
    // Fetch the saved website data from Firestore
    const siteDoc = await adminDb.collection('sites').doc(siteId).get();
    
    if (siteDoc.exists) {
      const data = siteDoc.data();
      nodes = data?.pageData || [];
    } else {
      return (
        <div className="h-screen flex items-center justify-center bg-neutral-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
            <p className="text-neutral-400">This website does not exist or has not been published yet.</p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching public site:", error);
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Site</h1>
          <p className="text-neutral-400">Could not connect to the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {nodes.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-neutral-400">
          This site is currently empty. The owner has not added any content yet.
        </div>
      ) : (
        nodes.map((node) => <PublicNodeRenderer key={node.id} node={node} />)
      )}
    </div>
  );
}