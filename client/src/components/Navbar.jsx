import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const ADMIN_PHONE = '255757170544';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, total } = useCart();

  const isAdmin = user?.phone === ADMIN_PHONE;

  const handleLogout = () => {
    logout();                     // clears token, user, cart from localStorage + fires auth:logout event
    window.location.href = '/';   // full reload → resets CartProvider and AuthProvider
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="text-2xl font-light tracking-widest uppercase">
          Fashion<span className="font-bold">Shop</span>
        </Link>

        {/* Main nav */}
        <div className="hidden md:flex gap-6 text-sm uppercase tracking-wider">
          <Link to="/"                    className="hover:text-gray-500">Home</Link>
          <Link to="/shop"                className="hover:text-gray-500">Shop</Link>
          <Link to="/shop?category=women" className="hover:text-gray-500">Women</Link>
          <Link to="/shop?category=men"   className="hover:text-gray-500">Men</Link>
          <Link to="/shop?category=kids"  className="hover:text-gray-500">Kids</Link>
          <Link to="/shop?category=shoes" className="hover:text-gray-500">Shoes</Link>
          <Link to="/shop?category=bags"  className="hover:text-gray-500">Bags</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm uppercase tracking-wider">
          <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
            <span>🛒 Cart</span>
            {count > 0 && (
              <>
                <span className="bg-black text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                  {count}
                </span>
                <span className="hidden md:inline text-xs text-gray-500 normal-case">
                  TZS {total.toLocaleString()}
                </span>
              </>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/account" className="hover:text-gray-500">My Account</Link>
              {isAdmin && <Link to="/admin" className="hover:text-gray-500">Admin</Link>}
              <button onClick={handleLogout} className="hover:text-gray-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="hover:text-gray-500">Login</Link>
              <Link to="/register" className="hover:text-gray-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}