'use client';
import { useDraggable } from '@dnd-kit/core';
import { Type, Image, Square, MousePointerClick, Video, Minus, MoveVertical, Star } from 'lucide-react';
import { Link as LinkIcon, Mail } from 'lucide-react';

function DraggableBlock({ id, type, label, icon }: { id: string; type: string; label: string; icon: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id, data: { type: type },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="flex items-center gap-3 bg-neutral-800 p-3 rounded-md cursor-grab active:cursor-grabbing hover:bg-neutral-700 transition-colors text-neutral-200 text-sm border border-neutral-700/50 shadow-sm">
      <span className="text-blue-400">{icon}</span>
      {label}
    </div>
  );
}

export default function SidebarBlocks() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-white text-xs font-bold mb-2 uppercase tracking-widest text-neutral-500">Add Element</h2>
      <DraggableBlock id="drag-text" type="Text" label="Text Block" icon={<Type size={16} />} />
      <DraggableBlock id="drag-button" type="Button" label="Button" icon={<MousePointerClick size={16} />} />
      <DraggableBlock id="drag-image" type="Image" label="Image" icon={<Image size={16} />} />
      <DraggableBlock id="drag-container" type="Container" label="Container (Flex)" icon={<Square size={16} />} />
      <DraggableBlock id="drag-link" type="Link" label="Text Link" icon={<LinkIcon size={16} />} />
      <DraggableBlock id="drag-form" type="Form" label="Contact Form" icon={<Mail size={16} />} />

      <div className="my-4 border-t border-neutral-800"></div>
      
      <h2 className="text-white text-xs font-bold mb-2 uppercase tracking-widest text-neutral-500">Media & Layout</h2>
      <DraggableBlock id="drag-video" type="Video" label="Video Embed" icon={<Video size={16} />} />
      <DraggableBlock id="drag-divider" type="Divider" label="Divider Line" icon={<Minus size={16} />} />
      <DraggableBlock id="drag-spacer" type="Spacer" label="Spacer" icon={<MoveVertical size={16} />} />
      <DraggableBlock id="drag-icon" type="Icon" label="Icon" icon={<Star size={16} />} />
    </div>
  );
}