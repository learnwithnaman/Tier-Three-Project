import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shipping = total > 999 ? 0 : 99;
  const grandTotal = total + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product: i._id, name: i.name, qty: i.qty, price: i.price, image: i.images?.[0] || '' }));
      await createOrder({ items: orderItems, shippingAddress: address, paymentMethod: 'COD' });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error('Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 30 }}>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', border: '1px solid #e8e3d8', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h2 style={{ marginBottom: 20 }}>Shipping Address</h2>
          <input type="text" placeholder="Street Address" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
          <input type="text" placeholder="City" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
          <input type="text" placeholder="ZIP Code" required value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        </div>
        <div style={{ background: '#f5f0e8', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h2>Order Summary</h2>
          <p>Subtotal: {formatPrice(total)}</p>
          <p>Shipping: {shipping === 0 ? 'FREE' : formatPrice(shipping)}</p>
          <p style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>Total: {formatPrice(grandTotal)}</p>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#0a0a0a', color: '#c8a96e', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>
          {loading ? 'Placing Order...' : `Place Order - ${formatPrice(grandTotal)}`}
        </button>
      </form>
    </div>
  );
}
