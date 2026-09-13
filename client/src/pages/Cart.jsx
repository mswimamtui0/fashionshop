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
        : 'https://fashionshop1.onrender.com');PI_URL.replace('/api', '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://fashionshop1.onrender.com');PI_URL.replace('/api', '')
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
      setMsg('⚠️ ' + (err.response?.data?.error || 'Order failed'));
      setPlacing(false);
    }
  };

  const buildWhatsAppMessage = () => {
    let text = `Habari! Nataka kuagiza bidhaa zifuatazo:\n\n`;
    items.forEach((i, idx) => {
      const subtotal = i.price * i.quantity;
      text += `${idx + 1}. ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}\n`;
      text += `   ${i.quantity} × TZS ${Number(i.price).toLocaleString()} = TZS ${subtotal.toLocaleString()}\n\n`;
    });
    text += `──────────────────\n`;
    text += `JUMLA (TOTAL): TZS ${total.toLocaleString()}\n\n`;
    text += `Njia ya malipo: ${paymentMethod.toUpperCase()}\n\n`;
    text += `Naomba kujadiliana zaidi. Asante!`;
    return encodeURIComponent(text);
  };

  const whatsappLink = `https://wa.me/${SELLER_WHATSAPP}?text=${buildWhatsAppMessage()}`;

  const paymentOptions = [
    { id: 'whatsapp', label: 'Order on WhatsApp & negotiate',    icon: '💬' },
    { id: 'mpesa',    label: 'M-Pesa (Vodacom)',                 icon: '📱' },
    { id: 'tigopesa', label: 'Mixx by Yas (Tigo Pesa)',          icon: '📱' },
    { id: 'airtel',   label: 'Airtel Money',                     icon: '📱' },
    { id: 'halopesa', label: 'HaloPesa',                         icon: '📱' },
    { id: 'cash',     label: 'Cash on Delivery (Dar es Salaam)', icon: '💵' },
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
          {/* ── Itemized invoice ── */}
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
                      <button
                        onClick={() => decrease(i.id)}
                        className="w-8 h-8 hover:bg-gray-100"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={i.quantity}
                        onChange={e => updateQty(i.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center border-l border-r focus:outline-none"
                      />
                      <button
                        onClick={() => increase(i.id)}
                        className="w-8 h-8 hover:bg-gray-100"
                      >+</button>
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

          {/* ── Totals + Payment methods side by side ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Totals box */}
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

            {/* Payment methods */}
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
                    <span className="text-base">{pm.icon}</span>
                    <span>{pm.label}</span>
                  </label>
                ))}
              </div>

              {/* Dynamic instructions */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900">
                {paymentMethod === 'whatsapp' && (
                  <>Click <strong>Order via WhatsApp</strong> below — we'll confirm price, delivery, and payment on chat.</>
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

          {/* ── Actions ── */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 md:justify-end">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white uppercase tracking-widest hover:bg-green-700 text-center flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
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
            🔒 Secure ordering · We'll contact you to confirm · Payment: {paymentMethod.toUpperCase()}
          </p>
        </>
      )}

      {msg && (
        <p className="mt-6 text-center text-sm text-red-600">{msg}</p>
      )}
    </div>
  );
}