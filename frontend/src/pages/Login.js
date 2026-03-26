import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 20, textAlign: 'center' }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 30, borderRadius: 8, border: '1px solid #e8e3d8' }}>
        <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 15, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: 20, border: '1px solid #e8e3d8', borderRadius: 4 }} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0a0a0a', color: '#c8a96e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20 }}>Don't have an account? <Link to="/register" style={{ color: '#c8a96e' }}>Register</Link></p>
    </div>
  );
}
