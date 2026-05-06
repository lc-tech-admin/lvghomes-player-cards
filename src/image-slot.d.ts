import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'image-slot': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          shape?: 'rect' | 'rounded' | 'circle' | 'pill';
          radius?: string | number;
          mask?: string;
          fit?: 'cover' | 'contain' | 'fill';
          position?: string;
          placeholder?: string;
          src?: string;
        },
        HTMLElement
      >;
    }
  }
}
