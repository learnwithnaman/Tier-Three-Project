import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 20, textAlign: 'center' }}>Register</h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 30, borderRadius: 8, border: '1px solid #e8e3d8' }}>
        <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        <input type="password" placeholder="Password (min. 6 characters)" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 20, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0a0a0a', color: '#c8a96e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{loading ? 'Creating account...' : 'Register'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20 }}>Already have an account? <Link to="/login" style={{ color: '#c8a96e' }}>Login</Link></p>
    </div>
  );
}
