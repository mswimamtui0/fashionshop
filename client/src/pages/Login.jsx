import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { phone, password });
      login(res.data.token, res.data.customer);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-light mb-8 text-center">Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black"
        />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button className="w-full py-3 bg-black text-white uppercase tracking-widest hover:bg-gray-800">
          Login
        </button>
      </form>
    </div>
  );
}