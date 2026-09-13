export interface Node {
  id: string;
     type: 'Container' | 'Text' | 'Image' | 'Button' | 'Video' | 'Divider' | 'Spacer' | 'Icon' | 'Link' | 'Form';
  props: {
    text?: string;
    src?: string;
    href?: string;
    styles?: React.CSSProperties;
    classes?: string[];
  };
  children?: Node[];
}

export interface Page {
  id: string;
  siteId: string;
  slug: string;
  pageData: Node[];
  updatedAt: Date;
}