import { useState } from 'react';
import api from '../api/axios.js';

export default function Newsletter() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const subscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        name,
        phone,
        password: Math.random().toString(36).slice(-8),
        consentSMS: true
      });
      setMsg('✅ Subscribed! Watch out for our SMS offers.');
      setPhone('');
      setName('');
    } catch (err) {
      setMsg('⚠️ ' + (err.response?.data?.error || 'Could not subscribe'));
    }
  };

  return (
    <section className="bg-gray-50 py-20 mt-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-light tracking-wide">
          Get Exclusive Offers via SMS
        </h2>
        <p className="mt-3 text-gray-500">
          Be the first to know about new arrivals and discounts.
        </p>
        <form onSubmit={subscribe} className="mt-8 flex flex-col md:flex-row gap-3">
          <input
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="flex-1 px-4 py-3 border border-gray-200 focus:outline-none focus:border-black"
          />
          <input
            placeholder="Phone (255712345678)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="flex-1 px-4 py-3 border border-gray-200 focus:outline-none focus:border-black"
          />
          <button className="px-8 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800">
            Subscribe
          </button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </section>
  );
}