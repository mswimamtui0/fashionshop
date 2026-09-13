import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600',
];

const ROTATE_MS = 5000;   // change image every 5 seconds

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // 1. Load products from the backend
  useEffect(() => {
    api.get('/products/latest?limit=8')
      .then(res => {
        const images = (res.data || [])
          .map(p => p.images?.[0])
          .filter(Boolean)
          .map(getImageUrl);

        setSlides(images.length > 0 ? images : FALLBACK_IMAGES);
      })
      .catch(() => setSlides(FALLBACK_IMAGES))
      .finally(() => setLoaded(true));
  }, []);

  // 2. Rotate the active image every ROTATE_MS
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 3. Preload the next image so rotation is smooth (no flash)
  useEffect(() => {
    if (slides.length === 0) return;
    const next = (current + 1) % slides.length;
    const img = new Image();
    img.src = slides[next];
  }, [current, slides]);

  if (!loaded || slides.length === 0) {
    return <section className="relative h-[55vh] min-h-[380px] bg-gray-900" />;
  }

  return (
    <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-black">

      {/* Layer of images, cross-faded */}
      {slides.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full h-full object-cover"
            style={{
              transform: i === current ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 6s ease-out',
            }}
            onError={e => {
              e.target.src = FALLBACK_IMAGES[0];
            }}
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Center text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <p className="text-xs md:text-sm tracking-[0.35em] uppercase mb-3 opacity-90">
          FashionShop
        </p>
        <h1 className="text-4xl md:text-6xl font-light tracking-wide max-w-3xl">
          New Season Essentials
        </h1>
        <p className="mt-3 text-sm md:text-base font-light opacity-90">
          Discover the latest in fashion
        </p>

        <Link
          to="/shop"
          className="mt-6 px-8 py-3 bg-white text-black text-sm tracking-widest uppercase hover:bg-gray-200 transition"
        >
          Shop Now
        </Link>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 transition-all ${
                  i === current ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}