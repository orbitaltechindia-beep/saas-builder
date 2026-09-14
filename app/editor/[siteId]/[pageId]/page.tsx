'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '@/store/editorStore';
import LeftSidebar from '@/components/editor/LeftSidebar';
import EditorCanvas from '@/components/editor/EditorCanvas';
import InspectorPanel from '@/components/editor/InspectorPanel';
import { useSearchParams, useRouter } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { Node } from '@/types';
import { db, auth } from '@/lib/firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles } from 'lucide-react';

export default function EditorPage({ params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const resolvedParams = React.use(params);
  const { siteId, pageId } = resolvedParams;

  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  
  const addComponent = useEditorStore((s) => s.addComponent);
  const setNodes = useEditorStore((s) => s.setNodes);
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const moveComponent = useEditorStore((s) => s.moveComponent);
  const removeComponent = useEditorStore((s) => s.removeComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);
  
  const searchParams = useSearchParams();
  const [saveStatus, setSaveStatus] = useState('');

  // Multi-Page State
  const [pages, setPages] = useState<string[]>(['home']);
  const [newPageName, setNewPageName] = useState('');

  // AI Followup State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);

  // 1. Mount & Auth State
  useEffect(() => {
    setIsMounted(true);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setUserRole(userDoc.data().role || 'admin');
      }
    });
    return () => unsub();
  }, []);

  // 2. Load Site Data (Multi-Page Aware)
  useEffect(() => {
    if (!siteId) return;
    
    const fetchSiteData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'sites', siteId));
        if (siteDoc.exists()) {
          const data = siteDoc.data();
          
          // Determine which page key to load
          const pageKey = pageId === 'home' ? 'pageData' : `pageData_${pageId}`;
          const loadedNodes = data[pageKey];
          
          if (loadedNodes && loadedNodes.length > 0) {
            setNodes(loadedNodes);
          } else {
            // Fallback to template if it's a new home page
            const templateId = searchParams.get('template');
            if (templateId && pageId === 'home') {
              const template = TEMPLATES.find(t => t.id === templateId);
              if (template) setNodes(template.pageData);
            } else {
              setNodes([]); // Empty page for new sub-pages
            }
          }
        } else {
          // Fallback to template if site doesn't exist in DB yet
          const templateId = searchParams.get('template');
          if (templateId) {
            const template = TEMPLATES.find(t => t.id === templateId);
            if (template) setNodes(template.pageData);
          }
        }
      } catch (error) {
        console.error("Error loading site:", error);
      }
    };

    fetchSiteData();
  }, [searchParams, siteId, pageId, setNodes]);

  // 3. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (!selectedNodeId) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveComponent(selectedNodeId, 'up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveComponent(selectedNodeId, 'down');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeComponent(selectedNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateComponent(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, moveComponent, removeComponent, duplicateComponent]);

  // 4. Drag and Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && (over.id === 'canvas-root' || over.id !== active.id)) {
      const type = active.data.current?.type as Node['type'];
      if (active.id.toString().startsWith('drag-')) {
        let newNode: Node | undefined = undefined;

        if (type === 'Text') newNode = { id: uuidv4(), type: 'Text', props: { text: 'Edit this text', styles: { color: '#111111', fontSize: '1.25rem' } } };
        else if (type === 'Button') newNode = { id: uuidv4(), type: 'Button', props: { text: 'Click Me', styles: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' } } };
        else if (type === 'Image') newNode = { id: uuidv4(), type: 'Image', props: { styles: { height: '200px', backgroundColor: '#f3f4f6' } } };
        else if (type === 'Container') newNode = { id: uuidv4(), type: 'Container', props: { styles: { padding: '1rem', border: '1px dashed #d1d5db' } }, children: [] };
        else if (type === 'Video') newNode = { id: uuidv4(), type: 'Video', props: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', styles: { width: '100%', height: '300px' } } };
        else if (type === 'Divider') newNode = { id: uuidv4(), type: 'Divider', props: { styles: { borderTop: '1px solid #e5e7eb', margin: '2rem 0' } } };
        else if (type === 'Spacer') newNode = { id: uuidv4(), type: 'Spacer', props: { styles: { height: '50px' } } };
        else if (type === 'Icon') newNode = { id: uuidv4(), type: 'Icon', props: { text: '⭐', styles: { fontSize: '2rem', color: '#f59e0b' } } };
        else if (type === 'Link') newNode = { id: uuidv4(), type: 'Link', props: { text: 'Click Here', href: '#', styles: { color: '#3b82f6', textDecoration: 'underline' } } };
        else if (type === 'Form') newNode = { id: uuidv4(), type: 'Form', props: { styles: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px' } } };
        
        if (newNode) {
          addComponent(newNode);
        }
      }
    }
  };

  // 5. Save (Multi-Page Aware)
  const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      const cleanNodes = JSON.parse(JSON.stringify(nodes));
      const pageKey = pageId === 'home' ? 'pageData' : `pageData_${pageId}`;
      
      await setDoc(doc(db, 'sites', siteId), {
        [pageKey]: cleanNodes,
        updatedAt: new Date()
      }, { merge: true }); 
      
      localStorage.setItem(`site_data_${siteId}_${pageId}`, JSON.stringify(cleanNodes));
      
      setSaveStatus('Saved & Live!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus('Error saving!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // 6. Create New Page
  const handleCreatePage = async () => {
    if (!newPageName || !siteId) return;
    const slug = newPageName.toLowerCase().replace(/\s+/g, '-');
    if (!pages.includes(slug)) {
      setPages([...pages, slug]);
      await setDoc(doc(db, 'sites', siteId), { [`pageData_${slug}`]: [] }, { merge: true });
      router.push(`/editor/${siteId}/${slug}`);
      setNewPageName('');
    }
  };

  // 7. Superadmin Push to Templates
  const handlePushToTemplates = async () => {
    if (!siteId) return;
    try {
      const siteDoc = await getDoc(doc(db, 'sites', siteId));
      if (siteDoc.exists()) {
        const pageData = siteDoc.data().pageData || [];
        await setDoc(doc(db, 'global_templates', `tpl-${Date.now()}`), {
          name: 'AI Custom Template',
          description: 'AI generated premium template',
          thumbnail: 'bg-gradient-to-br from-purple-600 to-blue-600',
          pageData: pageData
        });
        alert("Pushed to Global Templates! All users can now use this.");
      }
    } catch (e) {
      alert("Failed to push template.");
    }
  };

  // 8. AI Followup Edit
  const handleAiEdit = async () => {
    if (!aiPrompt) return;
    setIsAiEditing(true);
    try {
      const res = await fetch('/api/edit-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentNodes: nodes })
      });
      const data = await res.json();
      if (data.success) {
        setNodes(data.nodes);
        setAiPrompt('');
        alert("AI updated your website!");
      } else {
        alert("AI failed to edit. Try a different prompt.");
      }
    } catch (error) {
      alert("Error connecting to AI.");
    }
    setIsAiEditing(false);
  };

  // Prevent SSR rendering for the DnD components
  if (!isMounted) {
    return (
      <div className="flex flex-col h-screen justify-center items-center bg-neutral-900 text-white">
        Loading Editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-900">
      {/* Top Toolbar */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard')} className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            ← Dashboard
          </button>
          <a href={`/view/${siteId}/${pageId}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
            View Live Site ↗
          </a>
          
          {/* Page Manager Dropdown */}
          <div className="relative group">
            <button className="text-neutral-300 hover:text-white text-sm bg-neutral-800 px-3 py-1.5 rounded">
              Page: {pageId} ▾
            </button>
            <div className="absolute top-full left-0 mt-1 bg-neutral-800 rounded-md shadow-lg hidden group-hover:block z-50 min-w-[150px] border border-neutral-700">
              {pages.map(p => (
                <button key={p} onClick={() => router.push(`/editor/${siteId}/${p}`)} className="block w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700">
                  {p}
                </button>
              ))}
              <div className="border-t border-neutral-700 mt-1 pt-1 px-2 pb-2">
                <input type="text" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="New page name" className="w-full bg-neutral-900 text-white text-xs p-1 rounded mb-1 outline-none" />
                <button onClick={handleCreatePage} className="w-full bg-blue-600 text-white text-xs py-1 rounded">+ Add Page</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {saveStatus && <span className="text-green-500 text-sm font-medium">{saveStatus}</span>}
          
          {userRole === 'superadmin' && (
            <button onClick={handlePushToTemplates} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
              Push as Template
            </button>
          )}

          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <EditorCanvas />
          <InspectorPanel />
        </div>
      </DndContext>

      {/* Floating AI Followup Assistant */}
      <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 w-80">
        <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" /> AI Followup
        </h3>
        <textarea 
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., Make the hero darker, or add a pricing section..."
          className="w-full bg-neutral-800 text-white text-xs p-2 rounded border border-neutral-700 outline-none focus:border-blue-500 resize-none h-20"
        />
        <button 
          onClick={handleAiEdit} 
          disabled={isAiEditing}
          className="w-full bg-blue-600 text-white text-xs py-2 rounded mt-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {isAiEditing ? 'Modifying...' : 'Update with AI ✨'}
        </button>
      </div>
    </div>
  );
}