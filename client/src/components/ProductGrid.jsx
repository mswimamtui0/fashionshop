import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ title, sort, category, limit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {};
    if (sort) params.sort = sort;
    if (category) params.category = category;

    api.get('/products', { params })
      .then(res => setProducts(limit ? res.data.slice(0, limit) : res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, category, limit]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {title && <h2 className="text-2xl font-light mb-8 tracking-wide">{title}</h2>}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}