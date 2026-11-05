import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import rawProducts from '../data/products.json';
import { photo } from '../data/photos';
import coupons from '../data/coupons.json';
import useLocalStorage from '../hooks/useLocalStorage';
import { calcShipping, GST_RATE } from '../utils/format';

const StoreContext = createContext(null);
const baseProducts = rawProducts.map((p) => ({ ...p, image: photo(p.image), fallbackImage: p.image }));
let toastId = 0;

export function StoreProvider({ children }) {
  const [cart, setCart] = useLocalStorage('mj_cart', []);
  const [wishlist, setWishlist] = useLocalStorage('mj_wishlist', []);
  const [compare, setCompare] = useLocalStorage('mj_compare', []);
  const [recent, setRecent] = useLocalStorage('mj_recently_viewed', []);
  const [searchHistory, setSearchHistory] = useLocalStorage('mj_search_history', []);
  const [user, setUser] = useLocalStorage('mj_user', null);
  const [users, setUsers] = useLocalStorage('mj_users', []);
  const [orders, setOrders] = useLocalStorage('mj_orders', []);
  const [prefs, setPrefs] = useLocalStorage('mj_prefs', { shippingMethod: 'standard', pincode: '' });
  const [coupon, setCoupon] = useLocalStorage('mj_coupon', null);
  const [secrets, setSecrets] = useLocalStorage('mj_secrets', { found: [], priveNav: false });
  const [submissions, setSubmissions] = useLocalStorage('mj_submissions', { contact: [], enquiries: [], returns: [], newsletter: [] });
  const [reviews, setReviews] = useLocalStorage('mj_reviews', {});
  const [admin, setAdmin] = useLocalStorage('mj_admin', { edits: {}, added: [], deleted: [], orderStatus: {} });
  const [toasts, setToasts] = useState([]);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);

  /* ---------- toasts ---------- */
  const notify = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------- products (with admin overrides) ---------- */
  const allProducts = useMemo(() => {
    const list = [...baseProducts, ...admin.added]
      .filter((p) => !admin.deleted.includes(p.id))
      .map((p) => {
        const e = admin.edits[p.id];
        if (!e) return p;
        const merged = { ...p, ...e };
        merged.availability = merged.stock <= 0 ? 'Out of Stock' : merged.stock <= 3 ? 'Only a Few Left' : 'In Stock';
        merged.discountPercent = merged.mrp > merged.price ? Math.round(((merged.mrp - merged.price) / merged.mrp) * 100) : 0;
        return merged;
      });
    return list;
  }, [admin]);
  const products = useMemo(() => allProducts.filter((p) => !p.hidden), [allProducts]);
  const getProduct = useCallback((id) => allProducts.find((p) => p.id.toLowerCase() === String(id).toLowerCase()), [allProducts]);

  /* ---------- cart ---------- */
  const addToCart = (id, qty = 1, size = '') => {
    const p = getProduct(id);
    if (!p) return;
    if (p.stock <= 0) return notify(`${p.name} is currently out of stock`, 'error');
    setCart((c) => {
      const ex = c.find((x) => x.id === id && x.size === size);
      if (ex) return c.map((x) => (x === ex ? { ...x, qty: Math.min(p.stock, x.qty + qty) } : x));
      return [...c, { id, qty: Math.min(qty, p.stock), size }];
    });
    notify(`${p.name} added to your bag`);
  };
  const updateQty = (id, size, qty) => {
    const p = getProduct(id);
    setCart((c) => c.map((x) => (x.id === id && x.size === size ? { ...x, qty: Math.max(1, Math.min(p?.stock || 1, qty)) } : x)));
  };
  const removeFromCart = (id, size) => {
    setCart((c) => c.filter((x) => !(x.id === id && x.size === size)));
    notify('Item removed from your bag', 'info');
  };
  const clearCart = () => setCart([]);

  const cartItems = useMemo(
    () => cart.map((x) => ({ ...x, product: getProduct(x.id) })).filter((x) => x.product),
    [cart, getProduct],
  );
  const subtotal = cartItems.reduce((s, x) => s + x.product.price * x.qty, 0);
  const cartCount = cartItems.reduce((s, x) => s + x.qty, 0);

  const couponInfo = coupon ? coupons.find((c) => c.code === coupon) : null;
  let discount = 0;
  if (couponInfo && subtotal >= couponInfo.min) {
    discount = couponInfo.type === 'percent' ? Math.round((subtotal * couponInfo.value) / 100) : couponInfo.value;
  }
  const shipping = calcShipping(subtotal - discount, prefs.shippingMethod, prefs.pincode);
  const gst = Math.round((subtotal - discount) * GST_RATE);
  const total = Math.max(0, subtotal - discount + shipping + gst);
  const totals = { subtotal, discount, shipping, gst, total, couponInfo };

  const applyCoupon = (code) => {
    const c = coupons.find((x) => x.code === code.trim().toUpperCase());
    if (!c) return notify('That coupon code is not valid', 'error'), false;
    if (subtotal < c.min) return notify(`${c.code} requires a minimum order of ₹${c.min.toLocaleString('en-IN')}`, 'error'), false;
    setCoupon(c.code);
    notify(`Coupon ${c.code} applied — ${c.label}`);
    if (c.secret) discover('coupon-goldroom');
    return true;
  };
  const removeCoupon = () => setCoupon(null);

  /* ---------- wishlist / compare / recent ---------- */
  const toggleWishlist = (id) => {
    const p = getProduct(id);
    if (wishlist.includes(id)) {
      setWishlist((w) => w.filter((x) => x !== id));
      notify(`${p?.name} removed from wishlist`, 'info');
    } else {
      setWishlist((w) => (w.includes(id) ? w : [...w, id]));
      notify(`${p?.name} saved to wishlist`);
    }
  };
  const toggleCompare = (id) => {
    if (compare.includes(id)) return setCompare((c) => c.filter((x) => x !== id));
    if (compare.length >= 4) return notify('You can compare up to 4 pieces at a time', 'error');
    setCompare((c) => (c.includes(id) ? c : [...c, id]));
    notify('Added to comparison');
  };
  const addRecent = useCallback((id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 12)), [setRecent]);
  const addSearch = (q) => {
    const s = q.trim();
    if (!s) return;
    setSearchHistory((h) => [s, ...h.filter((x) => x.toLowerCase() !== s.toLowerCase())].slice(0, 8));
  };

  /* ---------- auth ---------- */
  const register = (data) => {
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      notify('An account with this email already exists', 'error');
      return false;
    }
    const u = { ...data, id: `MJ-CUS-${Date.now().toString().slice(-6)}`, joined: new Date().toISOString() };
    setUsers((x) => [...x, u]);
    const { password, ...safe } = u;
    setUser(safe);
    notify(`Welcome to Modern Jewellers, ${data.firstName}!`);
    return true;
  };
  const login = (email, password) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) {
      notify('Incorrect email or password', 'error');
      return false;
    }
    const { password: _p, ...safe } = u;
    setUser(safe);
    notify(`Welcome back, ${u.firstName}!`);
    return true;
  };
  const logout = () => {
    setUser(null);
    notify('You have been signed out', 'info');
  };

  /* ---------- orders ---------- */
  const placeOrder = (details) => {
    const id = `MJ-ORD-${Math.floor(300000 + Math.random() * 600000)}`;
    const order = {
      id,
      date: new Date().toISOString(),
      items: cartItems.map((x) => ({ id: x.id, name: x.product.name, price: x.product.price, qty: x.qty, size: x.size, image: x.product.image, category: x.product.category })),
      ...totals,
      couponCode: couponInfo?.code || null,
      couponInfo: undefined,
      ...details,
      customer: `${details.firstName} ${details.lastName}`,
      region: details.region || 'West',
      paymentStatus: details.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      status: 'Processing',
    };
    setOrders((o) => [order, ...o]);
    clearCart();
    setCoupon(null);
    return order;
  };

  /* ---------- submissions & reviews ---------- */
  const submit = (kind, data) => {
    const entry = { ...data, id: `${kind.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`, date: new Date().toISOString(), status: 'Open' };
    setSubmissions((s) => ({ ...s, [kind]: [entry, ...(s[kind] || [])] }));
    return entry;
  };
  const addReview = (productId, review) =>
    setReviews((r) => ({ ...r, [productId]: [{ ...review, date: new Date().toISOString() }, ...(r[productId] || [])] }));

  /* ---------- secrets ---------- */
  const discover = useCallback(
    (key) => setSecrets((s) => (s.found.includes(key) ? s : { ...s, found: [...s.found, key] })),
    [setSecrets],
  );
  const unlockPrive = () => {
    setSecrets((s) => ({ ...s, priveNav: true }));
    discover('prive-nav');
  };

  /* ---------- admin ---------- */
  const adminEditProduct = (id, patch) => setAdmin((a) => ({ ...a, edits: { ...a.edits, [id]: { ...(a.edits[id] || {}), ...patch } } }));
  const adminAddProduct = (p) => setAdmin((a) => ({ ...a, added: [...a.added, p] }));
  const adminDeleteProduct = (id) => setAdmin((a) => ({ ...a, deleted: [...a.deleted, id] }));
  const adminSetOrderStatus = (id, status) => setAdmin((a) => ({ ...a, orderStatus: { ...a.orderStatus, [id]: status } }));
  const adminReset = () => setAdmin({ edits: {}, added: [], deleted: [], orderStatus: {} });

  const value = {
    products, allProducts, getProduct,
    cart, cartItems, cartCount, addToCart, updateQty, removeFromCart, clearCart, totals, applyCoupon, removeCoupon, coupon,
    wishlist, toggleWishlist, compare, toggleCompare, setCompare, recent, addRecent,
    searchHistory, addSearch, clearSearchHistory: () => setSearchHistory([]),
    user, users, register, login, logout, setUser,
    orders, placeOrder,
    prefs, setPrefs,
    secrets, discover, unlockPrive,
    submissions, submit, reviews, addReview,
    admin, adminEditProduct, adminAddProduct, adminDeleteProduct, adminSetOrderStatus, adminReset,
    toasts, notify, dismissToast,
    controlPanelOpen, setControlPanelOpen,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
