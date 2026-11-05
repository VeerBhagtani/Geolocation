const base = (path, props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true" {...props}>
    {path}
  </svg>
);
export const SearchIcon = (p) => base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, p);
export const HeartIcon = ({ filled, ...p }) => base(<path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.5 6.6 4.5c2 0 3.5 1.2 4.4 2.6.9-1.4 2.4-2.6 4.4-2.6 3.6 0 5.4 3.7 3.8 6.9C19 15.6 12 20 12 20Z" fill={filled ? 'currentColor' : 'none'} />, p);
export const BagIcon = (p) => base(<><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, p);
export const UserIcon = (p) => base(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>, p);
export const MenuIcon = (p) => base(<path d="M4 7h16M4 12h16M4 17h16" />, p);
export const CloseIcon = (p) => base(<path d="M6 6l12 12M18 6 6 18" />, p);
export const ChevronDown = (p) => base(<path d="m6 9 6 6 6-6" />, p);
export const ChevronRight = (p) => base(<path d="m9 6 6 6-6 6" />, p);
export const ChevronLeft = (p) => base(<path d="m15 6-6 6 6 6" />, p);
export const ArrowUp = (p) => base(<path d="M12 19V5M5 12l7-7 7 7" />, p);
export const CompareIcon = (p) => base(<><path d="M7 4v16M17 4v16" /><path d="m4 8 3-4 3 4M14 16l3 4 3-4" /></>, p);
export const TruckIcon = (p) => base(<><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>, p);
export const ShieldIcon = (p) => base(<><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>, p);
export const RefreshIcon = (p) => base(<><path d="M20 12a8 8 0 1 1-2.3-5.6L20 8" /><path d="M20 4v4h-4" /></>, p);
export const GemIcon = (p) => base(<><path d="M6 3h12l3 6-9 12L3 9l3-6Z" /><path d="M3 9h18M9 3l3 18 3-18" /></>, p);
export const StarIcon = ({ filled = true, ...p }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
export const PhoneIcon = (p) => base(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />, p);
export const MailIcon = (p) => base(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, p);
export const PinIcon = (p) => base(<><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></>, p);
export const ClockIcon = (p) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, p);
export const DownloadIcon = (p) => base(<><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>, p);
export const LockIcon = (p) => base(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>, p);
export const TrashIcon = (p) => base(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>, p);
export const HistoryIcon = (p) => base(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 8v4l3 2" /></>, p);
export const FilterIcon = (p) => base(<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />, p);
export const InstagramIcon = (p) => base(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></>, p);
export const FacebookIcon = (p) => base(<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" />, p);
export const YoutubeIcon = (p) => base(<><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" /></>, p);
export const PinterestIcon = (p) => base(<><circle cx="12" cy="12" r="9" /><path d="M11 8.5c3-1 5 .8 4.5 3.2-.4 2-2.4 3-3.8 2.1M11.5 11 9.5 20" /></>, p);
export const XIcon = (p) => base(<path d="M4 4l16 16M20 4 4 20" />, p);
export const WhatsappIcon = (p) => base(<><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.4-2.1-1.5-2.5-2.5l1-1-1-2L9 9Z" /></>, p);
export const CheckIcon = (p) => base(<path d="m5 12 5 5 9-10" />, p);
export const EyeIcon = (p) => base(<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>, p);
