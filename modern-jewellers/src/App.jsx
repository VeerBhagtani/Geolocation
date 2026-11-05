import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PromoBar from './components/PromoBar';
import Toasts from './components/Toasts';
import BackToTop from './components/BackToTop';
import PromoPopup from './components/PromoPopup';
import ControlPanel from './components/ControlPanel';
import CompareBar from './components/CompareBar';
import Loader from './components/Loader';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Collections = lazy(() => import('./pages/Collections'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const Offers = lazy(() => import('./pages/Offers'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Returns = lazy(() => import('./pages/Returns'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Support = lazy(() => import('./pages/Support'));
const StoreLocator = lazy(() => import('./pages/StoreLocator'));
const Downloads = lazy(() => import('./pages/Downloads'));
const NotFound = lazy(() => import('./pages/NotFound'));
// Hidden pages (not linked from the main navigation)
const SecretPage = lazy(() => import('./pages/hidden/SecretPage'));
const ConfidentialDocument = lazy(() => import('./pages/hidden/ConfidentialDocument'));
const HiddenCatalogue = lazy(() => import('./pages/hidden/HiddenCatalogue'));
const SecretDownloads = lazy(() => import('./pages/hidden/SecretDownloads'));
const HiddenMessages = lazy(() => import('./pages/hidden/HiddenMessages'));
const GoldRoom = lazy(() => import('./pages/hidden/GoldRoom'));
// Simulated administration
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {!isAdmin && <PromoBar />}
      {!isAdmin && <Header />}
      <main className="flex-1" id="main">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/gold-jewellery" element={<Shop presetMetal="Gold" />} />
            <Route path="/diamond-jewellery" element={<Shop presetMetal="Diamond" />} />
            <Route path="/silver-jewellery" element={<Shop presetMetal="Silver" />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:slug" element={<CollectionDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/stores" element={<StoreLocator />} />
            <Route path="/downloads" element={<Downloads />} />

            <Route path="/atelier-secret" element={<SecretPage />} />
            <Route path="/confidential/management-document" element={<ConfidentialDocument />} />
            <Route path="/vault/private-catalogue" element={<HiddenCatalogue />} />
            <Route path="/vault/downloads" element={<SecretDownloads />} />
            <Route path="/whispers" element={<HiddenMessages />} />
            <Route path="/the-gold-room" element={<GoldRoom />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CompareBar />}
      {!isAdmin && <PromoPopup />}
      <BackToTop />
      <ControlPanel />
      <Toasts />
    </div>
  );
}
