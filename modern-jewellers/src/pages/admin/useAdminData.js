import { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { seedCustomers, seedEnquiries, seedOrders } from '../../data/adminSeed';

export const DATE_RANGES = [
  ['all', 'All time'],
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['90', 'Last 90 days'],
  ['ytd', 'Year to date (2026)'],
  ['q3', 'Q3 2026 (Jul–Sep)'],
];
export const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Mangalsutra', 'Bridal Sets', 'Accessories'];

export function inRange(dateStr, range) {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (range === 'ytd') return d.getFullYear() === now.getFullYear();
  if (range === 'q3') return d >= new Date(2026, 6, 1) && d < new Date(2026, 9, 1);
  return (now - d) / 864e5 <= Number(range);
}

export default function useAdminData() {
  const { orders, users, submissions, admin } = useStore();
  return useMemo(() => {
    const allOrders = [...orders, ...seedOrders]
      .map((o) => ({ ...o, status: admin.orderStatus[o.id] || o.status }))
      .sort((a, b) => b.date.localeCompare(a.date));
    const customers = [
      ...users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email, phone: u.phone, city: u.state, region: '—', tier: 'New', joined: u.joined, registered: true })),
      ...seedCustomers,
    ];
    const enquiries = [
      ...(submissions.enquiries || []).map((e) => ({ ...e, subject: e.subject || 'Product enquiry' })),
      ...(submissions.contact || []).map((e) => ({ ...e, subject: e.subject || 'Contact form' })),
      ...seedEnquiries,
    ].sort((a, b) => b.date.localeCompare(a.date));
    return { allOrders, customers, enquiries };
  }, [orders, users, submissions, admin.orderStatus]);
}

export function filterOrders(list, f) {
  return list.filter((o) =>
    inRange(o.date, f.range) &&
    (!f.category || o.items.some((i) => i.category === f.category)) &&
    (!f.region || o.region === f.region) &&
    (!f.payment || o.paymentStatus === f.payment),
  );
}

export function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
