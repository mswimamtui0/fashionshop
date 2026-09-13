import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';

const API_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://fashionshop1.onrender.com');

const SELLER_WHATSAPP = '255757170544';
const SELLER_MPESA   = '0757 170 544';

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/600';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [justAdded, setJustAdded] = useState(false);
  const { add, count, total: cartTotal } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
    api.get(`/variants/product/${id}`).then(res => {
      setVariants(res.data);
      if (res.data.length > 0) setSelectedVariant(res.data[0]);
    }).catch(() => {});
  }, [id]);

  if (!product) return <p className="p-12">Loading...</p>;

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600'];
  const currentPrice = selectedVariant?.price || product.price || 0;
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.stock || 0;
  const total = qty * currentPrice;

  const decrease = () => setQty(q => Math.max(1, q - 1));
  const increase = () => setQty(q => Math.min(currentStock || 99, q + 1));

  const whatsappMessage = encodeURIComponent(
    `Habari! Nataka kununua:\n\n` +
    `ðŸ“¦ ${product.name}\n` +
    (selectedVariant
      ? `ðŸŽ¨ ${selectedVariant.color}${selectedVariant.size ? ` Â· ${selectedVariant.size}` : ''}\n`
      : '') +
    `ðŸ’° Price: TZS ${Number(currentPrice).toLocaleString()}\n` +
    `ðŸ”¢ Quantity: ${qty}\n` +
    `ðŸ’µ Total: TZS ${total.toLocaleString()}\n\n` +
    `Naomba kujadiliana zaidi. Asante!`
  );
  const whatsappLink = `https://wa.me/${SELLER_WHATSAPP}?text=${whatsappMessage}`;

  const handleAddToCart = () => {
    add({
      ...product,
      price: currentPrice,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant
        ? `${selectedVariant.color}${selectedVariant.size ? ` / ${selectedVariant.size}` : ''}`
        : null
    }, qty);

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">

        {/* â”€â”€ Gallery â”€â”€ */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="w-full max-w-[420px] mx-auto">
            <img
              src={getImageUrl(images[activeImage])}
              alt={product.name}
              className="w-full max-h-[520px] object-cover rounded-sm"
              onError={e => { e.target.src = 'https://via.placeholder.com/600'; }}
            />
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden border-2 ${
                      i === activeImage ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`thumb ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* â”€â”€ Details â”€â”€ */}
        <div>
          <h1 className="text-2xl md:text-3xl font-light">{product.name}</h1>
          <p className="mt-3 text-xl md:text-2xl">TZS {currentPrice.toLocaleString()}</p>
          <p className="mt-5 text-sm md:text-base text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* â”€â”€ Variants â”€â”€ */}
          {variants.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Choose color / size
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOut = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQty(1); }}
                      disabled={isOut}
                      className={`px-3 py-2 border text-xs md:text-sm flex flex-col items-center min-w-[90px] ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : isOut
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      <span>{v.color}{v.size ? ` / ${v.size}` : ''}</span>
                      <span className={`text-[10px] mt-1 ${
                        isSelected ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {isOut ? 'Out of stock' : `${v.stock} available`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* â”€â”€ Quantity â”€â”€ */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-gray-500">Quantity</span>
            <div className="flex items-center border border-gray-300">
              <button onClick={decrease} className="w-9 h-9 text-lg hover:bg-gray-100">âˆ’</button>
              <input
                type="number"
                min="1"
                max={currentStock || 99}
                value={qty}
                onChange={e => setQty(Math.max(1, Math.min(currentStock || 99, parseInt(e.target.value) || 1)))}
                className="w-14 h-9 text-center border-l border-r border-gray-300 focus:outline-none text-sm"
              />
              <button onClick={increase} className="w-9 h-9 text-lg hover:bg-gray-100">+</button>
            </div>
          </div>

          {/* â”€â”€ Price summary â”€â”€ */}
          <div className="mt-5 p-3 bg-gray-50 border border-gray-200 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>TZS {(currentPrice * qty).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span>TZS {total.toLocaleString()}</span>
            </div>
          </div>

          {/* â”€â”€ PAYMENT METHODS â”€â”€ */}
          <div className="mt-6 border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              How would you like to pay?
            </p>

            <div className="space-y-2">
              {[
                { id: 'whatsapp', label: 'Order on WhatsApp & negotiate',    icon: 'ðŸ’¬' },
                { id: 'mpesa',    label: 'M-Pesa (Vodacom)',                 icon: 'ðŸ“±' },
                { id: 'tigopesa', label: 'Mixx by Yas (Tigo Pesa)',          icon: 'ðŸ“±' },
                { id: 'airtel',   label: 'Airtel Money',                     icon: 'ðŸ“±' },
                { id: 'halopesa', label: 'HaloPesa',                         icon: 'ðŸ“±' },
                { id: 'cash',     label: 'Cash on Delivery (Dar es Salaam)', icon: 'ðŸ’µ' },
              ].map(pm => (
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

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-xs md:text-sm text-blue-900">
              {paymentMethod === 'whatsapp' && (
                <>Click <strong>Order via WhatsApp</strong> below â€” chat directly with us to confirm price, delivery, and payment.</>
              )}
              {paymentMethod === 'mpesa' && (
                <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>M-Pesa {SELLER_MPESA}</strong> (Name: FASHIONSHOP). Then click <strong>Order via WhatsApp</strong> and share the confirmation code.</>
              )}
              {paymentMethod === 'tigopesa' && (
                <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>Mixx by Yas {SELLER_MPESA}</strong>. Then click <strong>Order via WhatsApp</strong> with the confirmation SMS.</>
              )}
              {paymentMethod === 'airtel' && (
                <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>Airtel Money {SELLER_MPESA}</strong>. Then click <strong>Order via WhatsApp</strong> with the confirmation code.</>
              )}
              {paymentMethod === 'halopesa' && (
                <>Send <strong>TZS {total.toLocaleString()}</strong> to <strong>HaloPesa {SELLER_MPESA}</strong>. Then click <strong>Order via WhatsApp</strong> with the confirmation code.</>
              )}
              {paymentMethod === 'cash' && (
                <>Pay cash on delivery. Available only in <strong>Dar es Salaam</strong>. Click <strong>Order via WhatsApp</strong> to schedule delivery.</>
              )}
            </div>
          </div>

          {/* â”€â”€ ADD TO CART â€” with green confirmation â”€â”€ */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className={`mt-5 w-full py-3.5 text-sm uppercase tracking-widest transition ${
              currentStock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : justAdded
                ? 'bg-green-600 text-white'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {currentStock === 0
              ? 'Out of Stock'
              : justAdded
              ? `âœ… Added ${qty} to Cart`
              : `Add ${qty} to Cart`}
          </button>

          {/* Live cart summary after adding */}
          {count > 0 && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 text-sm flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-gray-500">ðŸ›’ In your cart: </span>
                <strong>{count} item{count !== 1 ? 's' : ''}</strong>
                <span className="text-gray-500"> Â· </span>
                <strong>TZS {cartTotal.toLocaleString()}</strong>
              </div>
              <Link
                to="/cart"
                className="text-xs uppercase tracking-wider underline hover:no-underline"
              >
                Go to Cart â†’
              </Link>
            </div>
          )}

          {/* WhatsApp order button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-3.5 text-sm bg-green-600 text-white uppercase tracking-widest hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Order via WhatsApp
          </a>

          <p className="mt-3 text-xs text-gray-500 text-center">
            ðŸ”’ Secure ordering Â· We'll contact you to confirm
          </p>
        </div>
      </div>
    </div>
  );
}