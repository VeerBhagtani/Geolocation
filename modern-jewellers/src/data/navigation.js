export const SHOP_MENU = [
  { label: 'Rings', to: '/shop/rings', children: [
    { label: 'Gold Rings', to: '/shop/rings?metal=Gold' },
    { label: 'Diamond Rings', to: '/shop/rings?metal=Diamond' },
    { label: 'Silver Rings', to: '/shop/rings?metal=Silver' },
    { label: 'Engagement Rings', to: '/shop/rings?occasion=Bridal' },
  ] },
  { label: 'Necklaces', to: '/shop/necklaces', children: [
    { label: 'Gold Necklaces', to: '/shop/necklaces?metal=Gold' },
    { label: 'Diamond Necklaces', to: '/shop/necklaces?metal=Diamond' },
    { label: 'Silver Necklaces', to: '/shop/necklaces?metal=Silver' },
    { label: 'Chokers & Haars', to: '/shop/necklaces?collection=royal' },
  ] },
  { label: 'Earrings', to: '/shop/earrings', children: [
    { label: 'Jhumkas & Chandbalis', to: '/shop/earrings?metal=Gold' },
    { label: 'Diamond Studs & Drops', to: '/shop/earrings?metal=Diamond' },
    { label: 'Silver Hoops', to: '/shop/earrings?metal=Silver' },
  ] },
  { label: 'Bracelets', to: '/shop/bracelets', children: [
    { label: 'Gold Bracelets', to: '/shop/bracelets?metal=Gold' },
    { label: 'Tennis Bracelets', to: '/shop/bracelets?metal=Diamond' },
    { label: 'Charm Bracelets', to: '/shop/bracelets?metal=Silver' },
  ] },
  { label: 'Bangles', to: '/shop/bangles', children: [
    { label: 'Gold Bangles & Kadas', to: '/shop/bangles?metal=Gold' },
    { label: 'Diamond Bangles', to: '/shop/bangles?metal=Diamond' },
    { label: 'Silver Bangles', to: '/shop/bangles?metal=Silver' },
  ] },
  { label: 'Mangalsutra', to: '/shop/mangalsutra', children: [
    { label: 'Diamond Mangalsutra', to: '/shop/mangalsutra?metal=Diamond' },
    { label: 'Traditional Gold', to: '/shop/mangalsutra?metal=Gold' },
  ] },
  { label: 'Bridal Jewellery', to: '/shop?occasion=Bridal', children: [
    { label: 'Bridal Sets', to: '/shop/bridal-sets' },
    { label: 'Maang Tikka & Accessories', to: '/shop/accessories?occasion=Bridal' },
    { label: 'Bridal Bangles', to: '/shop/bangles?occasion=Bridal' },
    { label: 'Engagement & Wedding Rings', to: '/shop/rings?occasion=Bridal' },
  ] },
  { label: 'Daily Wear Jewellery', to: '/shop?occasion=Daily%20Wear', children: [
    { label: 'Lightweight Gold', to: '/shop?occasion=Daily%20Wear&metal=Gold' },
    { label: 'Everyday Diamonds', to: '/shop?occasion=Daily%20Wear&metal=Diamond' },
    { label: 'Sterling Silver', to: '/shop?occasion=Daily%20Wear&metal=Silver' },
    { label: 'Under ₹30,000', to: '/shop?occasion=Daily%20Wear&max=30000' },
  ] },
];

const metalMenu = (metal, base) => [
  { label: 'Rings', to: `${base}?category=Rings` },
  { label: 'Necklaces', to: `${base}?category=Necklaces` },
  { label: 'Earrings', to: `${base}?category=Earrings` },
  { label: 'Bracelets', to: `${base}?category=Bracelets` },
  { label: 'Bangles', to: `${base}?category=Bangles` },
  { label: `All ${metal} Jewellery`, to: base },
];

export const COLLECTION_MENU = [
  { label: 'Royal Collection', to: '/collections/royal', children: [
    { label: 'Temple Necklaces', to: '/shop/necklaces?collection=royal' },
    { label: 'Antique Kadas', to: '/shop/bangles?collection=royal' },
    { label: 'Royal Earrings', to: '/shop/earrings?collection=royal' },
  ] },
  { label: 'Bridal Collection', to: '/collections/bridal', children: [
    { label: 'Bridal Sets', to: '/shop/bridal-sets?collection=bridal' },
    { label: 'Mangalsutra', to: '/shop/mangalsutra?collection=bridal' },
    { label: 'Bridal Accessories', to: '/shop/accessories?collection=bridal' },
  ] },
  { label: 'Everyday Collection', to: '/collections/everyday', children: [
    { label: 'Everyday Rings', to: '/shop/rings?collection=everyday' },
    { label: 'Pendants', to: '/shop/necklaces?collection=everyday' },
    { label: 'Bracelets', to: '/shop/bracelets?collection=everyday' },
  ] },
  { label: 'Festival Collection', to: '/collections/festival', children: [
    { label: 'Jhumkas', to: '/shop/earrings?collection=festival' },
    { label: 'Coin & Temple Necklaces', to: '/shop/necklaces?collection=festival' },
    { label: 'Festive Bangles', to: '/shop/bangles?collection=festival' },
  ] },
  { label: 'Limited Edition', to: '/collections/limited', children: [
    { label: 'Numbered Diamonds', to: '/shop?collection=limited&metal=Diamond' },
    { label: 'Heirloom Gold', to: '/shop?collection=limited&metal=Gold' },
  ] },
];

export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop', menu: SHOP_MENU },
  { label: 'Gold Jewellery', to: '/gold-jewellery', menu: metalMenu('Gold', '/gold-jewellery') },
  { label: 'Diamond Jewellery', to: '/diamond-jewellery', menu: metalMenu('Diamond', '/diamond-jewellery') },
  { label: 'Silver Jewellery', to: '/silver-jewellery', menu: metalMenu('Silver', '/silver-jewellery') },
  { label: 'Collections', to: '/collections', menu: COLLECTION_MENU },
  { label: 'Offers', to: '/offers' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];
