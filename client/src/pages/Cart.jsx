import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { useState } from 'react';

const API_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://fashionshop1.onrender.com');

const SELLER_WHATSAPP = '255757170544';
const SELLER_MPESA    = '0757 170 544';

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/100';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export default function Cart() {
  const { items, remove, clear, total, count, increase, decrease, updateQty } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');

  const checkout = async () => {
    if (!user) {
      setMsg('Please login first');
      setTimeout(() => navigate('/login'), 800);
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    setMsg('');
    try {
      await api.post('/orders', {
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        paymentMethod
      });
      clear();
      navigate('/account');
    } catch (err) {
      setMsg('Order failed: ' + (err.response?.data?.error || 'Unknown error'));
      setPlacing(false);
    }
  };

  const buildWhatsAppMessage = () => {
    let text = `Habari! Nataka kuagiza bidhaa zifuatazo:\n\n`;
    items.forEach((i, idx) => {
      const subtotal = i.price * i.quantity;
      text += `${idx + 1}. ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}\n`;
      text += `   ${i.quantity} x TZS ${Number(i.price).toLocaleString()} = TZS ${subtotal.toLocaleString()}\n\n`;
    });
    text += `------------------\n`;
    text += `JUMLA (TOTAL): TZS ${total.toLocaleString()}\n\n`;
    text += `Njia ya malipo: ${paymentMethod.toUpperCase()}\n\n`;
    text += `Naomba kujadiliana zaidi. Asante!`;
    return encodeURIComponent(text);
  };

  const whatsappLink = `https://wa.me/${SELLER_WHATSAPP}?text=${buildWhatsAppMessage()}`;

  const paymentOptions = [
    { id: 'whatsapp', label: 'Order on WhatsApp & negotiate',    icon: '' },
    { id: 'mpesa',    label: 'M-Pesa (Vodacom)',                 icon: '' },
    { id: 'tigopesa', label: 'Mixx by Yas (Tigo Pesa)',          icon: '' },
    { id: 'airtel',   label: 'Airtel Money',                     icon: '' },
    { id: 'halopesa', label: 'HaloPesa',                         icon: '' },
    { id: 'cash',     label: 'Cash on Delivery (Dar es Salaam)', icon: '' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <>
          <div className="border border-gray-200 mb-6">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            {items.map(i => {
              const subtotal = i.price * i.quantity;
              return (
                <div
                  key={i.id + (i.variantId || '')}
                  className="grid grid-cols-12 gap-3 px-4 py-4 items-center border-b last:border-b-0"
                >
                  <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                    <img
                      src={getImageUrl(i.images?.[0])}
                      alt={i.name}
                      className="w-16 h-20 object-cover border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{i.name}</p>
                      {i.variantLabel && (
                        <p className="text-xs text-gray-500">{i.variantLabel}</p>
                      )}
                      <button
                        onClick={() => remove(i.id)}
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2 flex justify-center">
                    <div className="flex items-center border">
                      <button onClick={() => decrease(i.id)} className="w-8 h-8 hover:bg-gray-100">-</button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={i.quantity}
                        onChange={e => updateQty(i.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center border-l border-r focus:outline-none"
                      />
                      <button onClick={() => increase(i.id)} className="w-8 h-8 hover:bg-gray-100">+</button>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-right text-sm text-gray-600">
                    TZS {i.price.toLocaleString()}
                  </div>

                  <div className="col-span-3 md:col-span-3 text-right font-medium">
                    TZS {subtotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="border border-gray-200 p-5">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b pb-3 mb-3">
                  <span className="text-gray-500">Total quantity</span>
                  <span>{count}</span>
                </div>
                <div className="flex justify-between text-2xl font-light">
                  <span>TOTAL</span>
                  <span>TZS {total.toLocaleString()}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Choose a payment method on the right, then click <strong>Place Order</strong>.
              </p>
            </div>

            <div className="border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Payment method
              </p>

              <div className="space-y-2">
                {paymentOptions.map(pm => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-2.5 border cursor-pointer text-sm ${
                      paymentMethod === pm.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                    />
                    <span>{pm.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900">
                {paymentMethod === 'whatsapp' && (
                  <>Click <strong>Order via WhatsApp</strong> below - we'll confirm price, delivery, and payment on chat.</>
                )}
                {paymentMethod === 'mpesa' && (
                  <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>M-Pesa {SELLER_MPESA}</strong> (Name: FASHIONSHOP). Then click <strong>Place Order</strong> and share the code on WhatsApp.</>
                )}
                {paymentMethod === 'tigopesa' && (
                  <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>Mixx by Yas {SELLER_MPESA}</strong>. Then click <strong>Place Order</strong> and share the confirmation SMS.</>
                )}
                {paymentMethod === 'airtel' && (
                  <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>Airtel Money {SELLER_MPESA}</strong>. Then click <strong>Place Order</strong> with the confirmation code.</>
                )}
                {paymentMethod === 'halopesa' && (
                  <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>HaloPesa {SELLER_MPESA}</strong>. Then click <strong>Place Order</strong> with the confirmation code.</>
                )}
                {paymentMethod === 'cash' && (
                  <>Pay cash on delivery. Available only in <strong>Dar es Salaam</strong>. Click <strong>Place Order</strong> to schedule.</>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3 md:justify-end">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white uppercase tracking-widest hover:bg-green-700 text-center flex items-center justify-center gap-2"
            >
              Order via WhatsApp
            </a>

            <button
              onClick={checkout}
              disabled={placing}
              className={`px-8 py-4 uppercase tracking-widest ${
                placing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500 text-center">
            Secure ordering - We'll contact you to confirm - Payment: {paymentMethod.toUpperCase()}
          </p>
        </>
      )}

      {msg && <p className="mt-6 text-center text-sm text-red-600">{msg}</p>}
    </div>
  );
}