// Deterministic fictional data for the simulated admin dashboard.
import products from './products.json';

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const rand = rng(1987);
const pick = (a) => a[Math.floor(rand() * a.length)];

const FIRST = ['Aarav', 'Vivaan', 'Aditi', 'Ishita', 'Kabir', 'Meera', 'Riya', 'Arjun', 'Sana', 'Nikhil', 'Tanvi', 'Dev', 'Kiara', 'Rahul', 'Pooja', 'Zara', 'Siddharth', 'Neha', 'Varun', 'Lakshmi', 'Imran', 'Diya', 'Harsh', 'Anjali'];
const LAST = ['Sharma', 'Iyer', 'Kapoor', 'Reddy', 'Khan', 'Mehta', 'Nair', 'Singh', 'Patel', 'Bose', 'Gupta', 'Menon', 'Joshi', 'Das', 'Rao', 'Chopra'];
const CITIES = [
  ['Mumbai', 'West'], ['Pune', 'West'], ['Ahmedabad', 'West'], ['New Delhi', 'North'], ['Jaipur', 'North'], ['Chandigarh', 'North'],
  ['Bengaluru', 'South'], ['Chennai', 'South'], ['Hyderabad', 'South'], ['Kochi', 'South'], ['Kolkata', 'East'], ['Bhubaneswar', 'East'],
];
export const REGIONS = ['North', 'South', 'East', 'West'];
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Refunded', 'Failed'];
export const ORDER_STATUSES = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const visible = products.filter((p) => !p.hidden);

export const seedCustomers = Array.from({ length: 48 }, (_, i) => {
  const [city, region] = pick(CITIES);
  const fn = pick(FIRST);
  const ln = pick(LAST);
  return {
    id: `MJ-CUS-${(5001 + i).toString()}`,
    name: `${fn} ${ln}`,
    email: `${fn}.${ln}${i}`.toLowerCase() + '@example.in',
    phone: `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
    city, region,
    tier: pick(['Gold', 'Silver', 'Platinum', 'Gold', 'Silver']),
    joined: new Date(2025, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)).toISOString(),
  };
});

export const seedOrders = Array.from({ length: 140 }, (_, i) => {
  const c = pick(seedCustomers);
  const items = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => {
    const p = pick(visible);
    return { id: p.id, name: p.name, price: p.price, qty: 1, category: p.category };
  });
  const month = Math.floor(rand() * 11); // Jan–Nov 2026
  const date = new Date(2026, month, 1 + Math.floor(rand() * 27), 10 + Math.floor(rand() * 9));
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const pay = rand() < 0.78 ? 'Paid' : pick(PAYMENT_STATUSES);
  const status = pay === 'Refunded' || pay === 'Failed' ? 'Cancelled' : month < 9 ? 'Delivered' : pick(ORDER_STATUSES.slice(0, 5));
  return {
    id: `MJ-ORD-${240100 + i}`,
    customer: c.name, email: c.email, phone: c.phone, city: c.city, region: c.region,
    items, total, date: date.toISOString(), paymentStatus: pay, status,
    paymentMethod: pick(['UPI', 'Credit Card', 'Net Banking', 'Cash on Delivery', 'EMI']),
  };
});
// A stable, well-known demo order for the tracking page
seedOrders[17] = { ...seedOrders[17], id: 'MJ-ORD-240117', email: 'ananya.iyer@example.in', phone: '+91 9876543210', customer: 'Ananya Iyer', status: 'Shipped', paymentStatus: 'Paid', date: new Date(2026, 10, 2, 12).toISOString() };

export const seedEnquiries = [
  { id: 'ENQ-3101', name: 'Shreya Kulkarni', email: 'shreya.k@example.in', subject: 'Custom engagement ring', message: 'Can the Celestia solitaire be made in rose gold with a 1 ct stone?', date: '2026-11-03T10:20:00', status: 'Open' },
  { id: 'ENQ-3102', name: 'Mohammed Aslam', email: 'aslam.m@example.in', subject: 'Gold exchange value', message: 'I have 40 g of old 22K jewellery. What value would I get in exchange?', date: '2026-11-02T16:05:00', status: 'Open' },
  { id: 'ENQ-3103', name: 'Divya Menon', email: 'divya.menon@example.in', subject: 'Bridal appointment', message: 'Requesting a bridal lounge appointment at Banjara Hills for 14 Nov.', date: '2026-11-01T11:45:00', status: 'Replied' },
  { id: 'ENQ-3104', name: 'Karan Bhatia', email: 'karan.b@example.in', subject: 'Delivery to Dubai', message: 'Do you ship the Rani Haar internationally?', date: '2026-10-30T09:10:00', status: 'Closed' },
];
