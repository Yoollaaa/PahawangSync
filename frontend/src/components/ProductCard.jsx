import React from 'react';

// Tambahkan prop onAddToCart di sini
export default function ProductCard({ title, category, price, image, onAddToCart }) {
  
  // Format angka ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
      <div className="h-56 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-widest mb-2">{category}</span>
        <h3 className="text-xl font-bold text-[#0F172A] mb-4 leading-tight">{title}</h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Mulai dari</p>
            <p className="text-lg font-black text-[#0F172A]">{formatRupiah(price)}</p>
          </div>
          {/* Pasang event onClick di tombol ini */}
          <button 
            onClick={onAddToCart} 
            className="bg-[#0284C7] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#0369A1] hover:shadow-md hover:shadow-[#0284C7]/30 transition-all active:scale-95"
          >
            Pesan
          </button>
        </div>
      </div>
    </div>
  );
}