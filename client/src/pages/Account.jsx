import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const API_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://fashionshop1.onrender.com');

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/200';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

function Stars({ value = 0, size = 14 }) {
  const full = Math.floor(value);
  return (
    <span className="inline-flex items-center" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= full ? 'text-yellow-500' : 'text-gray-300'}>
          {'\u2605'}
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">({value.toFixed(1)})</span>
    </span>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const { items, add, remove, total, count, increase, decrease } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [ratings, setRatings] = useState({});
  const [openOrder, setOpenOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const loadAll = async () => {
      try {
        const pRes = await api.get('/products');
        setProducts(pRes.data);
      } catch (err) {
        console.error('Products load failed:', err.response?.data || err.message);
      }
      api.get('/orders/my').then(r => setOrders(r.data)).catch(() => {});
      api.get('/wishlist').then(r => setWishlist(r.data)).catch(() => {});
      api.get('/ratings/summary').then(r => setRatings(r.data)).catch(() => {});
      setLoading(false);
    };

    loadAll();
  }, [user, navigate]);

  if (!user) return null;

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalItems = orders.reduce(
    (s, o) => s + (o.items?.reduce((x, i) => x + i.quantity, 0) || 0),
    0
  );

  const toggleWishlist = async (productId) => {
    const existing = wishlist.find(w => w.product.id === productId);
    try {
      if (existing) {
        await api.delete(`/wishlist/${productId}`);
        setWishlist(prev => prev.filter(w => w.product.id !== productId));
      } else {
        await api.post('/wishlist', { productId });
        const res = await api.get('/wishlist');
        setWishlist(res.data);
      }
    } catch (err) {
      setMsg('Failed: ' + (err.response?.data?.error || 'Unknown'));
    }
  };

  const isWishlisted = (productId) =>
    wishlist.some(w => w.product.id === productId);

  const inCart = (productId) => items.find(i => i.id === productId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b pb-6">
        <div>
          <h1 className="text-3xl font-light">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.name} - {user.phone}
          </p>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/'; }}
          className="px-5 py-2 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Orders"       value={orders.length} />
        <Stat label="Items Bought" value={totalItems} />
        <Stat label="Total Spent"  value={`TZS ${totalSpent.toLocaleString()}`} />
        <Stat label="Wishlist"     value={wishlist.length} />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <TabBtn active={tab === 'shop'}     onClick={() => setTab('shop')}>Shop All Products</TabBtn>
        <TabBtn active={tab === 'orders'}   onClick={() => setTab('orders')}>My Orders ({orders.length})</TabBtn>
        <TabBtn active={tab === 'wishlist'} onClick={() => setTab('wishlist')}>Wishlist ({wishlist.length})</TabBtn>
      </div>

      {msg && <p className="mb-4 text-sm text-green-700">{msg}</p>}

      {tab === 'shop' && (
        <>
          {items.length > 0 && (
            <div className="mb-10 border-2 border-black bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-black text-white p-4">
                <div>
                  <h2 className="text-lg md:text-xl">
                    Your Selection ({count} item{count !== 1 ? 's' : ''})
                  </h2>
                  <p className="text-xs text-white/70 mt-1">
                    Review your items below and confirm to pay
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="px-5 py-2 bg-white text-black text-xs uppercase tracking-widest hover:bg-gray-200"
                >
                  Continue to Payment
                </Link>
              </div>

              <div className="p-4 space-y-3">
                {items.map(i => (
                  <div
                    key={i.id + (i.variantId || '')}
                    className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 border p-3"
                  >
                    <img
                      src={getImageUrl(i.images?.[0])}
                      alt={i.name}
                      className="w-16 h-20 object-cover bg-white"
                    />
                    <div className="flex-1 min-w-[120px]">
                      <p className="font-medium">{i.name}</p>
                      {i.variantLabel && (
                        <p className="text-xs text-gray-500">{i.variantLabel}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        TZS {i.price.toLocaleString()} x {i.quantity}
                      </p>
                    </div>
                    <div className="flex items-center border bg-white">
                      <button onClick={() => decrease(i.id)} className="w-8 h-8 hover:bg-gray-100 text-lg">-</button>
                      <span className="w-10 text-center text-sm">{i.quantity}</span>
                      <button onClick={() => increase(i.id)} className="w-8 h-8 hover:bg-gray-100 text-lg">+</button>
                    </div>
                    <p className="w-28 text-right font-medium">
                      TZS {(i.price * i.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-red-500 text-lg w-8 h-8 hover:bg-red-50 rounded"
                    >x</button>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black p-4 flex flex-wrap justify-between items-center gap-3 bg-gray-50">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Total to pay</p>
                  <p className="text-2xl font-light">TZS {total.toLocaleString()}</p>
                </div>
                <Link
                  to="/cart"
                  className="px-8 py-3 bg-green-600 text-white text-sm uppercase tracking-widest hover:bg-green-700"
                >
                  Confirm & Pay
                </Link>
              </div>
            </div>
          )}

          <h2 className="text-xl mb-4">
            {items.length > 0 ? 'More Products' : 'All Products'}
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products.map(p => {
                const rating = ratings[p.id] || { average: 0, count: 0 };
                const liked = isWishlisted(p.id);
                const cartItem = inCart(p.id);
                return (
                  <div key={p.id} className={`border group ${cartItem ? 'border-black border-2' : ''}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <Link to={`/product/${p.id}`}>
                        <img
                          src={getImageUrl(p.images?.[0])}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>
                      {cartItem && (
                        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1">
                          In cart ({cartItem.quantity})
                        </span>
                      )}
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-lg ${
                          liked ? 'text-red-500' : 'text-gray-400'
                        } hover:scale-110 transition`}
                      >
                        {liked ? '\u2665' : '\u2661'}
                      </button>
                    </div>
                    <div className="p-3">
                      <Link to={`/product/${p.id}`} className="block">
                        <p className="font-medium truncate">{p.name}</p>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        TZS {p.price?.toLocaleString()}
                      </p>
                      <div className="mt-1">
                        <Stars value={rating.average} size={12} />
                      </div>
                      <button
                        onClick={() => {
                          add(p, 1);
                          setMsg(`${p.name} added to cart`);
                          setTimeout(() => setMsg(''), 2000);
                        }}
                        className="mt-3 w-full py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800"
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <>
          <h2 className="text-xl mb-4">My Orders</h2>
          {orders.length === 0 ? (
            <div className="border border-dashed p-10 text-center text-gray-500">
              <p>You haven't placed any orders yet.</p>
              <button
                onClick={() => setTab('shop')}
                className="mt-4 px-6 py-3 bg-black text-white text-sm uppercase tracking-widest"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => {
                const itemCount = o.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                const isOpen = openOrder === o.id;
                return (
                  <div key={o.id} className="border">
                    <button
                      onClick={() => setOpenOrder(isOpen ? null : o.id)}
                      className="w-full text-left px-5 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50"
                    >
                      <div className="flex flex-wrap items-center gap-6">
                        <span className="text-sm text-gray-500">
                          #{o.id.toString().padStart(5, '0')}
                        </span>
                        <span className="text-sm">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs uppercase tracking-wider px-2 py-1 border border-gray-300">
                          {o.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-500">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                        <span className="font-medium">
                          TZS {o.total.toLocaleString()}
                        </span>
                        <span className="text-gray-400">{isOpen ? '-' : '+'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
                        {o.items?.map(item => (
                          <div key={item.id} className="flex items-center gap-4">
                            <img
                              src={getImageUrl(item.product?.images?.[0])}
                              alt={item.product?.name}
                              className="w-14 h-16 object-cover border bg-white"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.product?.name || 'Product'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x TZS {item.price.toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm font-medium">
                              TZS {(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm text-gray-500">Order Total</span>
                          <span className="text-lg font-medium">
                            TZS {o.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'wishlist' && (
        <>
          <h2 className="text-xl mb-4">My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="border border-dashed p-10 text-center text-gray-500">
              <p>No products in your wishlist yet.</p>
              <p className="text-sm mt-1">Click the heart on any product to save it here.</p>
              <button
                onClick={() => setTab('shop')}
                className="mt-4 px-6 py-3 bg-black text-white text-sm uppercase tracking-widest"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {wishlist.map(w => (
                <div key={w.id} className="border group">
                  <Link
                    to={`/product/${w.product.id}`}
                    className="block aspect-[3/4] overflow-hidden bg-gray-100"
                  >
                    <img
                      src={getImageUrl(w.product.images?.[0])}
                      alt={w.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>
                  <div className="p-3">
                    <Link to={`/product/${w.product.id}`}>
                      <p className="font-medium truncate">{w.product.name}</p>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      TZS {w.product.price?.toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          add(w.product, 1);
                          setMsg('Added to cart');
                          setTimeout(() => setMsg(''), 1500);
                        }}
                        className="flex-1 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(w.product.id)}
                        className="px-3 py-2 border text-xs hover:bg-red-50"
                      >x</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-xl mt-2 truncate">{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm uppercase tracking-widest border ${
        active ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
      }`}
    >
      {children}
    </button>
  );
}