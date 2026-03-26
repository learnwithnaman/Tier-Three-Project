import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) return prev.map(i => i._id === product._id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i);
      return [...prev, { ...product, qty }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i._id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setItems([]);
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
