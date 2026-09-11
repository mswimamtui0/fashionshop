import { useState, useEffect } from 'react';
import api from '../../api/axios.js';

export default function SMS() {
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');
  const [logs, setLogs] = useState([]);

  const loadLogs = () =>
    api.get('/sms/logs').then(r => setLogs(r.data)).catch(() => {});

  useEffect(() => { loadLogs(); }, []);

  const send = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sms/send', { message });
      setMsg(`✅ Sent to ${res.data.sent} customers`);
      setMessage('');
      loadLogs();
    } catch (e) {
      setMsg('⚠️ ' + (e.response?.data?.error || 'Failed'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light mb-8">Bulk SMS Panel</h1>
      <form onSubmit={send} className="border p-6 mb-10">
        <textarea
          placeholder="Write your SMS message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full border px-3 py-2"
        />
        <button className="mt-4 px-8 py-3 bg-black text-white uppercase tracking-widest">
          Send to All Customers
        </button>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </form>

      <h2 className="text-xl mb-4">Recent SMS Logs</h2>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left">
            <th className="py-2">Message</th>
            <th className="py-2">Recipients</th>
            <th className="py-2">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id} className="border-b">
              <td className="py-2">{l.message.slice(0, 60)}...</td>
              <td className="py-2">{l.recipients}</td>
              <td className="py-2">{new Date(l.sentAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}