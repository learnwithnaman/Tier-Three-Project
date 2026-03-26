import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [hover, setHover] = useState(false);
  const img = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e3d8', borderRadius: 8, overflow: 'hidden', transition: 'transform 0.3s', transform: hover ? 'translateY(-4px)' : 'none' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ paddingTop: '100%', overflow: 'hidden', background: '#f5f0e8', position: 'relative' }}>
          <img src={img} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{product.name}</h3>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={() => { addItem(product, 1); toast.success('Added to cart!'); }} style={{ width: '100%', padding: '10px', background: '#0a0a0a', color: '#c8a96e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
