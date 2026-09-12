'use client';

import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '@/store/editorStore';
import { NodeRenderer } from './NodeRenderer';
import { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export default function EditorCanvas() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-root' });
  const nodes = useEditorStore((s) => s.nodes);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
      {/* Device Toggle Bar */}
      <div className="h-12 border-b border-neutral-800 flex items-center justify-center gap-2 bg-neutral-900">
        <button onClick={() => setDevice('desktop')} className={`p-2 rounded ${device === 'desktop' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:bg-neutral-800'}`}>
          <Monitor size={16} />
        </button>
        <button onClick={() => setDevice('tablet')} className={`p-2 rounded ${device === 'tablet' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:bg-neutral-800'}`}>
          <Tablet size={16} />
        </button>
        <button onClick={() => setDevice('mobile')} className={`p-2 rounded ${device === 'mobile' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:bg-neutral-800'}`}>
          <Smartphone size={16} />
        </button>
      </div>

      {/* Scrollable infinite canvas area */}
      <div 
        className="flex-1 overflow-auto p-10 flex justify-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
        onClick={() => selectComponent(null)}
      >
        <div 
          ref={setNodeRef} 
          className={`bg-white shadow-2xl transition-all duration-300 min-h-[800px] ${isOver ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-neutral-950' : ''}`}
          style={{ width: deviceWidths[device], maxWidth: '100%' }}
        >
          {nodes.length === 0 ? (
            <div className="h-[800px] w-full flex items-center justify-center text-neutral-300 font-medium">
              Drop your first block here to start building
            </div>
          ) : (
            nodes.map((node) => <NodeRenderer key={node.id} node={node} />)
          )}
        </div>
      </div>
    </div>
  );
}