import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id).then(r => setProduct(r.data)).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b6b6b', cursor: 'pointer', marginBottom: 32 }}>← Back</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
        <div style={{ background: '#f5f0e8', borderRadius: 12, overflow: 'hidden', aspectRatio: '1' }}>
          <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 16 }}>{product.name}</h1>
          <p style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>{formatPrice(product.price)}</p>
          <p style={{ color: '#4a4a4a', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          <button onClick={() => { addItem(product, 1); toast.success('Added to cart!'); }} style={{ padding: '14px 36px', background: '#0a0a0a', color: '#c8a96e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
