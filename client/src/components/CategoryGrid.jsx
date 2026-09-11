import { Link } from 'react-router-dom';

const categories = [
  { name: 'Women', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800' },
  { name: 'Men', img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800' },
  { name: 'Shoes', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800' },
  { name: 'Bags', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800' }
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-light text-center mb-12 tracking-wide">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(c => (
          <Link
            key={c.name}
            to={`/shop?category=${c.name.toLowerCase()}`}
            className="relative aspect-[3/4] overflow-hidden group"
          >
            <img
              src={c.img}
              alt={c.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/20 flex items-end p-6">
              <span className="text-white text-xl tracking-widest uppercase">
                {c.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}