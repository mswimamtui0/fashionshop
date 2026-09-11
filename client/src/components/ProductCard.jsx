import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div className="mt-3 text-sm">
        <h3>{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-medium">TZS {product.price?.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through">
              TZS {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}