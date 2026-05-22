import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import fotoPahawang1 from '../assets/gambar1.jpg';
import fotoPahawang2 from '../assets/gambar2.jpg';
import fotoPahawang3 from '../assets/gambar3.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  const pahawangImages = [
    fotoPahawang1,
    fotoPahawang2,
    fotoPahawang3,
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        (prevIndex + 1) % pahawangImages.length
      );
    }, 6000); 

    return () => clearInterval(slideInterval);
  }, [pahawangImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const previewProducts = [
    { id: 1, name: "Villa Air Premium", category: "Penginapan", price: 850000, image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800", description: "Kapasitas 4 orang. Menghadap langsung ke laut lepas." },
    { id: 2, name: "Paket Snorkeling Nemo", category: "Wahana", price: 150000, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800", description: "Termasuk alat snorkel, pelampung, dan guide lokal." },
    { id: 3, name: "Sewa Jukung (Perahu)", category: "Transportasi", price: 350000, image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800", description: "Jelajah pulau, maksimal 10 penumpang per kapal." }
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0F172A] font-sans selection:bg-[#0EA5E9] selection:text-white overflow-x-hidden">
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-bold text-xl italic transition-colors ${
              scrolled ? 'bg-[#0284C7] text-white shadow-lg' : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
            }`}>
              P
            </div>
            <h1 className={`text-xl font-black tracking-tight ${scrolled ? 'text-[#0F172A]' : 'text-white drop-shadow-md'}`}>
              Pahawang<span className={scrolled ? 'text-[#0284C7]' : 'text-[#E0F2FE]'}>Sync</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`hidden md:flex gap-8 font-bold text-sm ${scrolled ? 'text-slate-500' : 'text-white drop-shadow-md'}`}>
              <a href="#pesona" className="hover:text-[#0284C7] transition-colors">Pesona</a>
              <a href="#katalog" className="hover:text-[#0284C7] transition-colors">Katalog</a>
              <a href="#panduan" className="hover:text-[#0284C7] transition-colors">Cara Pesan</a>
            </div>
            <div className={`w-px h-6 hidden md:block ${scrolled ? 'bg-slate-300' : 'bg-white/30'}`}></div>
            <Link 
              to="/login"
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                scrolled 
                  ? 'bg-[#0F172A] text-white hover:bg-[#0284C7] shadow-lg' 
                  : 'bg-white text-[#0F172A] hover:bg-blue-50 shadow-xl'
              }`}
            >
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0F172A]">
        
        <div className="absolute inset-0 z-0">
          {pahawangImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image} 
                alt={`Pahawang View ${index + 1}`} 
                className={`w-full h-full object-cover transition-transform duration-10000 ${
                  index === currentBgIndex ? 'scale-110' : 'scale-100'
                }`} 
              />
            </div>
          ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/30 via-[#0F172A]/60 to-[#0F172A]/90 z-[5]"></div>        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-6 text-center mt-20">

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              Eksplorasi Keindahan <br className="hidden md:block"/> Bawah Laut Pahawang.
            </h2>

            <p className="text-base md:text-lg text-white/90 font-normal mb-12 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              Sistem reservasi digital terpadu untuk liburan anti ribet. Booking villa terapung, sewa perahu wisata, hingga paket snorkeling dalam satu genggaman.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <a 
                href="#katalog"
                className="px-8 py-4 rounded-full bg-white text-[#0F172A] font-bold text-sm shadow-xl hover:bg-blue-50 hover:scale-105 transition-all w-full sm:w-auto"
              >
                Lihat Katalog
              </a>
              <Link 
                to="/login"
                className="px-8 py-4 rounded-full bg-[#0284C7] text-white font-bold text-sm shadow-xl shadow-[#0284C7]/40 hover:bg-[#0369A1] hover:scale-105 transition-all w-full sm:w-auto border border-[#0284C7]"
              >
                Booking Sekarang →
              </Link>
            </div>
        </div>
      </header>

      <section id="pesona" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] mb-4">Mengapa Pulau Pahawang?</h3>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Destinasi wisata bahari andalan Provinsi Lampung yang menawarkan pengalaman liburan tak terlupakan untuk kamu dan keluarga.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group rounded-[32px] overflow-hidden relative h-[400px] shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800" alt="Villa Air" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/40 to-transparent opacity-90"></div>
            <div className="absolute bottom-0 p-8 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-2xl border border-white/10">🛖</div>
              <h4 className="text-2xl font-bold mb-2">Villa Terapung</h4>
              <p className="text-blue-50 text-sm font-medium">Rasakan sensasi tidur di atas laut dengan fasilitas ala resort premium.</p>
            </div>
          </div>
          <div className="group rounded-[32px] overflow-hidden relative h-[400px] shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800" alt="Snorkeling" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0284C7] via-[#0A2540]/40 to-transparent opacity-90"></div>
            <div className="absolute bottom-0 p-8 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-2xl border border-white/10">🤿</div>
              <h4 className="text-2xl font-bold mb-2">Taman Nemo</h4>
              <p className="text-blue-50 text-sm font-medium">Berenang bersama ikan badut dan melihat cantiknya terumbu karang alami.</p>
            </div>
          </div>
          <div className="group rounded-[32px] overflow-hidden relative h-[400px] shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800" alt="Pulau" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/40 to-transparent opacity-90"></div>
            <div className="absolute bottom-0 p-8 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-2xl border border-white/10">🏖️</div>
              <h4 className="text-2xl font-bold mb-2">Pasir Timbul</h4>
              <p className="text-blue-50 text-sm font-medium">Berjalan di tengah lautan saat ombak surut di Pahawang Kecil.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="katalog" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-[#0F172A] mb-3">Intip Katalog Kami</h3>
              <p className="text-slate-500 font-medium max-w-lg">Berbagai pilihan fasilitas dan aktivitas menarik tersedia untuk menyempurnakan liburanmu di Pahawang.</p>
            </div>
            <button onClick={() => navigate('/login')} className="hidden md:block px-6 py-3 rounded-full border-2 border-slate-200 text-slate-600 font-bold hover:border-[#0284C7] hover:text-[#0284C7] transition-all">Lihat Semua</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewProducts.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full rounded-2xl overflow-hidden mb-4 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">{item.category}</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#0F172A] mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{item.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mulai dari</span>
                    <span className="font-black text-[#0284C7] text-lg">{formatRupiah(item.price)}</span>
                  </div>
                  <button onClick={() => navigate('/login')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#0F172A] font-bold group-hover:bg-[#0284C7] group-hover:text-white transition-all" title="Pesan Sekarang">→</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="panduan" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-100 rounded-[40px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl shadow-slate-200/40">
          <div className="relative z-10 md:w-1/2 mb-10 md:mb-0">
            <h3 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-6">Sudah Menemukan <br/> Pilihanmu?</h3>
            <p className="text-slate-500 font-medium text-lg mb-8">Untuk melakukan pemesanan, melihat detail fasilitas, dan memeriksa ketersediaan tanggal, silakan masuk ke akunmu terlebih dahulu.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/login')} className="px-8 py-4 rounded-full bg-[#0284C7] text-white font-bold shadow-lg shadow-[#0284C7]/30 hover:scale-105 hover:bg-[#0369A1] transition-all">Login untuk Memesan</button>
            </div>
          </div>
          <div className="relative z-10 md:w-1/3 w-full">
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-[32px] p-8">
              <h4 className="text-[#0F172A] font-bold mb-6 uppercase tracking-widest text-sm">Alur Pemesanan</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold flex items-center justify-center shrink-0 text-sm border border-[#BAE6FD]">1</div>
                  <div><h5 className="text-[#0F172A] font-bold text-sm">Masuk / Daftar</h5><p className="text-slate-500 text-xs mt-1">Gunakan email yang valid untuk menerima tiket digital.</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold flex items-center justify-center shrink-0 text-sm border border-[#BAE6FD]">2</div>
                  <div><h5 className="text-[#0F172A] font-bold text-sm">Pilih & Masukkan Keranjang</h5><p className="text-slate-500 text-xs mt-1">Atur jumlah orang dan tanggal keberangkatan.</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold flex items-center justify-center shrink-0 text-sm border border-[#BAE6FD]">3</div>
                  <div><h5 className="text-[#0F172A] font-bold text-sm">Bayar (QRIS/Transfer)</h5><p className="text-slate-500 text-xs mt-1">Pembayaran aman didukung oleh sistem Midtrans.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-10 text-center border-t border-slate-200 mt-10">
        <h2 className="text-xl font-bold tracking-tight text-[#0F172A] mb-2">Pahawang<span className="text-[#0284C7]">Sync</span></h2>
        <p className="text-slate-400 text-sm font-medium">© 2026 E-Tourism Digital Pahawang. All rights reserved.</p>
      </footer>
    </div>
  );
}