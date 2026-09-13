import { useState, useEffect } from 'react';
import api from '../../api/axios.js';

const API_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://fashionshop1.onrender.com');

const CATEGORIES = [
  { value: 'women',          label: 'Women' },
  { value: 'women-dresses',  label: 'Women — Dresses' },
  { value: 'women-tops',     label: 'Women — Tops' },
  { value: 'women-pants',    label: 'Women — Pants' },
  { value: 'women-skirts',   label: 'Women — Skirts' },
  { value: 'men',            label: 'Men' },
  { value: 'men-shirts',     label: 'Men — Shirts' },
  { value: 'men-pants',      label: 'Men — Pants' },
  { value: 'men-jackets',    label: 'Men — Jackets' },
  { value: 'kids',           label: 'Kids' },
  { value: 'shoes',          label: 'Shoes' },
  { value: 'bags',           label: 'Bags' },
  { value: 'accessories',    label: 'Accessories' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', 'One Size'];

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/400';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '', price: '', oldPrice: '', stock: '',
    category: 'women', description: ''
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [variants, setVariants] = useState([
    { color: '', size: '', stock: '' }   // start with 1 empty variant
  ]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMsg('');
    const formData = new FormData();
    for (const f of files) formData.append('files', f);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrls(prev => [...prev, ...res.data.urls]);
      setMsg(`✅ Uploaded ${res.data.urls.length} image(s)`);
    } catch (err) {
      setMsg('⚠️ Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => setImageUrls(prev => prev.filter(u => u !== url));

  // ----- Variant helpers -----
  const addVariant = () =>
    setVariants(prev => [...prev, { color: '', size: '', stock: '' }]);

  const removeVariant = (i) =>
    setVariants(prev => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i, key, value) =>
    setVariants(prev =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v))
    );

  const add = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      setMsg('⚠️ Please upload at least one image');
      return;
    }
    try {
      // 1. Create the product
      const productRes = await api.post('/products', {
        name: form.name,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        stock: form.stock ? parseInt(form.stock) : 0,
        category: form.category,
        description: form.description,
        images: imageUrls
      });

      const productId = productRes.data.id;

      // 2. Create variants (only valid ones)
      const validVariants = variants.filter(v => v.color.trim());
      for (const v of validVariants) {
        await api.post('/variants', {
          productId,
          color: v.color.trim(),
          size: v.size.trim() || null,
          stock: v.stock ? parseInt(v.stock) : 0
        });
      }

      setMsg(`✅ Product added with ${validVariants.length} variant(s)`);
      setForm({ name: '', price: '', oldPrice: '', stock: '', category: 'women', description: '' });
      setImageUrls([]);
      setVariants([{ color: '', size: '', stock: '' }]);
      load();
    } catch (err) {
      setMsg('⚠️ ' + (err.response?.data?.error || 'Failed'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Add Product</h1>

      <form onSubmit={add} className="grid md:grid-cols-2 gap-4 mb-10 border p-6">
        <input
          placeholder="Product name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="border px-3 py-2 md:col-span-2"
        />

        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          required
          className="border px-3 py-2 bg-white"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <input
          placeholder="Stock quantity (total)"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
          className="border px-3 py-2"
        />

        <input
          placeholder="Price (TZS)"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
          className="border px-3 py-2"
        />

        <input
          placeholder="Old price (optional)"
          type="number"
          value={form.oldPrice}
          onChange={e => setForm({ ...form, oldPrice: e.target.value })}
          className="border px-3 py-2"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
          rows={3}
          className="border px-3 py-2 md:col-span-2"
        />

        {/* ---------- VARIANTS ---------- */}
        <div className="md:col-span-2 border p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider">
              Colors / Sizes / Stock
            </h3>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs px-3 py-1 border border-black hover:bg-black hover:text-white"
            >
              + Add variant
            </button>
          </div>

          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2">
              <input
                placeholder="Color (e.g. Black)"
                value={v.color}
                onChange={e => updateVariant(i, 'color', e.target.value)}
                className="border px-2 py-2 col-span-4"
              />
              <select
                value={v.size}
                onChange={e => updateVariant(i, 'size', e.target.value)}
                className="border px-2 py-2 col-span-4 bg-white"
              >
                <option value="">— Size (optional) —</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                placeholder="Stock"
                type="number"
                value={v.stock}
                onChange={e => updateVariant(i, 'stock', e.target.value)}
                className="border px-2 py-2 col-span-3"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="col-span-1 text-red-500 hover:bg-red-50"
                title="Remove variant"
              >✕</button>
            </div>
          ))}

          <p className="text-xs text-gray-500 mt-2">
            Example: Black / M / 5 &nbsp;·&nbsp; White / L / 2 &nbsp;·&nbsp; Green / One Size / 10
          </p>
        </div>

        {/* Image upload */}
        <div className="md:col-span-2 border-2 border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Upload images — drag & drop, select multiple, or ZIP
          </p>
          <input
            type="file"
            multiple
            accept="image/*,.zip"
            onChange={e => handleFiles(e.target.files)}
            className="block mx-auto"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
        </div>

        {imageUrls.length > 0 && (
          <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-5 gap-2">
            {imageUrls.map(url => (
              <div key={url} className="relative group">
                <img src={getImageUrl(url)} alt="preview" className="w-full h-24 object-cover border" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 text-xs opacity-0 group-hover:opacity-100"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        <button className="md:col-span-2 py-3 bg-black text-white uppercase tracking-widest hover:bg-gray-800">
          Add Product
        </button>

        {msg && <p className="md:col-span-2 text-sm">{msg}</p>}
      </form>

      {/* Product list */}
      <h2 className="text-xl mb-4">All Products ({products.length})</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-3">
            <img
              src={getImageUrl(p.images?.[0])}
              alt={p.name}
              className="w-full h-40 object-cover mb-2"
              onError={e => { e.target.src = 'https://via.placeholder.com/400'; }}
            />
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">
              {p.category} · TZS {p.price}
            </p>
            <button
              onClick={async () => {
                if (!confirm(`Delete "${p.name}"?`)) return;
                try {
                  await api.delete(`/products/${p.id}`);
                  load();
                } catch (err) {
                  alert('Delete failed: ' + (err.response?.data?.error || err.message));
                }
              }}
              className="mt-2 text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}