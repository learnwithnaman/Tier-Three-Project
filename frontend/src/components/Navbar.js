import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const navStyle = { background: '#0a0a0a', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 1000 };
  const innerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const logoStyle = { fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: '#c8a96e', textDecoration: 'none' };
  const linkStyle = { color: '#a0a0a0', textDecoration: 'none', fontSize: 14 };
  const cartBtnStyle = { background: '#c8a96e', border: 'none', color: '#0a0a0a', padding: '8px 20px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 };
  const badgeStyle = { background: '#0a0a0a', color: '#c8a96e', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        <Link to="/" style={logoStyle}>SHOPSPHERE</Link>
        <div style={{ display: 'flex', gap: 32 }}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/products" style={linkStyle}>Shop</Link>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#a0a0a0', fontSize: 14 }}>{user.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', color: '#6b6b6b', cursor: 'pointer', fontSize: 14 }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Sign In</Link>
              <Link to="/register" style={{ ...linkStyle, color: '#c8a96e' }}>Register</Link>
            </>
          )}
          <Link to="/cart" style={cartBtnStyle}>
            🛒 Cart {count > 0 && <span style={badgeStyle}>{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
