import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600'
];

export default function Hero() {
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [current, setCurrent] = useState(0);

  // Load trending product images
  useEffect(() => {
    api.get('/products/trending')
      .then(res => {
        const urls = res.data
          .map(p => p.images?.[0])
          .filter(Boolean);
        if (urls.length > 0) setImages(urls);
      })
      .catch(() => {});
  }, []);

  // Auto rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      {/* Background layers */}
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Slide ${i}`}
            className="w-full h-full object-cover"
            style={{
              transform: i === current ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 6s ease-out'
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-5xl md:text-7xl font-light tracking-wide">
          New Season Essentials
        </h1>
        <p className="mt-4 text-lg md:text-xl font-light">
          Discover the latest in fashion
        </p>
        <Link
          to="/shop"
          className="mt-8 px-10 py-4 bg-white text-black text-sm tracking-widest uppercase hover:bg-black hover:text-white transition"
        >
          Shop Now
        </Link>

        {/* Slide indicators */}
        <div className="absolute bottom-8 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all ${
                i === current ? 'w-8 bg-white' : 'w-4 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}