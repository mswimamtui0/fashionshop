import { useState, useEffect } from 'react';
import api from '../../api/axios.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', images: ''
  });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...form,
        price: parseFloat(form.price),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean)
      });
      setMsg('✅ Product added');
      setForm({ name: '', price: '', category: '', description: '', images: '' });
      load();
    } catch (e) {
      setMsg('⚠️ ' + (e.response?.data?.error || 'Failed'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Manage Products</h1>

      <form onSubmit={add} className="grid md:grid-cols-2 gap-3 mb-10 border p-6">
        <input placeholder="Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required className="border px-3 py-2" />
        <input placeholder="Price (TZS)" type="number" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required className="border px-3 py-2" />
        <input placeholder="Category (women/men/shoes/bags)" value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          required className="border px-3 py-2" />
        <input placeholder="Image URLs (comma separated)" value={form.images}
          onChange={e => setForm({ ...form, images: e.target.value })}
          className="border px-3 py-2" />
        <textarea placeholder="Description" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required className="border px-3 py-2 md:col-span-2" />
        <button className="md:col-span-2 py-3 bg-black text-white uppercase tracking-widest">
          Add Product
        </button>
        {msg && <p className="md:col-span-2 text-sm">{msg}</p>}
      </form>

      <h2 className="text-xl mb-4">All Products ({products.length})</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-3">
            <img src={p.images?.[0]} className="w-full h-40 object-cover mb-2" />
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">{p.category} · TZS {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}