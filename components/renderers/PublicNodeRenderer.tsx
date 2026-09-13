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

    if (node.type === 'Video') {
    return (
      <div style={currentStyles} className="overflow-hidden rounded-md">
        <iframe src={node.props.src} className="w-full h-full" allowFullScreen></iframe>
      </div>
    );
  }

  if (node.type === 'Divider') {
    return <hr style={currentStyles} />;
  }

  if (node.type === 'Spacer') {
    return <div style={currentStyles} />;
  }

  if (node.type === 'Icon') {
    return <div style={currentStyles}>{node.props.text}</div>;
  }

  if (node.type === 'Link') {
    return <a href={node.props.href} style={currentStyles}>{node.props.text}</a>;
  }

  if (node.type === 'Form') {
    return (
      <form style={currentStyles} onSubmit={(e) => e.preventDefault()} className="w-full">
        <input type="text" placeholder="Name" className="w-full p-2 border border-neutral-300 rounded mb-2" />
        <input type="email" placeholder="Email" className="w-full p-2 border border-neutral-300 rounded mb-2" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded font-medium w-full">Submit</button>
      </form>
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