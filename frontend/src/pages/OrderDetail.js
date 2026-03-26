import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../utils/api';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data)).catch(() => navigate('/orders')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;
  if (!order) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: '#6b6b6b', cursor: 'pointer', marginBottom: 24 }}>← Back to Orders</button>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 20 }}>Order #{order._id}</h1>
      <div style={{ background: '#fff', border: '1px solid #e8e3d8', borderRadius: 8, padding: 24, marginBottom: 20 }}>
        <h2>Items</h2>
        {order.items.map((item, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #e8e3d8' : 'none' }}>
            <p>{item.name} x {item.qty} = {formatPrice(item.price * item.qty)}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#f5f0e8', borderRadius: 8, padding: 24 }}>
        <h2>Order Summary</h2>
        <p>Subtotal: {formatPrice(order.itemsPrice)}</p>
        <p>Shipping: {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</p>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: {formatPrice(order.totalPrice)}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>
    </div>
  );
}
