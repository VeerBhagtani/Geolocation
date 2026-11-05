import Breadcrumbs from '../components/Breadcrumbs';
import { DownloadIcon } from '../components/Icons';

export const DOWNLOADS = [
  { file: 'Modern_Jewellers_Catalogue.pdf', title: 'Product Catalogue 2026', desc: 'Full illustrated catalogue with prices, materials and IDs.', type: 'PDF' },
  { file: 'Modern_Jewellers_Price_List.xlsx', title: 'Price List', desc: 'Current price list with purity, weight and making charges.', type: 'Excel' },
  { file: 'Inventory_Report.csv', title: 'Inventory Report', desc: 'Stock levels by product and store location.', type: 'CSV' },
  { file: 'Company_Profile.pdf', title: 'Company Profile', desc: 'Our heritage, leadership, stores and certifications.', type: 'PDF' },
  { file: 'Product_Details.pdf', title: 'Product Details & Specifications', desc: 'Detailed specification sheets for every piece.', type: 'PDF' },
];

export default function Downloads() {
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Downloads' }]} />
      <h1 className="section-title text-center">Downloads</h1>
      <div className="divider-gold" />
      <p className="text-center text-cocoa-500">Catalogues, price lists and company documents.</p>
      <div className="mx-auto mt-10 grid max-w-4xl gap-4">
        {DOWNLOADS.map((d) => (
          <div key={d.file} className="card flex flex-wrap items-center gap-5 p-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-cream-100 text-xs font-semibold tracking-widest text-champagne-700">{d.type}</span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-xl">{d.title}</p>
              <p className="text-sm text-cocoa-500">{d.desc}</p>
              <p className="text-xs text-cocoa-300">{d.file}</p>
            </div>
            <a href={`/downloads/${d.file}`} download={d.file} className="btn-gold btn-sm"><DownloadIcon width={16} /> Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}
