import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-light tracking-widest uppercase">
          Fashion<span className="font-bold">Shop</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm uppercase tracking-wider">
          <Link to="/" className="hover:text-gray-500">Home</Link>
          <Link to="/shop" className="hover:text-gray-500">Shop</Link>
          <Link to="/shop?category=women" className="hover:text-gray-500">Women</Link>
          <Link to="/shop?category=men" className="hover:text-gray-500">Men</Link>
          <Link to="/shop?category=shoes" className="hover:text-gray-500">Shoes</Link>
          <Link to="/shop?category=bags" className="hover:text-gray-500">Bags</Link>
        </div>

        <div className="flex items-center gap-5 text-sm uppercase tracking-wider">
          <Link to="/cart" className="relative">
            Cart
            {items.length > 0 && (
              <span className="absolute -top-2 -right-4 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/admin" className="hover:text-gray-500">Admin</Link>
              <button onClick={logout} className="hover:text-gray-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-500">Login</Link>
              <Link to="/register" className="hover:text-gray-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}