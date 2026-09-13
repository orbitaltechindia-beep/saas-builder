'use client';
import { Node } from '@/types';
import { useEditorStore } from '@/store/editorStore';
import { ChevronUp, ChevronDown, Box, Type, Square, Image as ImageIcon, MousePointerClick } from 'lucide-react';

const getIcon = (type: string) => {
  switch(type) {
    case 'Text': return <Type size={12} />;
    case 'Button': return <MousePointerClick size={12} />;
    case 'Image': return <ImageIcon size={12} />;
    default: return <Box size={12} />;
  }
};

const LayerItem = ({ node, depth }: { node: Node, depth: number }) => {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const moveComponent = useEditorStore((s) => s.moveComponent);

  const isSelected = selectedNodeId === node.id;

  return (
    <div style={{ paddingLeft: `${depth * 12 + 8}px` }}>
      <div 
        className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs mb-1 ${
          isSelected ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white border border-transparent'
        }`}
        onClick={(e) => { e.stopPropagation(); selectComponent(node.id); }}
      >
        <div className="flex items-center gap-2 flex-1 truncate">
          {getIcon(node.type)}
          <span className="truncate">{node.props.text || node.type}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); moveComponent(node.id, 'up'); }} className="p-1 hover:bg-neutral-700 rounded">
            <ChevronUp size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); moveComponent(node.id, 'down'); }} className="p-1 hover:bg-neutral-700 rounded">
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
      {node.children?.map(child => (
        <LayerItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default function LayersPanel() {
  const nodes = useEditorStore((s) => s.nodes);
  
  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full pb-10">
      {nodes.length === 0 ? (
        <p className="text-neutral-600 text-xs p-2 text-center mt-4">No layers yet. Add elements to start.</p>
      ) : (
        nodes.map(node => <LayerItem key={node.id} node={node} depth={0} />)
      )}
    </div>
  );
}