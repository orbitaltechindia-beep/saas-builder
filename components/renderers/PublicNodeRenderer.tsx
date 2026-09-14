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
    return <img src={node.props.src} alt="Site Image" style={currentStyles} className="w-full h-auto" />;
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
    return <PublicForm node={node} />;
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
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

function PublicForm({ node }: { node: Node }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const currentStyles = node.props.styles || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      // Save to Firestore 'enquiries' collection
      await addDoc(collection(db, 'enquiries'), {
        ...data,
        source: window.location.hostname, // Which domain it came from
        status: 'New',
        createdAt: serverTimestamp()
      });
      setStatus('success');
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error submitting form.");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div style={currentStyles} className="w-full text-center">
        <h3 className="text-xl font-bold text-green-600 mb-2">Thank You!</h3>
        <p className="text-gray-600">Our team will get in touch with you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={currentStyles} className="w-full">
      <input type="text" name="name" placeholder="Name" required className="w-full p-2 border border-neutral-300 rounded mb-2" />
      <input type="tel" name="phone" placeholder="Phone" required className="w-full p-2 border border-neutral-300 rounded mb-2" />
      <input type="email" name="email" placeholder="Email" className="w-full p-2 border border-neutral-300 rounded mb-2" />
      <select name="course" className="w-full p-2 border border-neutral-300 rounded mb-2">
        <option value="">Select Course</option>
        <option>JEE</option>
        <option>NEET</option>
        <option>Foundation</option>
      </select>
      <textarea name="message" placeholder="Message" className="w-full p-2 border border-neutral-300 rounded mb-2" rows={3}></textarea>
      <button type="submit" disabled={status === 'loading'} className="bg-blue-600 text-white p-2 rounded font-medium w-full disabled:opacity-50">
        {status === 'loading' ? 'Submitting...' : 'Submit Enquiry'}
      </button>
    </form>
  );
}