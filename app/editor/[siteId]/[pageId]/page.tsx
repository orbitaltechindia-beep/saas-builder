'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '@/store/editorStore';
import SidebarBlocks from '@/components/editor/SidebarBlocks';
import EditorCanvas from '@/components/editor/EditorCanvas';
import InspectorPanel from '@/components/editor/InspectorPanel';
import { useSearchParams, useRouter } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

export default function EditorPage({ params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const resolvedParams = React.use(params);
  const { siteId } = resolvedParams;

  // Fix Hydration Error: Only render DnD Context in the browser
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
    
    const savedData = localStorage.getItem(`site_data_${siteId}`);
    if (savedData) {
      setNodes(JSON.parse(savedData));
    } else {
      const templateId = searchParams.get('template');
      if (templateId) {
        const template = TEMPLATES.find(t => t.id === templateId);
        if (template) setNodes(template.pageData);
      }
    }
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
      const type = active.data.current?.type;
      if (active.id.toString().startsWith('drag-')) {
        let newNode;
        if (type === 'Text') newNode = { id: uuidv4(), type: 'Text', props: { text: 'Edit this text', styles: { color: '#111111' } } };
        else if (type === 'Button') newNode = { id: uuidv4(), type: 'Button', props: { text: 'Click Me' } };
        else if (type === 'Image') newNode = { id: uuidv4(), type: 'Image', props: {} };
        else if (type === 'Container') newNode = { id: uuidv4(), type: 'Container', props: {}, children: [] };
        if (newNode) addComponent(newNode);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem(`site_data_${siteId}`, JSON.stringify(nodes));
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
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
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
          {saveStatus && <span className="text-green-500 text-sm font-medium">{saveStatus}</span>}
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <SidebarBlocks />
          <EditorCanvas />
          <InspectorPanel />
        </div>
      </DndContext>
    </div>
  );
}