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
import { db } from '@/lib/firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function EditorPage({ params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const resolvedParams = React.use(params);
  const { siteId } = resolvedParams;

  const [isMounted, setIsMounted] = useState(false);
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

   useEffect(() => {
    setIsMounted(true);
    
    const fetchSiteData = async () => {
      // 1. Check Firestore for saved cloud data
      try {
        const siteDoc = await getDoc(doc(db, 'sites', siteId));
        if (siteDoc.exists() && siteDoc.data()?.pageData) {
          setNodes(siteDoc.data().pageData);
          return; // Exit if we found cloud data
        }
      } catch (error) {
        console.log("No cloud data yet, loading template...");
      }

      // 2. Fallback to localStorage (for fast loading)
      const savedData = localStorage.getItem(`site_data_${siteId}`);
      if (savedData) {
        setNodes(JSON.parse(savedData));
      } else {
        // 3. Fallback to Template (if it's a brand new site)
        const templateId = searchParams.get('template');
        if (templateId) {
          const template = TEMPLATES.find(t => t.id === templateId);
          if (template) setNodes(template.pageData);
        }
      }
    };

    fetchSiteData();
  }, [searchParams, siteId, setNodes]);

  // Keyboard Shortcuts
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
    const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      // 1. Clean the nodes array to remove any undefined values (Firestore doesn't accept undefined)
      const cleanNodes = JSON.parse(JSON.stringify(nodes));
      
      // 2. Save the cleaned data to Firebase Firestore
      await setDoc(doc(db, 'sites', siteId), {
        pageData: cleanNodes,
        updatedAt: new Date()
      }, { merge: true });
      
      // 3. Also save to localStorage as a quick fallback cache
      localStorage.setItem(`site_data_${siteId}`, JSON.stringify(cleanNodes));
      
      setSaveStatus('Saved & Live!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus('Error saving!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
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
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            ← Back to Dashboard
          </button>
          {/* View Live Site Button */}
          <a 
            href={`/view/${siteId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            View Live Site ↗
          </a>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus && <span className="text-green-500 text-sm font-medium">{saveStatus}</span>}
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
    </div>
  );
}