'use client';
import { useState } from 'react';
import SidebarBlocks from './SidebarBlocks';
import LayersPanel from './LayersPanel';
import { PlusSquare, Layers } from 'lucide-react';

export default function LeftSidebar() {
  const [tab, setTab] = useState<'blocks' | 'layers'>('blocks');

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 h-screen flex flex-col flex-shrink-0">
      <div className="flex border-b border-neutral-800 flex-shrink-0">
        <button 
          onClick={() => setTab('blocks')}
          className={`flex-1 p-3 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'blocks' ? 'text-white bg-neutral-800 border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <PlusSquare size={14} /> Elements
        </button>
        <button 
          onClick={() => setTab('layers')}
          className={`flex-1 p-3 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'layers' ? 'text-white bg-neutral-800 border-b-2 border-blue-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <Layers size={14} /> Layers
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'blocks' ? <SidebarBlocks /> : <LayersPanel />}
      </div>
    </div>
  );
}