import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

export default function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const shipping = total > 999 ? 0 : 99;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <h2>Your cart is empty</h2>
        <Link to="/products" style={{ background: '#0a0a0a', color: '#c8a96e', padding: '12px 24px', textDecoration: 'none', display: 'inline-block', marginTop: 20 }}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 30 }}>Shopping Cart</h1>
      {items.map(item => (
        <div key={item._id} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #e8e3d8', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p>{formatPrice(item.price)}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ padding: '5px 10px' }}>-</button>
            <span>{item.qty}</span>
            <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ padding: '5px 10px' }}>+</button>
          </div>
          <p style={{ fontWeight: 'bold' }}>{formatPrice(item.price * item.qty)}</p>
          <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop: 30, textAlign: 'right' }}>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: {formatPrice(total + shipping)}</p>
        <button onClick={clearCart} style={{ marginTop: 10, padding: '10px 20px', marginRight: 10 }}>Clear Cart</button>
        <Link to="/checkout" style={{ background: '#0a0a0a', color: '#c8a96e', padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }}>Checkout</Link>
      </div>
    </div>
  );
}
