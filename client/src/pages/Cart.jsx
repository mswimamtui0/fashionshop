import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { useState } from 'react';

export default function Cart() {
  const { items, remove, total, clear } = useCart();
  const { user } = useAuth();
  const [msg, setMsg] = useState('');

  const checkout = async () => {
    if (!user) { setMsg('Please login first'); return; }
    try {
      await api.post('/orders', {
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      });
      clear();
      setMsg('✅ Order placed! You will get an SMS confirmation.');
    } catch (err) {
      setMsg('⚠️ ' + (err.response?.data?.error || 'Order failed'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Your Cart</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">
          Cart is empty. <Link to="/shop" className="underline">Shop now</Link>
        </p>
      ) : (
        <>
          {items.map(i => (
            <div key={i.id} className="flex gap-4 border-b py-4">
              <img src={i.images?.[0]} className="w-24 h-32 object-cover" />
              <div className="flex-1">
                <h3>{i.name}</h3>
                <p className="text-gray-500">Qty: {i.quantity}</p>
                <p>TZS {(i.price * i.quantity).toLocaleString()}</p>
                <button
                  onClick={() => remove(i.id)}
                  className="text-sm text-red-500 mt-2"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="mt-6 text-right">
            <p className="text-2xl">Total: TZS {total.toLocaleString()}</p>
            <button
              onClick={checkout}
              className="mt-4 px-10 py-4 bg-black text-white uppercase tracking-widest hover:bg-gray-800"
            >
              Checkout
            </button>
          </div>
        </>
      )}
      {msg && <p className="mt-6 text-center">{msg}</p>}
    </div>
  );
}