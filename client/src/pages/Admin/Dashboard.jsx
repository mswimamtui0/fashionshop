import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <p className="p-12">Loading dashboard...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Customers" value={data.totalCustomers} />
        <Stat label="Products" value={data.totalProducts} />
        <Stat label="Orders" value={data.totalOrders} />
        <Stat label="Revenue (TZS)" value={data.revenue.toLocaleString()} />
      </div>
      <h2 className="text-xl mb-4">Top 10 Most Viewed Products</h2>
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