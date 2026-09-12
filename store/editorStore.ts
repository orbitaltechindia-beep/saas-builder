import { create } from 'zustand';
import { Node } from '@/types';

interface EditorState {
  nodes: Node[];
  selectedNodeId: string | null;
  setNodes: (nodes: Node[]) => void;
  addComponent: (node: Node) => void;
  updateComponentProps: (nodeId: string, props: Partial<Node['props']>) => void;
  selectComponent: (nodeId: string | null) => void;
}

// Utility to update deeply nested nodes
const updateNode = (nodes: Node[], nodeId: string, updater: (n: Node) => Node): Node[] => {
  return nodes.map(node => {
    if (node.id === nodeId) return updater(node);
    if (node.children) return { ...node, children: updateNode(node.children, nodeId, updater) };
    return node;
  });
};

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  addComponent: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateComponentProps: (nodeId, props) => set((state) => ({
    nodes: updateNode(state.nodes, nodeId, (n) => ({ ...n, props: { ...n.props, ...props } }))
  })),
  selectComponent: (nodeId) => set({ selectedNodeId: nodeId }),
}));