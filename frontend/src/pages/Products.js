import React, { useEffect, useState } from 'react';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({}).then(r => { setProducts(r.data.products); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 30 }}>All Products</h1>
      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center' }}>No products found. Click "Load Products" on the homepage!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
