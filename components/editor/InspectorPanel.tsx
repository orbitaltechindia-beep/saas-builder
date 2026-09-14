'use client';

import { useEditorStore } from '@/store/editorStore';
import { Node } from '@/types';
import { Sparkles } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';

interface InspectorProps {
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  isAiEditing: boolean;
  handleAiEdit: () => void;
  aiLimits: { followups: number, followupLimit: number };
}

export default function InspectorPanel({ aiPrompt, setAiPrompt, isAiEditing, handleAiEdit, aiLimits }: InspectorProps) {
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateComponentProps = useEditorStore((s) => s.updateComponentProps);

  const findNode = (nodesArray: Node[]): Node | null => {
    for (let n of nodesArray) {
      if (n.id === selectedNodeId) return n;
      if (n.children) {
        const found = findNode(n.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNode(nodes) : null;

  const inputClass = "w-full bg-neutral-800 text-white text-xs px-2 py-1.5 rounded border border-neutral-700 focus:border-blue-500 outline-none transition-colors";
  const labelClass = "text-[10px] uppercase tracking-wider text-neutral-500 font-bold";

  return (
    <div className="w-64 bg-neutral-900 border-l border-neutral-800 h-screen text-white overflow-y-auto flex-shrink-0 flex flex-col">
      <div className="p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          {selectedNode ? `${selectedNode.type} Settings` : 'Inspector'}
        </h2>
      </div>
      
      {/* Scrollable Inspector Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedNode ? (
          <div className="p-4 text-center text-neutral-500 text-sm mt-10">
            Select an element on the canvas to edit its properties.
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Content */}
            {(selectedNode.type === 'Text' || selectedNode.type === 'Button' || selectedNode.type === 'Link') && (
              <div className="space-y-2">
                <label className={labelClass}>Content</label>
                <textarea 
                  className={inputClass} 
                  rows={2}
                  value={selectedNode.props.text || ''} 
                  onChange={(e) => updateComponentProps(selectedNode.id, { text: e.target.value })}
                />
              </div>
            )}

            {/* Href for Links & Buttons */}
            {(selectedNode.type === 'Button' || selectedNode.type === 'Link') && (
              <div className="space-y-2">
                <label className={labelClass}>Link URL</label>
                <input 
                  type="text" 
                  placeholder="https://... OR /about-us" 
                  className={inputClass}
                  value={selectedNode.props.href || ''} 
                  onChange={(e) => updateComponentProps(selectedNode.id, { href: e.target.value })}
                />
                <p className="text-[10px] text-neutral-500">Use /pagename for internal pages</p>
              </div>
            )}

            {/* Image Uploader */}
            {selectedNode.type === 'Image' && (
              <div className="space-y-2">
                <label className={labelClass}>Image Upload</label>
                <CldUploadButton
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  className="w-full bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
                  onUpload={(result: any) => {
                    updateComponentProps(selectedNode.id, { src: result.info.secure_url });
                  }}
                >
                  Upload from Device
                </CldUploadButton>
              </div>
            )}

            {/* Typography */}
            {selectedNode.type === 'Text' && (
              <div className="space-y-3">
                <label className={labelClass}>Typography</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Font Size</label>
                    <input type="text" placeholder="2rem" className={inputClass}
                      value={selectedNode.props.styles?.fontSize || ''}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, fontSize: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Weight</label>
                    <select className={inputClass}
                      value={selectedNode.props.styles?.fontWeight || '400'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, fontWeight: e.target.value } })}
                    >
                      <option value="300">Light</option>
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="700">Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-1">Text Color</label>
                  <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded p-1">
                    <input type="color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      value={selectedNode.props.styles?.color || '#000000'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, color: e.target.value } })}
                    />
                    <input type="text" className="bg-transparent text-white text-xs outline-none flex-1"
                      value={selectedNode.props.styles?.color || '#000000'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, color: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Spacing */}
            <div className="space-y-3">
              <label className={labelClass}>Spacing</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-1">Padding</label>
                  <input type="text" placeholder="4rem 2rem" className={inputClass}
                    value={selectedNode.props.styles?.padding || ''}
                    onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, padding: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-1">Margin</label>
                  <input type="text" placeholder="0px" className={inputClass}
                    value={selectedNode.props.styles?.margin || ''}
                    onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, margin: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Background & Border */}
            {selectedNode.type === 'Container' && (
              <div className="space-y-3">
                <label className={labelClass}>Background & Border</label>
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-1">Background</label>
                  <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded p-1">
                    <input type="color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      value={selectedNode.props.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, backgroundColor: e.target.value } })}
                    />
                    <input type="text" className="bg-transparent text-white text-xs outline-none flex-1"
                      value={selectedNode.props.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, backgroundColor: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Border Radius</label>
                    <input type="text" placeholder="8px" className={inputClass}
                      value={selectedNode.props.styles?.borderRadius || ''}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, borderRadius: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Layout</label>
                    <select className={inputClass}
                      value={selectedNode.props.styles?.display === 'flex' ? 'flex' : 'block'}
                      onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...selectedNode.props.styles, display: e.target.value } })}
                    >
                      <option value="block">Vertical</option>
                      <option value="flex">Horizontal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Followup Assistant (Integrated at Bottom) */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-950 flex-shrink-0">
        <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" /> AI Followup
        </h3>
        <textarea 
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., Make the hero darker..."
          className="w-full bg-neutral-800 text-white text-xs p-2 rounded border border-neutral-700 outline-none focus:border-blue-500 resize-none h-20 mb-2"
        />
        <div className="text-[10px] text-neutral-500 mb-2 text-right">
          Edits used today: {aiLimits.followups}/{aiLimits.followupLimit}
        </div>
        <button 
          onClick={handleAiEdit} 
          disabled={isAiEditing}
          className="w-full bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAiEditing ? 'Modifying...' : <><Sparkles size={12} /> Update with AI</>}
        </button>
      </div>
    </div>
  );
}