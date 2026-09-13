'use client';

import { useEditorStore } from '@/store/editorStore';
import { Node } from '@/types';

export default function InspectorPanel() {
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

  if (!selectedNode) {
    return (
      <div className="w-64 bg-neutral-900 border-l border-neutral-800 p-4 h-screen text-white flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4 border border-neutral-700">
          <span className="text-neutral-500 text-xl">⚙️</span>
        </div>
        <p className="text-neutral-400 text-sm font-medium">No Selection</p>
        <p className="text-neutral-600 text-xs mt-1 px-4">Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  const currentStyles = selectedNode.props.styles || {};

  return (
    <div className="w-64 bg-neutral-900 border-l border-neutral-800 h-screen text-white overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          {selectedNode.type} Settings
        </h2>
      </div>
      
      <div className="p-4 space-y-6">

        {/* Content */}
        {(selectedNode.type === 'Text' || selectedNode.type === 'Button') && (
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

        {/* Typography */}
        {selectedNode.type === 'Text' && (
          <div className="space-y-3">
            <label className={labelClass}>Typography</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Font Size</label>
                <input type="text" placeholder="2rem" className={inputClass}
                  value={currentStyles.fontSize || ''}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, fontSize: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Weight</label>
                <select className={inputClass}
                  value={currentStyles.fontWeight || '400'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, fontWeight: e.target.value } })}
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
                  value={currentStyles.color || '#000000'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, color: e.target.value } })}
                />
                <input type="text" className="bg-transparent text-white text-xs outline-none flex-1"
                  value={currentStyles.color || '#000000'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, color: e.target.value } })}
                />
              </div>
            </div>
          </div>
        )}
        {/* Href for Links */}
        {selectedNode.type === 'Link' && (
          <div className="space-y-2">
            <label className={labelClass}>Link URL (Href)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              className={inputClass}
              value={selectedNode.props.href || ''} 
              onChange={(e) => updateComponentProps(selectedNode.id, { href: e.target.value })}
            />
          </div>
        )}
        
        {/* Spacing */}
        <div className="space-y-3">
          <label className={labelClass}>Spacing</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-500 block mb-1">Padding</label>
              <input type="text" placeholder="4rem 2rem" className={inputClass}
                value={currentStyles.padding || ''}
                onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, padding: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 block mb-1">Margin</label>
              <input type="text" placeholder="0px" className={inputClass}
                value={currentStyles.margin || ''}
                onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, margin: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* Background & Borders */}
        {selectedNode.type === 'Container' && (
          <div className="space-y-3">
            <label className={labelClass}>Background & Border</label>
            <div>
              <label className="text-[10px] text-neutral-500 block mb-1">Background</label>
              <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded p-1">
                <input type="color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                  value={currentStyles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, backgroundColor: e.target.value } })}
                />
                <input type="text" className="bg-transparent text-white text-xs outline-none flex-1"
                  value={currentStyles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, backgroundColor: e.target.value } })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Border Width</label>
                <input type="text" placeholder="1px" className={inputClass}
                  value={currentStyles.borderWidth || ''}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, borderWidth: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Border Color</label>
                <input type="color" className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
                  value={currentStyles.borderColor || '#000000'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, borderColor: e.target.value } })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 block mb-1">Border Radius</label>
              <input type="text" placeholder="8px" className={inputClass}
                value={currentStyles.borderRadius || ''}
                onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, borderRadius: e.target.value } })}
              />
            </div>
          </div>
        )}

        {/* Layout (Flexbox) */}
        {selectedNode.type === 'Container' && (
          <div className="space-y-3">
            <label className={labelClass}>Layout</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Direction</label>
                <select className={inputClass}
                  value={currentStyles.display === 'flex' ? 'flex' : 'block'}
                  onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, display: e.target.value } })}
                >
                  <option value="block">Vertical</option>
                  <option value="flex">Horizontal</option>
                </select>
              </div>
              {currentStyles.display === 'flex' && (
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-1">Justify</label>
                  <select className={inputClass}
                    value={currentStyles.justifyContent || 'flex-start'}
                    onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, opacity: String(parseInt(e.target.value) / 100) } })}
                  >
                    <option value="flex-start">Left</option>
                    <option value="center">Center</option>
                    <option value="flex-end">Right</option>
                    <option value="space-between">Space Between</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transform & Effects (Canva-like) */}
        <div className="space-y-3">
          <label className={labelClass}>Transform & Effects</label>
          
          {/* Rotate Slider */}
          <div>
            <label className="text-[10px] text-neutral-500 block mb-1">Rotate (deg)</label>
            <input 
              type="range" min="0" max="360" 
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              value={parseInt(currentStyles.transform?.match(/\d+/)?.[0] || '0')}
              onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, transform: `rotate(${e.target.value}deg)` } })}
            />
          </div>

          {/* Opacity Slider */}
                    <div>
            <label className="text-[10px] text-neutral-500 block mb-1">Opacity</label>
            <input 
              type="range" min="0" max="100" 
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              value={currentStyles.opacity ? parseFloat(currentStyles.opacity as string) * 100 : 100}
              onChange={(e) => updateComponentProps(selectedNode.id, { styles: { ...currentStyles, opacity: String((parseInt(e.target.value) / 100).toFixed(2)) } })}
            />
          </div>

          {/* Box Shadow */}
          <div>
            <label className="text-[10px] text-neutral-500 block mb-1">Box Shadow</label>
            <select className={inputClass}
              value={currentStyles.boxShadow ? 'custom' : 'none'}
              onChange={(e) => {
                if(e.target.value === 'none') updateComponentProps(selectedNode.id, { styles: { ...currentStyles, boxShadow: 'none' } });
                else updateComponentProps(selectedNode.id, { styles: { ...currentStyles, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } });
              }}
            >
              <option value="none">None</option>
              <option value="custom">Soft Shadow</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}