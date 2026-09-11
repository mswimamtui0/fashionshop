import Hero from '../components/Hero.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Newsletter from '../components/Newsletter.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductGrid title="🔥 Trending Now" sort="popular" limit={8} />
      <ProductGrid title="✨ New Arrivals" limit={8} />
      <Newsletter />
    </>
  );
}