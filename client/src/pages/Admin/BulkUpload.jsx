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
  { value: 'women-dresses',  label: 'Women â€” Dresses' },
  { value: 'women-tops',     label: 'Women â€” Tops' },
  { value: 'women-pants',    label: 'Women â€” Pants' },
  { value: 'women-skirts',   label: 'Women â€” Skirts' },
  { value: 'men',            label: 'Men' },
  { value: 'men-shirts',     label: 'Men â€” Shirts' },
  { value: 'men-pants',      label: 'Men â€” Pants' },
  { value: 'men-jackets',    label: 'Men â€” Jackets' },
  { value: 'kids',           label: 'Kids' },
  { value: 'shoes',          label: 'Shoes' },
  { value: 'bags',           label: 'Bags' },
  { value: 'accessories',    label: 'Accessories' },
];

const SIZES = ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','43','44','One Size'];

const emptyItem = () => ({
  _key: Math.random().toString(36).slice(2),
  name: '', category: 'women', price: '', qty: '',
  description: '', color: '', size: '',
  images: [],
  uploading: false,
  uploadingMsg: ''
});

function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export default function BulkUpload() {
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const updateItem = (key, field, value) => {
    setItems(prev =>
      prev.map(it => (it._key === key ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (key) =>
    setItems(prev => prev.filter(it => it._key !== key));

  const handleFiles = async (key, files) => {
    if (!files || files.length === 0) return;
    updateItem(key, 'uploading', true);
    updateItem(key, 'uploadingMsg', '');

    const formData = new FormData();
    for (const f of files) formData.append('files', f);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItems(prev =>
        prev.map(it =>
          it._key === key
            ? { ...it, images: [...it.images, ...res.data.urls], uploading: false, uploadingMsg: `âœ… ${res.data.urls.length} uploaded` }
            : it
        )
      );
    } catch (err) {
      setItems(prev =>
        prev.map(it =>
          it._key === key
            ? { ...it, uploading: false, uploadingMsg: 'âš ï¸ ' + (err.response?.data?.error || err.message) }
            : it
        )
      );
    }
  };

  const removeImage = (key, url) => {
    setItems(prev =>
      prev.map(it =>
        it._key === key
          ? { ...it, images: it.images.filter(u => u !== url) }
          : it
      )
    );
  };

  const grandTotal = items.reduce((sum, it) => {
    const p = parseFloat(it.price) || 0;
    const q = parseInt(it.qty) || 0;
    return sum + p * q;
  }, 0);

  const totalQty = items.reduce((sum, it) => sum + (parseInt(it.qty) || 0), 0);

  const saveAll = async () => {
    setSaving(true);
    setMsg('');

    const valid = items.filter(it => it.name && it.price && it.category);
    if (valid.length === 0) {
      setMsg('âš ï¸ Fill in at least one item (name + price + category)');
      setSaving(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const it of valid) {
      try {
        const productRes = await api.post('/products', {
          name: it.name,
          category: it.category,
          price: parseFloat(it.price),
          description: it.description || it.name,
          stock: parseInt(it.qty) || 0,
          images: it.images
        });

        if (it.color.trim()) {
          await api.post('/variants', {
            productId: productRes.data.id,
            color: it.color.trim(),
            size: it.size || null,
            stock: parseInt(it.qty) || 0
          });
        }

        success++;
      } catch (err) {
        console.error('Save item failed:', it.name, err);
        failed++;
      }
    }

    setMsg(`âœ… Saved ${success} product(s)${failed ? ` Â· âš ï¸ ${failed} failed` : ''}`);
    if (success > 0) {
      setItems([emptyItem()]);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-light">Bulk Upload Products</h1>
        <button
          onClick={addItem}
          className="px-6 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white"
        >
          + Add Item
        </button>
      </div>

      {items.map((it, idx) => {
        const subtotal = (parseFloat(it.price) || 0) * (parseInt(it.qty) || 0);
        return (
          <div key={it._key} className="border border-gray-300 p-5 mb-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm uppercase tracking-wider text-gray-500">
                Item {idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(it._key)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Product name (e.g. Shoes)"
                value={it.name}
                onChange={e => updateItem(it._key, 'name', e.target.value)}
                className="border px-3 py-2 md:col-span-2"
              />

              <select
                value={it.category}
                onChange={e => updateItem(it._key, 'category', e.target.value)}
                className="border px-3 py-2 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <input
                placeholder="Description (optional)"
                value={it.description}
                onChange={e => updateItem(it._key, 'description', e.target.value)}
                className="border px-3 py-2"
              />

              <input
                placeholder="Color (e.g. Black)"
                value={it.color}
                onChange={e => updateItem(it._key, 'color', e.target.value)}
                className="border px-3 py-2"
              />

              <select
                value={it.size}
                onChange={e => updateItem(it._key, 'size', e.target.value)}
                className="border px-3 py-2 bg-white"
              >
                <option value="">â€” Size (optional) â€”</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <input
                type="number"
                placeholder="Unit price (TZS)"
                value={it.price}
                onChange={e => updateItem(it._key, 'price', e.target.value)}
                className="border px-3 py-2"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={it.qty}
                onChange={e => updateItem(it._key, 'qty', e.target.value)}
                className="border px-3 py-2"
              />

              <div className="md:col-span-2 text-right text-sm text-gray-600 border-t pt-2">
                Subtotal: <strong>TZS {subtotal.toLocaleString()}</strong>
              </div>

              <div className="md:col-span-2 border-2 border-dashed border-gray-300 p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,.zip"
                  onChange={e => handleFiles(it._key, e.target.files)}
                  className="block mx-auto"
                  disabled={it.uploading}
                />
                {it.uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                {it.uploadingMsg && <p className="text-xs mt-1">{it.uploadingMsg}</p>}
              </div>

              {it.images.length > 0 && (
                <div className="md:col-span-2 grid grid-cols-4 md:grid-cols-6 gap-2">
                  {it.images.map(url => (
                    <div key={url} className="relative group">
                      <img
                        src={getImageUrl(url)}
                        alt="preview"
                        className="w-full h-20 object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(it._key, url)}
                        className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
                      >âœ•</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="border-2 border-black p-5 mb-6">
        <h2 className="text-lg font-medium mb-3">Summary</h2>
        <div className="flex justify-between text-sm py-1">
          <span>Items</span>
          <span>{items.filter(it => it.name).length}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span>Total quantity</span>
          <span>{totalQty}</span>
        </div>
        <div className="flex justify-between text-xl font-medium border-t pt-3 mt-2">
          <span>Grand Total</span>
          <span>TZS {grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={saveAll}
        disabled={saving}
        className={`w-full py-4 uppercase tracking-widest ${
          saving
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {saving ? 'Saving...' : 'Save All Products'}
      </button>

      {msg && <p className="mt-4 text-center text-sm">{msg}</p>}
    </div>
  );
}
