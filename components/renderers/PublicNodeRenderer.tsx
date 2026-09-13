import { Node } from '@/types';

export function PublicNodeRenderer({ node }: { node: Node }) {
  const currentStyles = node.props.styles || {};

  if (node.type === 'Text') {
    return (
      <p style={{ margin: 0, padding: 0, ...currentStyles }}>
        {node.props.text}
      </p>
    );
  }

  if (node.type === 'Button') {
    return (
      <button 
        style={{ border: 'none', cursor: 'pointer', ...currentStyles }}
      >
        {node.props.text}
      </button>
    );
  }

  if (node.type === 'Image') {
    return (
      <div 
        style={{ width: '100%', minHeight: '150px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', ...currentStyles }}
      >
        Image Placeholder
      </div>
    );
  }

  if (node.type === 'Container') {
    return (
      <div style={{ boxSizing: 'border-box', ...currentStyles }}>
        {node.children?.map((child: Node) => (
          <PublicNodeRenderer key={child.id} node={child} />
        ))}
      </div>
    );
  }

  return null;
}