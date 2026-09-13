'use client';

import { Node } from '@/types';
import { useEditorStore } from '@/store/editorStore';
import { useDraggable } from '@dnd-kit/core';
import { Copy, Trash2, RotateCw, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export function NodeRenderer({ node }: { node: Node }) {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const updateComponentProps = useEditorStore((s) => s.updateComponentProps);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);

  const isSelected = selectedNodeId === node.id;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: node.id,
    data: { type: node.type, isExisting: true }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(node.id);
  };

  const handleBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (node.props.text !== e.target.innerText) {
      updateComponentProps(node.id, { text: e.target.innerText });
    }
  };

  const currentStyles = node.props.styles || {};
  const dragTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;
  const style = dragTransform ? { transform: dragTransform } : {};

  const wrapperClass = `relative transition-all ${
    isSelected ? 'outline outline-2 outline-blue-500 z-10' : 'hover:outline hover:outline-1 hover:outline-blue-400'
  }`;

  const handleMove = (direction: 'up' | 'down') => {
    useEditorStore.getState().moveComponent(node.id, direction);
  };

  const handleDuplicate = () => {
    useEditorStore.getState().duplicateComponent(node.id);
  };

  const handleDelete = () => {
    useEditorStore.getState().removeComponent(node.id);
  };

  return (
    <div ref={setNodeRef} onClick={handleClick} className={wrapperClass} style={style}>
      {/* Floating Contextual Toolbar */}
      {isSelected && (
        <div className="absolute -top-9 left-0 bg-blue-600 text-white text-[10px] rounded-md shadow-xl flex items-center z-30 overflow-hidden">
          <button {...listeners} {...attributes} className="px-2 py-1.5 bg-blue-700 hover:bg-blue-600 cursor-grab active:cursor-grabbing">
            <GripVertical size={12} />
          </button>
          <span className="px-1 py-1.5 font-bold uppercase tracking-wider">{node.type}</span>
          
          <button onClick={(e) => { e.stopPropagation(); handleMove('up'); }} className="p-1.5 hover:bg-blue-500 transition-colors">
            <ArrowUp size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleMove('down'); }} className="p-1.5 hover:bg-blue-500 transition-colors">
            <ArrowDown size={12} />
          </button>

          <div className="w-px h-4 bg-blue-400/50 mx-1"></div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              const currentRot = parseInt(currentStyles.transform?.match(/\d+/)?.[0] || '0');
              updateComponentProps(node.id, { styles: { ...currentStyles, transform: `rotate(${currentRot + 15}deg)` }});
            }} 
            className="p-1.5 hover:bg-blue-500 transition-colors"
            title="Rotate 15°"
          >
            <RotateCw size={12} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); handleDuplicate(); }} className="p-1.5 hover:bg-blue-500 transition-colors">
            <Copy size={12} />
          </button>
          
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1.5 hover:bg-red-500 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Element Rendering - Strictly applying styles without interfering wrappers */}
      {node.type === 'Text' && (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          className="outline-none w-full"
          style={{ margin: 0, padding: 0, ...currentStyles }}
        >
          {node.props.text}
        </p>
      )}

      {node.type === 'Button' && (
        <button 
          className="rounded-md transition-colors pointer-events-none"
          style={{ border: 'none', cursor: 'pointer', ...currentStyles }}
        >
          {node.props.text}
        </button>
      )}

      {node.type === 'Image' && (
        <div 
          className="w-full h-40 bg-neutral-200 flex items-center justify-center text-neutral-500 rounded-md"
          style={currentStyles}
        >
          Image Placeholder
        </div>
      )}

            {node.type === 'Video' && (
        <div style={currentStyles} className="bg-neutral-100 flex items-center justify-center rounded-md overflow-hidden">
          <iframe src={node.props.src} className="w-full h-full" allowFullScreen></iframe>
        </div>
      )}

      {node.type === 'Divider' && (
        <hr style={currentStyles} className="w-full" />
      )}

      {node.type === 'Spacer' && (
        <div style={currentStyles} className="w-full bg-neutral-100/50 flex items-center justify-center text-neutral-300 text-xs">
          Spacer
        </div>
      )}

      {node.type === 'Icon' && (
        <div style={currentStyles} className="flex items-center justify-center w-full">
          {node.props.text}
        </div>
      )}


      {node.type === 'Link' && (
        <a href={node.props.href} onClick={(e) => e.preventDefault()} style={currentStyles} className="pointer-events-none">
          {node.props.text}
        </a>
      )}

      {node.type === 'Form' && (
        <div style={currentStyles} className="w-full pointer-events-none">
          <input type="text" placeholder="Name" className="w-full p-2 border border-neutral-300 rounded" />
          <input type="email" placeholder="Email" className="w-full p-2 border border-neutral-300 rounded" />
          <button className="bg-blue-600 text-white p-2 rounded font-medium">Submit</button>
        </div>
      )}

      
      {node.type === 'Container' && (
        <div 
          className="w-full"
          style={{ boxSizing: 'border-box', ...currentStyles }}
        >
          {node.children?.length === 0 ? (
            <div className="w-full h-full min-h-[50px] flex items-center justify-center text-neutral-300 text-sm border border-dashed border-neutral-200 rounded-md">
              Empty Container
            </div>
          ) : (
            node.children?.map((child: Node) => <NodeRenderer key={child.id} node={child} />)
          )}
        </div>
      )}
    </div>
  );
}