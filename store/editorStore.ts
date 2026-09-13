import { create } from 'zustand';
import { Node } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
  nodes: Node[];
  selectedNodeId: string | null;
  setNodes: (nodes: Node[]) => void;
  addComponent: (node: Node) => void;
  removeComponent: (nodeId: string) => void;
  duplicateComponent: (nodeId: string) => void;
  moveComponent: (nodeId: string, direction: 'up' | 'down') => void;
  updateComponentProps: (nodeId: string, props: Partial<Node['props']>) => void;
  selectComponent: (nodeId: string | null) => void;
}

const cloneNodeWithNewIds = (node: Node): Node => {
  return {
    ...node,
    id: uuidv4(),
    props: { ...node.props },
    children: node.children?.map(cloneNodeWithNewIds)
  };
};

const updateNode = (nodes: Node[], nodeId: string, updater: (n: Node) => Node): Node[] => {
  return nodes.map(node => {
    if (node.id === nodeId) return updater(node);
    if (node.children) return { ...node, children: updateNode(node.children, nodeId, updater) };
    return node;
  });
};

const removeFromTree = (nodes: Node[], nodeId: string): Node[] => {
  return nodes
    .filter(node => node.id !== nodeId)
    .map(node => node.children ? { ...node, children: removeFromTree(node.children, nodeId) } : node);
};

const duplicateInTree = (nodes: Node[], nodeId: string): Node[] => {
  let duplicated = false;
  return nodes.reduce((acc: Node[], node) => {
    acc.push(node);
    if (node.id === nodeId && !duplicated) {
      duplicated = true;
      acc.push(cloneNodeWithNewIds(node));
    }
    if (node.children) {
      node.children = duplicateInTree(node.children, nodeId);
    }
    return acc;
  }, []);
};

const moveInTree = (nodes: Node[], nodeId: string, direction: 'up' | 'down'): Node[] => {
  const newNodes = [...nodes];
  for (let i = 0; i < newNodes.length; i++) {
    if (newNodes[i].id === nodeId) {
      const swapIndex = direction === 'up' ? i - 1 : i + 1;
      if (swapIndex >= 0 && swapIndex < newNodes.length) {
        [newNodes[i], newNodes[swapIndex]] = [newNodes[swapIndex], newNodes[i]];
      }
      return newNodes;
    }
    if (newNodes[i].children) {
      newNodes[i].children = moveInTree(newNodes[i].children!, nodeId, direction);
    }
  }
  return newNodes;
};

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  addComponent: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeComponent: (nodeId) => set((state) => ({
    nodes: removeFromTree(state.nodes, nodeId),
    selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
  })),
  duplicateComponent: (nodeId) => set((state) => ({
    nodes: duplicateInTree(state.nodes, nodeId)
  })),
  moveComponent: (nodeId, direction) => set((state) => ({
    nodes: moveInTree(state.nodes, nodeId, direction)
  })),
  updateComponentProps: (nodeId, props) => set((state) => ({
    nodes: updateNode(state.nodes, nodeId, (n) => ({ ...n, props: { ...n.props, ...props } }))
  })),
  selectComponent: (nodeId) => set({ selectedNodeId: nodeId }),
}));