import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyOrders().then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <div style={{ textAlign: 'center', padding: 80 }}>Please login to view orders</div>;

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 30 }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <p>No orders yet</p>
          <Link to="/products" style={{ background: '#0a0a0a', color: '#c8a96e', padding: '12px 24px', textDecoration: 'none', display: 'inline-block', marginTop: 20 }}>Start Shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{ border: '1px solid #e8e3d8', borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <Link to={`/orders/${order._id}`} style={{ color: '#c8a96e' }}>View Details →</Link>
          </div>
        ))
      )}
    </div>
  );
}
