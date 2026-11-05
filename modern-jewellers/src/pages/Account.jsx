import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { formatDate, formatINR } from '../utils/format';

export default function Account() {
  const { user, logout, orders, wishlist, submissions } = useStore();
  if (!user) return <Navigate to="/login?redirect=/account" replace />;
  const mine = orders.filter((o) => o.email?.toLowerCase() === user.email.toLowerCase());
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'My Account' }]} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">My Account</p><h1 className="section-title">Namaste, {user.firstName}</h1></div>
        <button className="btn-outline btn-sm" onClick={logout}>Sign Out</button>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {[['Orders', mine.length, '#orders'], ['Wishlist', wishlist.length, '/wishlist'], ['Returns', (submissions.returns || []).filter((r) => r.email === user.email).length, '/returns'], ['Member ID', user.id, '#profile']].map(([l, v, to]) => (
          <Link key={l} to={to} className="card p-6 transition hover:shadow-luxe"><p className="label">{l}</p><p className="font-serif text-3xl text-champagne-700">{v}</p></Link>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section id="orders" className="card p-6">
          <h2 className="font-serif text-2xl">Order History</h2>
          {!mine.length ? <p className="mt-4 text-cocoa-500">No orders yet. <Link to="/shop" className="text-champagne-700 underline">Start shopping</Link></p> : (
            <div className="mt-4 overflow-x-auto">
              <table className="table-luxe">
                <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {mine.map((o) => (
                    <tr key={o.id}><td className="font-medium">{o.id}</td><td>{formatDate(o.date)}</td><td>{o.items.length}</td><td>{formatINR(o.total)}</td><td><span className="chip">{o.status}</span></td>
                      <td><Link to={`/track-order?order=${o.id}&contact=${encodeURIComponent(o.email)}`} className="text-xs text-champagne-700 underline">Track</Link></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section id="profile" className="card space-y-2 p-6 text-sm">
          <h2 className="font-serif text-2xl">Profile</h2>
          <p><span className="label inline">Name:</span> {user.title} {user.firstName} {user.lastName}</p>
          <p><span className="label inline">Email:</span> {user.email}</p>
          <p><span className="label inline">Mobile:</span> {user.phone}</p>
          <p><span className="label inline">State:</span> {user.state}</p>
          {user.dob && <p><span className="label inline">Birthday:</span> {formatDate(user.dob)}</p>}
          <p><span className="label inline">Interests:</span> {(user.interests || []).join(', ')}</p>
          <p><span className="label inline">Member since:</span> {formatDate(user.joined)}</p>
        </section>
      </div>
    </div>
  );
}
