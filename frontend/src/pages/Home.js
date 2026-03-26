import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured, seedProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatured().then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSeed = async () => {
    try {
      await seedProducts();
      toast.success('Products seeded! Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    } catch { toast.error('Seed failed'); }
  };

  return (
    <div>
      <section style={{ background: '#0a0a0a', minHeight: 500, display: 'flex', alignItems: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Playfair Display', color: '#fff', fontSize: 'clamp(40px, 6vw, 70px)', marginBottom: 20 }}>ShopSphere</h1>
          <p style={{ color: '#a0a0a0', fontSize: 18, marginBottom: 30 }}>Discover amazing products at great prices</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/products" style={{ background: '#c8a96e', color: '#0a0a0a', padding: '14px 36px', textDecoration: 'none', borderRadius: 4, fontWeight: 700 }}>Shop Now</Link>
            <button onClick={handleSeed} style={{ background: 'transparent', color: '#a0a0a0', border: '1px solid #333', padding: '14px 36px', borderRadius: 4, cursor: 'pointer' }}>Load Products</button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 30, textAlign: 'center' }}>Featured Products</h2>
        {loading ? (
          <div style={{ textAlign: 'center' }}>Loading...</div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center' }}>No products yet. Click "Load Products" to add some!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
