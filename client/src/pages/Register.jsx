import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', consentSMS: true
  });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.customer);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Register failed');
    }
  };

  const upd = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-light mb-8 text-center">Create Account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input placeholder="Name" value={form.name}
          onChange={e => upd('name', e.target.value)} required
          className="w-full px-4 py-3 border border-gray-200" />
        <input placeholder="Phone (255712345678)" value={form.phone}
          onChange={e => upd('phone', e.target.value)} required
          className="w-full px-4 py-3 border border-gray-200" />
        <input placeholder="Email (optional)" value={form.email}
          onChange={e => upd('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200" />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => upd('password', e.target.value)} required
          className="w-full px-4 py-3 border border-gray-200" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.consentSMS}
            onChange={e => upd('consentSMS', e.target.checked)} />
          Send me SMS offers and new arrivals
        </label>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button className="w-full py-3 bg-black text-white uppercase tracking-widest hover:bg-gray-800">
          Register
        </button>
      </form>
    </div>
  );
}