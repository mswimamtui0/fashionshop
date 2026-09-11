import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';

export default function Shop() {
  const [params] = useSearchParams();
  const category = params.get('category');
  const sort = params.get('sort');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8 tracking-wide capitalize">
        {category || 'All Products'}
      </h1>
      <ProductGrid title="" category={category} sort={sort} />
    </div>
  );
}