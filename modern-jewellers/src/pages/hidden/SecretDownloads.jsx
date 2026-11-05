import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { DownloadIcon, LockIcon } from '../../components/Icons';
import { DOWNLOADS } from '../Downloads';

export default function SecretDownloads() {
  const { discover } = useStore();
  return (
    <div className="container-luxe page-enter py-12">
      <div className="text-center">
        <p className="eyebrow">Private Bridal Viewing · Document Vault</p>
        <h1 className="section-title mt-2">Secret Downloadable Documents</h1>
        <div className="divider-gold" />
        <p className="mx-auto max-w-xl text-cocoa-500">Documents prepared for private-viewing patrons and senior management.</p>
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        <div className="card flex flex-wrap items-center gap-5 border-2 !border-champagne-400 p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-300 to-champagne-600 text-white"><LockIcon /></span>
          <div className="flex-1">
            <p className="font-serif text-2xl">The Vault Ledger — Q4 2026</p>
            <p className="text-sm text-cocoa-500">Unlisted pieces, private-viewing schedule and management access notes.</p>
            <p className="text-xs text-cocoa-300">MJ_Vault_Ledger_Q4_2026.pdf</p>
          </div>
          <a href="/downloads/private/MJ_Vault_Ledger_Q4_2026.pdf" download="MJ_Vault_Ledger_Q4_2026.pdf" onClick={() => discover('hidden-download')} className="btn-gold btn-sm" id="vault-ledger-download"><DownloadIcon width={16} /> Download</a>
        </div>
        <p className="eyebrow pt-6">Also available</p>
        {DOWNLOADS.map((d) => (
          <div key={d.file} className="card flex items-center justify-between gap-4 p-4">
            <span className="text-sm">{d.title} <span className="text-cocoa-300">· {d.file}</span></span>
            <a href={d.href} download={d.file} className="btn-outline btn-sm"><DownloadIcon width={14} /> Download</a>
          </div>
        ))}
        <p className="pt-4 text-center text-sm"><Link to="/product/MJ-BS-7001" className="text-cocoa-400 underline">Back to Shubh Vivaah Bridal Set</Link></p>
      </div>
    </div>
  );
}
