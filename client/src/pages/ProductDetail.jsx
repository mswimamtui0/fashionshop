import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p className="p-12">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
      <div>
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/600'}
          alt={product.name}
          className="w-full aspect-[3/4] object-cover"
        />
      </div>
      <div>
        <h1 className="text-3xl font-light">{product.name}</h1>
        <p className="mt-4 text-2xl">TZS {product.price?.toLocaleString()}</p>
        <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
        <button
          onClick={() => add(product)}
          className="mt-10 w-full py-4 bg-black text-white uppercase tracking-widest hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}