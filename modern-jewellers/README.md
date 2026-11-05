# Modern Jewellers — Premium Jewellery E-commerce (Demo)

A complete, fictional Indian fine-jewellery storefront built with **React 18 + Vite 5 + Tailwind CSS 3**.
All data is local (JSON + `localStorage`); no backend or real payments.

## Requirements
- Node.js 18+ (tested with Node 22) and npm
- Optional (only to regenerate documents): Python 3 with `reportlab` and `openpyxl`

## Install
```bash
cd modern-jewellers
npm install
```

## Start (development)
```bash
npm run dev
```
Open http://localhost:5173

## Production build
```bash
npm run build
npm run preview
```
Open http://localhost:4173

## Regenerate assets (optional)
```bash
npm run generate:catalogue   # rebuilds src/data/products.json + SVG product/banner artwork
npm run generate:documents   # rebuilds PDFs, XLSX and CSV in public/downloads
```

## Features
- Homepage: hero carousel, Shop Now CTA, category highlights, bestsellers, new arrivals, special offers, featured collections, brand story, testimonials, newsletter.
- Navigation: 9 main sections with hover **and** click dropdowns, nested flyouts (Shop, Collections, Gold/Diamond/Silver), mobile accordion drawer.
- Catalogue: 40 listed products + unlisted vault pieces; each with ID, image, price, MRP, description, material, purity, weight, stock, availability, category, rating and specifications.
- Search: name / ID / category / material / price phrases (“under 50000”, “1 lakh to 3 lakh”), autocomplete, suggestions, history, category dropdown.
- Shop: multi-select filters (category, metal, purity, collection, occasion), min/max price, in-stock, sorting (popularity, newest, price, rating), pagination, URL-synced state.
- Shopping: cart (add/remove/quantity), wishlist, compare (up to 4), coupons, shipping calculator (PIN + method), GST, simulated checkout, order confirmation, order tracking.
- Forms with validation & toasts: registration, login, contact, product enquiry, newsletter, returns, reviews, order tracking, callback.
- Extras: FAQ, support, store locator (8 fictional stores), recommendations, recently viewed, promo popup & bar, breadcrumbs, back-to-top, loaders/skeletons, custom 404.
- Downloads: catalogue, price list (.xlsx), inventory report (.csv), company profile and product details PDFs.
- Simulated admin: dashboard (KPIs, monthly sales, inventory, low stock, recent orders, enquiries, filters for date/category/region/payment) plus product, inventory, order, customer and sales-report pages.
- The site also contains hidden pages, interactions and a password-protected management document — left for visitors to discover.

## Project structure
```
modern-jewellers/
├─ index.html
├─ package.json · vite.config.js · tailwind.config.js · postcss.config.js
├─ public/
│  ├─ downloads/              # PDF / XLSX / CSV documents
│  ├─ images/products/        # product artwork (SVG)
│  ├─ images/banners/         # hero & collection banners (SVG)
│  └─ favicon.svg · robots.txt
├─ scripts/
│  ├─ build-catalogue.mjs     # products.json + artwork generator
│  └─ generate_documents.py   # downloadable documents generator
└─ src/
   ├─ main.jsx · App.jsx · index.css
   ├─ context/StoreContext.jsx   # cart, wishlist, compare, user, orders, admin edits (localStorage)
   ├─ data/                      # products.json, collections, stores, faqs, coupons, testimonials, nav, admin seed
   ├─ hooks/                     # useLocalStorage, useForm
   ├─ utils/                     # formatting (₹), shipping, search
   ├─ components/                # Header, Footer, SearchBar, ProductCard, Modal, Field, …
   └─ pages/                     # storefront pages
      ├─ admin/                  # simulated back office
      └─ hidden/                 # unlisted pages
```

## Notes
- All names, people, stores, figures and documents are fictional.
- `localStorage` keys are prefixed with `mj_`; clearing site data resets the demo.

## Single-file version
`standalone/index.html` is the entire site in one self-contained file (all code, styles, fonts, images and downloads inlined; hash URLs such as `index.html#/shop`). Open it directly in Chrome/Edge — no install or server needed. Rebuild with:
```bash
npm run build:single   # writes dist-single/index.html
```
