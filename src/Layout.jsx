import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;0,600;1,400&display=swap');
        
        :root {
          --font-heading: 'Instrument Serif', serif;
          --font-body: 'Instrument Sans', sans-serif;
        }
        
        * {
          font-family: var(--font-body);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
        }
      `}</style>
      {children}
    </>
  );
}