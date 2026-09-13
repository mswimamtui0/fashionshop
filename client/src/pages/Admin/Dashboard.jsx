import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <p className="p-12">Loading dashboard...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-3xl font-light">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/bulk"
            className="px-6 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
          >
            Bulk Upload
          </Link>
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          to="/admin"
          className="px-5 py-2 border border-black bg-black text-white text-sm uppercase tracking-widest"
        >
          Dashboard
        </Link>
        <Link
          to="/admin/products"
          className="px-5 py-2 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
        >
          Products
        </Link>
        <Link
          to="/admin/bulk"
          className="px-5 py-2 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
        >
          Bulk Upload
        </Link>
        <Link
          to="/admin/sms"
          className="px-5 py-2 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
        >
          Send SMS
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Customers" value={data.totalCustomers} />
        <Stat label="Products" value={data.totalProducts} />
        <Stat label="Orders" value={data.totalOrders} />
        <Stat label="Revenue (TZS)" value={data.revenue.toLocaleString()} />
      </div>

      {/* Top viewed */}
      <h2 className="text-xl mb-4">Top 10 Most Viewed Products</h2>
      {data.topViewed.length === 0 ? (
        <div className="border border-dashed p-10 text-center text-gray-500">
          <p>No products yet.</p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <Link
              to="/admin/products"
              className="inline-block px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800"
            >
              Upload your first product
            </Link>
            <Link
              to="/admin/bulk"
              className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition"
            >
              Bulk upload many
            </Link>
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">Product</th>
              <th className="py-2">Category</th>
              <th className="py-2">Views</th>
            </tr>
          </thead>
          <tbody>
            {data.topViewed.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.category}</td>
                <td className="py-2">{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-2xl mt-2">{value}</p>
    </div>
  );
}