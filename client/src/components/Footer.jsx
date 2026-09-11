import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">

        {/* Brand */}
        <div>
          <Link
            to="/"
            className="text-lg font-light tracking-widest uppercase"
          >
            Fashion<span className="font-bold">Shop</span>
          </Link>
          <p className="text-gray-400 mt-4">
            Quality fashion for every occasion.
          </p>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/shop?category=women" className="hover:text-white transition">
                Women
              </Link>
            </li>
            <li>
              <Link to="/shop?category=men" className="hover:text-white transition">
                Men
              </Link>
            </li>
            <li>
              <Link to="/shop?category=shoes" className="hover:text-white transition">
                Shoes
              </Link>
            </li>
            <li>
              <Link to="/shop?category=bags" className="hover:text-white transition">
                Bags
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-white transition">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Help links */}
        <div>
          <h4 className="uppercase tracking-wider mb-4">Help</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-white transition">
                Shipping
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-white transition">
                Returns
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition">
                My Cart
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        {/* Social links */}
        <div>
          <h4 className="uppercase tracking-wider mb-4">Follow</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/255712345678"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@yourshop.com"
                className="hover:text-white transition"
              >
                Email Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-10">
        © {year} FashionShop. All rights reserved.
      </div>
    </footer>
  );
}