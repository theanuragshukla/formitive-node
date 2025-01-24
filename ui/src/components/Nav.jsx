import React from 'react';

function Nav() {
  return (
    <nav style={{ backgroundColor: '#000000', padding: '1rem', borderBottom: '1px solid #333333' }}> 
      <a href="https://formitive.ai" rel="noopener noreferrer">
        <img
          src="/Formitive-logo-white.svg"
          alt="Formitive Logo"
          style={{ height: '40px', marginLeft: '25px' }} // Ensured marginLeft is set to 25px
        />
      </a>
    </nav>
  );
}

export default Nav;
