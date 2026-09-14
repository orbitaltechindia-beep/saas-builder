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
import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Trash2, Edit3 } from 'lucide-react';
import Draggable from 'react-draggable';

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
  const [pages, setPages] = useState<{id: string, name: string}[]>([{ id: 'home', name: 'Home' }]);
  const [newPageName, setNewPageName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // AI Followup State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiLimits, setAiLimits] = useState({ followups: 0, followupLimit: 12 });

  // 1. Mount & Auth State
  useEffect(() => {
    setIsMounted(true);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'admin');
          
          const data = userDoc.data();
          const today = new Date().toDateString();
          const lastReset = data.lastAiReset?.toDate().toDateString();
          const isSameDay = today === lastReset;
          
          setAiLimits({
            followups: isSameDay ? (data.aiFollowupsUsed || 0) : 0,
            followupLimit: data.aiFollowupLimit || 12
          });
        }
      }
    });
    return () => unsub();
  }, []);

  // 2. Load Site Data & Pages List
  useEffect(() => {
    if (!siteId) return;
    
    const fetchSiteData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'sites', siteId));
        if (siteDoc.exists()) {
          const data = siteDoc.data();
          
          if (data.pages && data.pages.length > 0) {
            setPages(data.pages);
          }

          const pageKey = pageId === 'home' ? 'pageData' : `pageData_${pageId}`;
          const loadedNodes = data[pageKey];
          
          if (loadedNodes && loadedNodes.length > 0) {
            setNodes(loadedNodes);
          } else {
            const templateId = searchParams.get('template');
            if (templateId && pageId === 'home') {
              const template = TEMPLATES.find(t => t.id === templateId);
              if (template) setNodes(template.pageData);
            } else {
              setNodes([]);
            }
          }
        } else {
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

      if (e.key === 'ArrowUp') { e.preventDefault(); moveComponent(selectedNodeId, 'up'); } 
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveComponent(selectedNodeId, 'down'); } 
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeComponent(selectedNodeId); } 
      else if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); duplicateComponent(selectedNodeId); }
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
        
        if (newNode) addComponent(newNode);
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
      
      setSaveStatus('Saved & Live!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus('Error saving!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // 6. Page Management (Add, Rename, Delete)
  const handleCreatePage = async () => {
    const name = newPageName.trim();
    if (!name || !siteId) return;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    if (!pages.find(p => p.id === slug)) {
      const newPages = [...pages, { id: slug, name: name }];
      setPages(newPages);
      await updateDoc(doc(db, 'sites', siteId), { pages: newPages, [`pageData_${slug}`]: [] });
      router.push(`/editor/${siteId}/${slug}`);
      setNewPageName('');
    }
  };

  const handleRenamePage = async (oldId: string) => {
    const newName = renameValue.trim();
    if (!newName || !siteId) return;
    const newId = newName.toLowerCase().replace(/\s+/g, '-');
    
    if (oldId !== newId) {
      const siteDoc = await getDoc(doc(db, 'sites', siteId));
      const oldData = siteDoc.data()?.[`pageData_${oldId}`] || [];
      
      const newPages = pages.map(p => p.id === oldId ? { id: newId, name: newName } : p);
      setPages(newPages);
      
      await updateDoc(doc(db, 'sites', siteId), {
        pages: newPages,
        [`pageData_${newId}`]: oldData,
        [`pageData_${oldId}`]: deleteField()
      });
      
      router.push(`/editor/${siteId}/${newId}`);
    }
    setRenamingId(null);
  };

  const handleDeletePage = async (pageIdToDelete: string) => {
    if (pageIdToDelete === 'home') { alert("Cannot delete home page."); return; }
    if (!confirm("Delete this page and all its content?")) return;
    
    const newPages = pages.filter(p => p.id !== pageIdToDelete);
    setPages(newPages);
    await updateDoc(doc(db, 'sites', siteId), {
      pages: newPages,
      [`pageData_${pageIdToDelete}`]: deleteField()
    });
    
    if (pageId === pageIdToDelete) {
      router.push(`/editor/${siteId}/home`);
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
        alert("Pushed to Global Templates!");
      }
    } catch (e) {
      alert("Failed to push template.");
    }
  };

  // Helper to fix AI malformed data
  const sanitizeNodes = (nodes: any[]): Node[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map(node => {
      const cleanNode: any = { ...node };
      if (!cleanNode.props) cleanNode.props = {};
      if (!cleanNode.props.styles) cleanNode.props.styles = {};
      
      if (cleanNode.type === 'Container') {
        if (!cleanNode.children || !Array.isArray(cleanNode.children)) {
          cleanNode.children = [];
        } else {
          cleanNode.children = sanitizeNodes(cleanNode.children);
        }
      }
      return cleanNode;
    });
  };

  // 8. AI Followup Edit (Client-Side Quota & Crash Protection)
  const handleAiEdit = async () => {
    if (!aiPrompt) return;

    if (aiLimits.followups >= aiLimits.followupLimit) {
      alert(`Daily edit limit reached (${aiLimits.followups}/${aiLimits.followupLimit}). Try again tomorrow.`);
      return;
    }

    setIsAiEditing(true);
    try {
      const res = await fetch('/api/edit-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentNodes: nodes })
      });
      const data = await res.json();
      
      // CRITICAL: Sanitize AI data and verify it's an array
      if (data.success && Array.isArray(data.nodes)) {
        const cleanNodes = sanitizeNodes(data.nodes);
        setNodes(cleanNodes); // This updates the Zustand store and re-renders the canvas
        setAiPrompt('');
        
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            aiFollowupsUsed: aiLimits.followups + 1,
            lastAiReset: new Date()
          });
          setAiLimits(prev => ({ ...prev, followups: prev.followups + 1 }));
        }
        
        alert("AI updated your website!");
      } else {
        alert("AI failed to edit or returned invalid data. Try a different prompt.");
      }
    } catch (error) {
      alert("Error connecting to AI.");
    }
    setIsAiEditing(false);
  };

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
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0 z-40">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard')} className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            ← Dashboard
          </button>
          <a href={`/view/${siteId}/${pageId}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
            View Live Site ↗
          </a>
          
          {/* Page Manager Dropdown */}
          <div className="relative group">
            <button className="text-neutral-300 hover:text-white text-sm bg-neutral-800 px-3 py-1.5 rounded flex items-center gap-2">
              Page: {pages.find(p => p.id === pageId)?.name || pageId} ▾
            </button>
            {/* Removed mt-1 gap, used pt-1 on a wrapper to bridge the hover area */}
            <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50 w-full">
              <div className="bg-neutral-800 rounded-md shadow-lg min-w-[200px] border border-neutral-700 p-2">
                {pages.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2 hover:bg-neutral-700 rounded p-1">
                    {renamingId === p.id ? (
                      <input 
                        type="text" 
                        value={renameValue} 
                        onChange={(e) => setRenameValue(e.target.value)} 
                        onBlur={() => handleRenamePage(p.id)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleRenamePage(p.id)}
                        autoFocus
                        className="flex-1 bg-neutral-900 text-white text-xs p-1 rounded outline-none border border-blue-500"
                      />
                    ) : (
                      <button onClick={() => router.push(`/editor/${siteId}/${p.id}`)} className="flex-1 text-left text-xs text-neutral-300">
                        {p.name}
                      </button>
                    )}
                    
                    <div className="flex gap-1">
                      <button onClick={() => { setRenamingId(p.id); setRenameValue(p.name); }} className="text-neutral-500 hover:text-white p-1">
                        <Edit3 size={10} />
                      </button>
                      {p.id !== 'home' && (
                        <button onClick={() => handleDeletePage(p.id)} className="text-neutral-500 hover:text-red-500 p-1">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-neutral-700 mt-2 pt-2">
                  <input type="text" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="New page name" className="w-full bg-neutral-900 text-white text-xs p-1 rounded mb-1 outline-none" />
                  <button onClick={handleCreatePage} className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700">+ Add Page</button>
                </div>
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

      {/* Floating AI Followup Assistant (Draggable) */}
      <Draggable handle=".drag-handle">
        <div className="fixed bottom-6 right-6 z-[100] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 w-80 cursor-default">
          <div className="drag-handle cursor-move flex items-center justify-between mb-2">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" /> AI Followup
            </h3>
            <span className="text-neutral-500 text-xs">⋮⋮</span>
          </div>
          <textarea 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Make the hero darker, or add a pricing section..."
            className="w-full bg-neutral-800 text-white text-xs p-2 rounded border border-neutral-700 outline-none focus:border-blue-500 resize-none h-20"
          />
          <div className="text-[10px] text-neutral-500 mt-1 mb-2 text-right">
            Edits used today: {aiLimits.followups}/{aiLimits.followupLimit}
          </div>
          <button 
            onClick={handleAiEdit} 
            disabled={isAiEditing}
            className="w-full bg-blue-600 text-white text-xs py-2 rounded mt-1 hover:bg-blue-700 disabled:opacity-50"
          >
            {isAiEditing ? 'Modifying...' : 'Update with AI ✨'}
          </button>
        </div>
      </Draggable>
    </div>
  );
}