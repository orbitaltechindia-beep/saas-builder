import { Node } from '@/types';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  pageData: Node[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'saas-enterprise',
    name: 'SaaS Enterprise Pro',
    description: 'Massive, long-form premium SaaS landing page.',
    thumbnail: 'bg-gradient-to-br from-gray-900 to-indigo-900',
    pageData: [
      // NAVBAR
      {
        id: 'nav', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5rem', backgroundColor: '#000000', position: 'sticky', top: '0', zIndex: '100' } },
        children: [
          { id: 'logo', type: 'Text', props: { text: 'NexusAI', styles: { color: 'white', fontSize: '1.5rem', fontWeight: '800' } } },
          { id: 'nav-cta', type: 'Button', props: { text: 'Book a Demo', styles: { backgroundColor: '#6366f1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' } } }
        ]
      },
      // HERO
      {
        id: 'hero', type: 'Container', props: { styles: { padding: '10rem 5rem', backgroundColor: '#000000', textAlign: 'center' } },
        children: [
          { id: 'h-badge', type: 'Text', props: { text: 'NEXT-GEN AI AUTOMATION', styles: { color: '#6366f1', fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.1em', display: 'block', marginBottom: '1.5rem' } } },
          { id: 'h-title', type: 'Text', props: { text: 'Automate the busywork.\nFocus on the extraordinary.', styles: { color: 'white', fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-0.04em', margin: '0' } } },
          { id: 'h-p', type: 'Text', props: { text: 'NexusAI handles your emails, schedules, and workflows so you don\'t have to. Reclaim 10 hours a week.', styles: { color: '#9ca3af', fontSize: '1.25rem', maxWidth: '600px', margin: '2rem auto' } } },
          { id: 'h-cta', type: 'Button', props: { text: 'Start Free Trial', styles: { backgroundColor: 'white', color: 'black', padding: '1.25rem 2.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem' } } }
        ]
      },
      // FEATURES GRID
      {
        id: 'features', type: 'Container', props: { styles: { padding: '8rem 5rem', backgroundColor: '#0f172a' } },
        children: [
          { id: 'f-head', type: 'Text', props: { text: 'Built for modern teams', styles: { color: 'white', fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '4rem' } } },
          { id: 'f-grid', type: 'Container', props: { styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' } }, children: [
            { id: 'f1', type: 'Container', props: { styles: { padding: '2.5rem', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155' } }, children: [
              { id: 'f1-icon', type: 'Text', props: { text: '🧠', styles: { fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' } } },
              { id: 'f1-t', type: 'Text', props: { text: 'Contextual AI', styles: { color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' } } },
              { id: 'f1-d', type: 'Text', props: { text: 'Understands your company context to draft perfect replies instantly.', styles: { color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' } } }
            ]},
            { id: 'f2', type: 'Container', props: { styles: { padding: '2.5rem', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155' } }, children: [
              { id: 'f2-icon', type: 'Text', props: { text: '⚡', styles: { fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' } } },
              { id: 'f2-t', type: 'Text', props: { text: 'Instant Workflows', styles: { color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' } } },
              { id: 'f2-d', type: 'Text', props: { text: 'Connect your tools and let AI route tasks automatically.', styles: { color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' } } }
            ]},
            { id: 'f3', type: 'Container', props: { styles: { padding: '2.5rem', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155' } }, children: [
              { id: 'f3-icon', type: 'Text', props: { text: '🔒', styles: { fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' } } },
              { id: 'f3-t', type: 'Text', props: { text: 'Enterprise Security', styles: { color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' } } },
              { id: 'f3-d', type: 'Text', props: { text: 'SOC2 compliant with end-to-end encryption.', styles: { color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' } } }
            ]}
          ]}
        ]
      },
      // CTA SECTION
      {
        id: 'cta', type: 'Container', props: { styles: { padding: '8rem 5rem', backgroundColor: '#000000', textAlign: 'center' } },
        children: [
          { id: 'c-title', type: 'Text', props: { text: 'Ready to upgrade your workflow?', styles: { color: 'white', fontSize: '3.5rem', fontWeight: '800', margin: '0' } } },
          { id: 'c-btn', type: 'Button', props: { text: 'Get Started Today', styles: { backgroundColor: '#6366f1', color: 'white', padding: '1.25rem 3rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1.2rem', marginTop: '2.5rem' } } }
        ]
      }
    ]
  },
    {
    id: 'infinity-academi',
    name: 'Infinity Academic Excellence',
    description: 'Premium dark editorial edtech experience with gold accents.',
    thumbnail: 'bg-gradient-to-br from-[#0b1020] to-[#11182b]',
    pageData: [
      // NAVBAR
      {
        id: 'inf-nav', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backgroundColor: '#0b1020', borderBottom: '1px solid #11182b', position: 'sticky', top: '0', zIndex: '100', backdropFilter: 'blur(12px)' } },
        children: [
          { id: 'inf-logo', type: 'Text', props: { text: 'INFINITY CLASSES', styles: { fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.05em', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-nav-cta', type: 'Button', props: { text: 'Enquire Now', styles: { backgroundColor: 'transparent', color: '#c79b55', padding: '0.75rem 1.5rem', borderRadius: '22px', border: '1px solid #c79b55', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' } } }
        ]
      },
      // HERO SECTION
      {
        id: 'inf-hero', type: 'Container', props: { styles: { padding: '8rem 4rem', backgroundColor: '#0b1020', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } },
        children: [
          { id: 'inf-eyebrow', type: 'Text', props: { text: 'ENGINEERED FOR ACADEMIC EXCELLENCE', styles: { color: '#c79b55', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' } } },
          { id: 'inf-h1', type: 'Text', props: { text: 'Build the discipline. Master the concepts. Achieve the extraordinary.', styles: { fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '800', color: '#ffffff', lineHeight: '1.05', letterSpacing: '-0.04em', margin: '0', maxWidth: '1000px', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-hero-p', type: 'Text', props: { text: 'Structured preparation for students who refuse to leave their potential to chance — through rigorous teaching, deliberate practice and continuous performance analysis.', styles: { fontSize: '1.25rem', color: '#687083', maxWidth: '650px', lineHeight: '1.7', marginTop: '2rem' } } },
          { id: 'inf-hero-btns', type: 'Container', props: { styles: { display: 'flex', gap: '1rem', marginTop: '3rem' } }, children: [
            { id: 'inf-btn-1', type: 'Button', props: { text: 'Explore Programs ↗', styles: { backgroundColor: '#c79b55', color: '#0b1020', padding: '1rem 2rem', borderRadius: '22px', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' } } },
            { id: 'inf-btn-2', type: 'Button', props: { text: 'Book Counselling', styles: { backgroundColor: 'transparent', color: '#ffffff', padding: '1rem 2rem', borderRadius: '22px', border: '1px solid #687083', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' } } }
          ]}
        ]
      },
      // TRUST STRIP
      {
        id: 'inf-trust', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-around', padding: '4rem 4rem', backgroundColor: '#f7f8fb', borderBottom: '1px solid #e4e7ee' } },
        children: [
          { id: 'trust-1', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't1-val', type: 'Text', props: { text: '15+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't1-lab', type: 'Text', props: { text: 'Years of excellence', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]},
          { id: 'trust-2', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't2-val', type: 'Text', props: { text: '10K+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't2-lab', type: 'Text', props: { text: 'Students mentored', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]},
          { id: 'trust-3', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't3-val', type: 'Text', props: { text: '500+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't3-lab', type: 'Text', props: { text: 'Top ranks', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]}
        ]
      },
      // CTA SECTION
      {
        id: 'inf-cta', type: 'Container', props: { styles: { padding: '6rem 4rem', backgroundColor: '#0b1020', textAlign: 'center' } },
        children: [
          { id: 'cta-eye', type: 'Text', props: { text: 'YOUR NEXT STEP', styles: { color: '#c79b55', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' } } },
          { id: 'cta-h2', type: 'Text', props: { text: 'Start your academic journey with intention.', styles: { fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', color: '#ffffff', margin: '0', lineHeight: '1.1', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'cta-btn', type: 'Button', props: { text: 'Start Enquiry ↗', styles: { backgroundColor: '#c79b55', color: '#0b1020', padding: '1.25rem 2.5rem', borderRadius: '22px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', marginTop: '2.5rem' } } }
        ]
      }
    ]
  },  {
    id: 'infinity-academ',
    name: 'Infinity Academic Excellence',
    description: 'Massive premium dark edtech experience with gold accents.',
    thumbnail: 'bg-gradient-to-br from-[#0b1020] to-[#11182b]',
    pageData: [
      // NAVBAR
      {
        id: 'inf-nav', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backgroundColor: '#0b1020', borderBottom: '1px solid #11182b', position: 'sticky', top: '0', zIndex: '100', backdropFilter: 'blur(12px)' } },
        children: [
          { id: 'inf-logo', type: 'Text', props: { text: 'INFINITY CLASSES', styles: { fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.05em', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-nav-cta', type: 'Button', props: { text: 'Enquire Now', styles: { backgroundColor: 'transparent', color: '#c79b55', padding: '0.75rem 1.5rem', borderRadius: '22px', border: '1px solid #c79b55', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' } } }
        ]
      },
      // HERO SECTION
      {
        id: 'inf-hero', type: 'Container', props: { styles: { padding: '8rem 4rem', backgroundColor: '#0b1020', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } },
        children: [
          { id: 'inf-eyebrow', type: 'Text', props: { text: 'ENGINEERED FOR ACADEMIC EXCELLENCE', styles: { color: '#c79b55', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' } } },
          { id: 'inf-h1', type: 'Text', props: { text: 'Build the discipline. Master the concepts. Achieve the extraordinary.', styles: { fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '800', color: '#ffffff', lineHeight: '1.05', letterSpacing: '-0.04em', margin: '0', maxWidth: '1000px', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-hero-p', type: 'Text', props: { text: 'Structured preparation for students who refuse to leave their potential to chance — through rigorous teaching, deliberate practice and continuous performance analysis.', styles: { fontSize: '1.25rem', color: '#687083', maxWidth: '650px', lineHeight: '1.7', marginTop: '2rem' } } },
          { id: 'inf-hero-btns', type: 'Container', props: { styles: { display: 'flex', gap: '1rem', marginTop: '3rem' } }, children: [
            { id: 'inf-btn-1', type: 'Button', props: { text: 'Explore Programs ↗', styles: { backgroundColor: '#c79b55', color: '#0b1020', padding: '1rem 2rem', borderRadius: '22px', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' } } },
            { id: 'inf-btn-2', type: 'Button', props: { text: 'Book Counselling', styles: { backgroundColor: 'transparent', color: '#ffffff', padding: '1rem 2rem', borderRadius: '22px', border: '1px solid #687083', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' } } }
          ]}
        ]
      },
      // TRUST STRIP
      {
        id: 'inf-trust', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-around', padding: '4rem 4rem', backgroundColor: '#f7f8fb', borderBottom: '1px solid #e4e7ee' } },
        children: [
          { id: 'trust-1', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't1-val', type: 'Text', props: { text: '15+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't1-lab', type: 'Text', props: { text: 'Years of excellence', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]},
          { id: 'trust-2', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't2-val', type: 'Text', props: { text: '10K+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't2-lab', type: 'Text', props: { text: 'Students mentored', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]},
          { id: 'trust-3', type: 'Container', props: { styles: { textAlign: 'center' } }, children: [
            { id: 't3-val', type: 'Text', props: { text: '500+', styles: { fontSize: '3rem', fontWeight: '800', color: '#0b1020', fontFamily: 'Manrope, sans-serif' } } },
            { id: 't3-lab', type: 'Text', props: { text: 'Top ranks', styles: { color: '#687083', fontSize: '0.9rem', marginTop: '0.5rem' } } }
          ]}
        ]
      },
      // METHODOLOGY GRID
      {
        id: 'inf-method', type: 'Container', props: { styles: { padding: '6rem 4rem', backgroundColor: '#ffffff' } },
        children: [
          { id: 'method-head', type: 'Text', props: { text: 'The Infinity Method', styles: { fontSize: '2.5rem', fontWeight: '800', color: '#0b1020', textAlign: 'center', marginBottom: '3rem', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'method-grid', type: 'Container', props: { styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' } }, children: [
            { id: 'm1', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#f7f8fb', borderRadius: '16px', border: '1px solid #e4e7ee' } }, children: [
              { id: 'm1-num', type: 'Text', props: { text: '01', styles: { color: '#c79b55', fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Manrope, sans-serif' } } },
              { id: 'm1-t', type: 'Text', props: { text: 'Concept', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#0b1020', margin: '1rem 0 0.5rem' } } },
              { id: 'm1-d', type: 'Text', props: { text: 'Build fundamental understanding.', styles: { color: '#687083', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]},
            { id: 'm2', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#f7f8fb', borderRadius: '16px', border: '1px solid #e4e7ee' } }, children: [
              { id: 'm2-num', type: 'Text', props: { text: '02', styles: { color: '#c79b55', fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Manrope, sans-serif' } } },
              { id: 'm2-t', type: 'Text', props: { text: 'Practice', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#0b1020', margin: '1rem 0 0.5rem' } } },
              { id: 'm2-d', type: 'Text', props: { text: 'Turn understanding into solving ability.', styles: { color: '#687083', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]},
            { id: 'm3', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#f7f8fb', borderRadius: '16px', border: '1px solid #e4e7ee' } }, children: [
              { id: 'm3-num', type: 'Text', props: { text: '03', styles: { color: '#c79b55', fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Manrope, sans-serif' } } },
              { id: 'm3-t', type: 'Text', props: { text: 'Testing', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#0b1020', margin: '1rem 0 0.5rem' } } },
              { id: 'm3-d', type: 'Text', props: { text: 'Measure performance under pressure.', styles: { color: '#687083', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]}
          ]}
        ]
      },
      // CTA SECTION
      {
        id: 'inf-cta', type: 'Container', props: { styles: { padding: '6rem 4rem', backgroundColor: '#0b1020', textAlign: 'center' } },
        children: [
          { id: 'cta-eye', type: 'Text', props: { text: 'YOUR NEXT STEP', styles: { color: '#c79b55', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' } } },
          { id: 'cta-h2', type: 'Text', props: { text: 'Start your academic journey with intention.', styles: { fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', color: '#ffffff', margin: '0', lineHeight: '1.1', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'cta-btn', type: 'Button', props: { text: 'Start Enquiry ↗', styles: { backgroundColor: '#c79b55', color: '#0b1020', padding: '1.25rem 2.5rem', borderRadius: '22px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', marginTop: '2.5rem' } } }
        ]
      }
    ]
  },
  {
    id: 'saas-startup-pro',
    name: 'SaaS Startup Pro',
    description: 'Massive modern light-mode SaaS landing page with pricing.',
    thumbnail: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    pageData: [
      // NAVBAR
      {
        id: 'saas-nav', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '0', zIndex: '100', backdropFilter: 'blur(12px)' } },
        children: [
          { id: 'saas-logo', type: 'Text', props: { text: 'FlowOps', styles: { fontSize: '1.25rem', fontWeight: '800', color: '#111827', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'saas-nav-cta', type: 'Button', props: { text: 'Get Started', styles: { backgroundColor: '#111827', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' } } }
        ]
      },
      // HERO
      {
        id: 'saas-hero', type: 'Container', props: { styles: { padding: '8rem 4rem', backgroundColor: '#ffffff', textAlign: 'center' } },
        children: [
          { id: 'saas-badge', type: 'Text', props: { text: '🚀 Now with AI Automation', styles: { display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' } } },
          { id: 'saas-h1', type: 'Text', props: { text: 'Scale your business 10x faster.', styles: { fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '800', color: '#111827', lineHeight: '1.05', letterSpacing: '-0.04em', margin: '0', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'saas-p', type: 'Text', props: { text: 'The all-in-one platform to manage your clients, automate your workflow, and drive revenue.', styles: { fontSize: '1.25rem', color: '#6b7280', maxWidth: '600px', margin: '2rem auto' } } },
          { id: 'saas-btn', type: 'Button', props: { text: 'Start for Free', styles: { backgroundColor: '#2563eb', color: '#ffffff', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' } } }
        ]
      },
      // FEATURES GRID
      {
        id: 'saas-features', type: 'Container', props: { styles: { padding: '6rem 4rem', backgroundColor: '#f9fafb' } },
        children: [
          { id: 'feat-head', type: 'Text', props: { text: 'Everything you need to succeed', styles: { fontSize: '2.5rem', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '3rem', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'feat-grid', type: 'Container', props: { styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' } }, children: [
            { id: 'f1', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' } }, children: [
              { id: 'f1-icon', type: 'Text', props: { text: '⚡', styles: { fontSize: '2rem', marginBottom: '1rem', display: 'block' } } },
              { id: 'f1-t', type: 'Text', props: { text: 'Lightning Fast', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' } } },
              { id: 'f1-d', type: 'Text', props: { text: 'Built for speed and performance from the ground up.', styles: { color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]},
            { id: 'f2', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' } }, children: [
              { id: 'f2-icon', type: 'Text', props: { text: '🔒', styles: { fontSize: '2rem', marginBottom: '1rem', display: 'block' } } },
              { id: 'f2-t', type: 'Text', props: { text: 'Enterprise Security', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' } } },
              { id: 'f2-d', type: 'Text', props: { text: 'Bank-grade encryption to keep your data safe.', styles: { color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]},
            { id: 'f3', type: 'Container', props: { styles: { padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' } }, children: [
              { id: 'f3-icon', type: 'Text', props: { text: '📊', styles: { fontSize: '2rem', marginBottom: '1rem', display: 'block' } } },
              { id: 'f3-t', type: 'Text', props: { text: 'Advanced Analytics', styles: { fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' } } },
              { id: 'f3-d', type: 'Text', props: { text: 'Track your growth with real-time dashboards.', styles: { color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' } } }
            ]}
          ]}
        ]
      },
      // CTA SECTION
      {
        id: 'saas-cta', type: 'Container', props: { styles: { padding: '6rem 4rem', backgroundColor: '#111827', textAlign: 'center' } },
        children: [
          { id: 'saas-cta-h2', type: 'Text', props: { text: 'Ready to scale?', styles: { fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', color: '#ffffff', margin: '0', lineHeight: '1.1', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'saas-cta-btn', type: 'Button', props: { text: 'Get Started Today', styles: { backgroundColor: '#2563eb', color: '#ffffff', padding: '1.25rem 2.5rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', marginTop: '2.5rem' } } }
        ]
      }
    ]
  },

  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch.',
    thumbnail: 'bg-neutral-100 border border-neutral-200',
    pageData: []
  },
    {
    id: 'infinity-premium',
    name: 'Infinity Premium (Editable)',
    description: 'World-class dark editorial edtech experience.',
    thumbnail: 'bg-gradient-to-br from-[#07111f] to-[#0b1728]',
        pageData: [
      // NAVBAR
      {
        id: 'inf-nav', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', backgroundColor: '#07111F', position: 'sticky', top: '0', zIndex: '20', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.05)' } },
        children: [
          { id: 'inf-logo', type: 'Text', props: { text: 'INFINITY CLASSES', styles: { fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-nav-cta', type: 'Button', props: { text: 'Enquire Now', styles: { backgroundColor: '#07111F', color: '#FFFFFF', padding: '12px 21px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' } } }
        ]
      },
      // HERO SECTION
      {
        id: 'inf-hero', type: 'Container', props: { styles: { padding: '130px 40px 90px', backgroundColor: '#07111F', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '760px', justifyContent: 'center', position: 'relative', overflow: 'hidden' } },
        children: [
          { id: 'inf-eyebrow', type: 'Text', props: { text: 'EDUCATION WITHOUT LIMITS', styles: { color: '#5278FF', fontSize: '12px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '18px', display: 'block' } } },
          { id: 'inf-h1', type: 'Text', props: { text: 'Build Your Future.\nGo Beyond Limits.', styles: { fontSize: 'clamp(54px, 7vw, 94px)', fontWeight: '800', color: '#FFFFFF', lineHeight: '0.94', letterSpacing: '-0.045em', margin: '0', maxWidth: '900px', fontFamily: 'Manrope, sans-serif' } } },
          { id: 'inf-hero-p', type: 'Text', props: { text: 'Focused learning, expert mentorship and a disciplined academic environment designed to help students achieve their highest potential.', styles: { fontSize: '18px', color: '#C8D1DE', maxWidth: '650px', lineHeight: '1.7', marginTop: '25px' } } },
          { id: 'inf-hero-btns', type: 'Container', props: { styles: { display: 'flex', gap: '12px', marginTop: '30px' } }, children: [
            { id: 'inf-btn-1', type: 'Button', props: { text: 'Explore Courses ↗', styles: { backgroundColor: '#FFFFFF', color: '#07111F', padding: '15px 21px', borderRadius: '999px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' } } },
            { id: 'inf-btn-2', type: 'Button', props: { text: 'Talk to an Academic Counsellor', styles: { backgroundColor: 'rgba(255,255,255,0.09)', color: '#FFFFFF', padding: '15px 21px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' } } }
          ]}
        ]
      },
      // TRUST STRIP
      {
        id: 'inf-trust', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-around', padding: '38px 40px', backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(7,17,31,0.11)' } },
        children: [
          { id: 'trust-1', type: 'Container', props: { styles: { padding: '0 15px', borderLeft: '1px solid rgba(7,17,31,0.11)' } }, children: [
            { id: 't1-h', type: 'Text', props: { text: 'Expert Faculty', styles: { fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: '700', display: 'block', color: '#07111F' } } },
            { id: 't1-p', type: 'Text', props: { text: 'Mentors who care', styles: { fontSize: '12px', color: '#697586' } } }
          ]},
          { id: 'trust-2', type: 'Container', props: { styles: { padding: '0 15px', borderLeft: '1px solid rgba(7,17,31,0.11)' } }, children: [
            { id: 't2-h', type: 'Text', props: { text: 'Personal Mentorship', styles: { fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: '700', display: 'block', color: '#07111F' } } },
            { id: 't2-p', type: 'Text', props: { text: 'Guidance beyond class', styles: { fontSize: '12px', color: '#697586' } } }
          ]},
          { id: 'trust-3', type: 'Container', props: { styles: { padding: '0 15px', borderLeft: '1px solid rgba(7,17,31,0.11)' } }, children: [
            { id: 't3-h', type: 'Text', props: { text: 'Structured Learning', styles: { fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: '700', display: 'block', color: '#07111F' } } },
            { id: 't3-p', type: 'Text', props: { text: 'A clear academic path', styles: { fontSize: '12px', color: '#697586' } } }
          ]}
        ]
      },
      // COURSES SECTION (Data from your JSON schema)
      {
        id: 'inf-courses', type: 'Container', props: { styles: { padding: '120px 40px', backgroundColor: '#F7F8FB' } },
        children: [
          { id: 'course-head', type: 'Container', props: { styles: { textAlign: 'center', marginBottom: '55px' } }, children: [
            { id: 'course-eye', type: 'Text', props: { text: 'PROGRAMS', styles: { color: '#5278FF', fontSize: '12px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' } } },
            { id: 'course-h2', type: 'Text', props: { text: 'Designed around your goals.', styles: { fontSize: 'clamp(34px, 5vw, 62px)', fontWeight: '800', color: '#07111F', margin: '0', fontFamily: 'Manrope, sans-serif' } } }
          ]},
          { id: 'course-grid', type: 'Container', props: { styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } }, children: [
            // Course 01
            { id: 'course-1', type: 'Container', props: { styles: { padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid rgba(7,17,31,0.11)', borderRadius: '24px', minHeight: '310px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }, children: [
              { id: 'c1-content', type: 'Container', props: { styles: {} }, children: [
                { id: 'c1-num', type: 'Text', props: { text: '01', styles: { color: '#5278FF', fontSize: '13px', fontWeight: '700', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c1-title', type: 'Text', props: { text: 'JEE Preparation', styles: { fontSize: '28px', fontWeight: '800', color: '#07111F', margin: '25px 0 8px', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c1-desc', type: 'Text', props: { text: 'Concepts, practice and test strategy for engineering entrance preparation.', styles: { fontSize: '14px', color: '#697586', lineHeight: '1.7' } } }
              ]},
              { id: 'c1-btn', type: 'Button', props: { text: 'Explore Program →', styles: { backgroundColor: '#07111F', color: '#FFFFFF', padding: '12px 18px', borderRadius: '999px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '18px', alignSelf: 'flex-start' } } }
            ]},
            // Course 02
            { id: 'course-2', type: 'Container', props: { styles: { padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid rgba(7,17,31,0.11)', borderRadius: '24px', minHeight: '310px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }, children: [
              { id: 'c2-content', type: 'Container', props: { styles: {} }, children: [
                { id: 'c2-num', type: 'Text', props: { text: '02', styles: { color: '#5278FF', fontSize: '13px', fontWeight: '700', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c2-title', type: 'Text', props: { text: 'NEET Preparation', styles: { fontSize: '28px', fontWeight: '800', color: '#07111F', margin: '25px 0 8px', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c2-desc', type: 'Text', props: { text: 'A structured preparation framework for medical entrance readiness.', styles: { fontSize: '14px', color: '#697586', lineHeight: '1.7' } } }
              ]},
              { id: 'c2-btn', type: 'Button', props: { text: 'Explore Program →', styles: { backgroundColor: '#07111F', color: '#FFFFFF', padding: '12px 18px', borderRadius: '999px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '18px', alignSelf: 'flex-start' } } }
            ]},
            // Course 03
            { id: 'course-3', type: 'Container', props: { styles: { padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid rgba(7,17,31,0.11)', borderRadius: '24px', minHeight: '310px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }, children: [
              { id: 'c3-content', type: 'Container', props: { styles: {} }, children: [
                { id: 'c3-num', type: 'Text', props: { text: '03', styles: { color: '#5278FF', fontSize: '13px', fontWeight: '700', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c3-title', type: 'Text', props: { text: 'Foundation', styles: { fontSize: '28px', fontWeight: '800', color: '#07111F', margin: '25px 0 8px', fontFamily: 'Manrope, sans-serif' } } },
                { id: 'c3-desc', type: 'Text', props: { text: 'Build strong academic fundamentals before competitive preparation.', styles: { fontSize: '14px', color: '#697586', lineHeight: '1.7' } } }
              ]},
              { id: 'c3-btn', type: 'Button', props: { text: 'Explore Program →', styles: { backgroundColor: '#07111F', color: '#FFFFFF', padding: '12px 18px', borderRadius: '999px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '18px', alignSelf: 'flex-start' } } }
            ]}
          ]}
        ]
      },
      // CTA SECTION
      {
        id: 'inf-cta', type: 'Container', props: { styles: { padding: '70px 40px', margin: '0 40px 120px', backgroundColor: '#07111F', borderRadius: '34px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px' } },
        children: [
          { id: 'cta-text', type: 'Container', props: { styles: {} }, children: [
            { id: 'cta-eye', type: 'Text', props: { text: 'ADMISSIONS', styles: { color: '#9bb0ff', fontSize: '12px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' } } },
            { id: 'cta-h2', type: 'Text', props: { text: 'Your Next Chapter Starts Here.', styles: { fontSize: 'clamp(34px, 5vw, 62px)', fontWeight: '800', color: '#FFFFFF', margin: '0', lineHeight: '1.02', fontFamily: 'Manrope, sans-serif' } } }
          ]},
          { id: 'cta-btn', type: 'Button', props: { text: 'Book a Counselling Session', styles: { backgroundColor: '#FFFFFF', color: '#07111F', padding: '15px 21px', borderRadius: '999px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', flexShrink: '0' } } }
        ]
      },
      // FOOTER
      {
        id: 'inf-footer', type: 'Container', props: { styles: { padding: '70px 40px 25px', backgroundColor: '#050c16', color: '#FFFFFF' } },
        children: [
          { id: 'footer-logo', type: 'Text', props: { text: 'INFINITY CLASSES', styles: { fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '20px', display: 'block' } } },
          { id: 'footer-copy', type: 'Text', props: { text: 'Learn. Evolve. Achieve. A premium academic experience built around purposeful learning.', styles: { color: '#9eacbd', fontSize: '14px', maxWidth: '400px', lineHeight: '1.7' } } },
          { id: 'footer-credit', type: 'Text', props: { text: 'Digital Experience crafted with love by Orbital Technologies', styles: { color: '#758397', fontSize: '12px', marginTop: '50px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'block' } } }
        ]
      }
    ]
  },
  {
    id: 'coaching-pro',
    name: 'Coaching Institute Pro',
    description: 'High-converting dark theme for education.',
    thumbnail: 'bg-gradient-to-br from-slate-900 to-slate-800',
    pageData: [
      {
        id: 'nav-1', type: 'Container', props: { styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', backgroundColor: '#020617', borderBottom: '1px solid #1e293b' } },
        children: [
          { id: 'logo-1', type: 'Text', props: { text: 'Dreams Institute', styles: { fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' } } },
          { id: 'nav-cta-1', type: 'Button', props: { text: 'Book Demo', styles: { backgroundColor: '#f59e0b', color: '#000000', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold' } } }
        ]
      },
      {
        id: 'hero-coaching', type: 'Container', props: { styles: { padding: '6rem 3rem', backgroundColor: '#020617', textAlign: 'center' } },
        children: [
          { id: 'badge-1', type: 'Text', props: { text: 'Punjab\'s #1 Govt Job Exam Institute', styles: { display: 'inline-block', backgroundColor: '#1e293b', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '1.5rem' } } },
          { id: 'head-1', type: 'Text', props: { text: 'Your Government Job Starts Here', styles: { fontSize: '3.5rem', fontWeight: '900', color: '#ffffff', lineHeight: '1.2' } } },
          { id: 'para-1', type: 'Text', props: { text: 'Master Cadre, ETT, PSTET, and Police exams with India\'s best educators. Weekly mock tests, daily current affairs, and a results wall you can verify.', styles: { fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '1.5rem auto' } } },
          { id: 'cta-1', type: 'Button', props: { text: 'Start Free Trial', styles: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '1rem 2rem', borderRadius: '0.5rem', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' } } }
        ]
      }
    ]
  }
];