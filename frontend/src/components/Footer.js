import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0a0a0a', color: '#6b6b6b', padding: '60px 24px 30px', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Playfair Display', color: '#c8a96e', marginBottom: 16 }}>SHOPSPHERE</h3>
        <p style={{ fontSize: 14, marginBottom: 20 }}>Curated goods for the discerning modern lifestyle.</p>
        <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 20, fontSize: 13 }}>
          © 2024 ShopSphere. Built with React · Node.js · MongoDB
        </div>
      </div>
    </footer>
  );
}
