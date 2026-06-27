import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import bgLanding from '../assets/landingpage.jpeg';
import fotoKano from '../assets/kano.jpg';
import fotoKrakatau from '../assets/krakatau.jpg';
import fotoKiluan from '../assets/teluk kiluan.jpg';
import fotoThemepark from '../assets/themepark.jpeg';
import fotoWaykambas from '../assets/waykambas.jpg';
import fotopahawang from '../assets/pahawang.jpg';

function WahanaCard({ image, title, desc }) {
  return (
    <div className="group rounded-3xl md:rounded-[32px] overflow-hidden relative h-[280px] md:h-[350px] lg:h-[400px] shadow-xl border-[3px] border-white/60">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent opacity-90"></div>
      <div className="absolute bottom-0 p-5 md:p-8 text-white w-full">
        <h4 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-md">{title}</h4>
        <p className="text-blue-50 text-xs md:text-sm font-medium drop-shadow-sm line-clamp-2 md:line-clamp-none">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // Gunakan variasi gambar lokal untuk efek slider di Hero Section
  const heroImages = [fotoWaykambas, fotoKiluan, fotoThemepark, fotopahawang];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const [allDestinations, setAllDestinations] = useState([]); 
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    const fetchAllDestinations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        setAllDestinations(response.data); 
      } catch (error) {
        console.error("Gagal mengambil data katalog lengkap:", error);
      }
    };
    fetchAllDestinations();
  }, []);

  const filteredData = activeCategory === 'Semua' 
    ? allDestinations 
    : allDestinations.filter(item => item.category === activeCategory);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000); 
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#0EA5E9] selection:text-white overflow-x-hidden bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="fixed inset-0 bg-white/35 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      <div className="relative z-10 text-[#0F172A]">
        
        {/* === NAVBAR === */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-white shadow-sm py-3 md:py-4' : 'bg-white/30 backdrop-blur-md border-b border-white/50 py-4 md:py-6'
        }`}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-[14px] flex items-center justify-center font-bold text-lg md:text-xl italic bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/30">
                E
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-[#0F172A]">
                EcoLoka<span className="text-[#0284C7]"> Lampung</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex gap-8 font-bold text-sm text-slate-700">
                <a href="#pesona" className="hover:text-[#0284C7] transition-colors">Pesona</a>
                <a href="#katalog" className="hover:text-[#0284C7] transition-colors">Katalog</a>
                <a href="#panduan" className="hover:text-[#0284C7] transition-colors">Cara Pesan</a>
              </div>
              <div className="w-px h-6 hidden md:block bg-slate-400/50"></div>
              <Link 
                to="/login"
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-md ${
                  scrolled 
                    ? 'bg-[#0F172A] text-white hover:bg-[#0284C7]' 
                    : 'bg-white/90 backdrop-blur-sm text-[#0F172A] hover:bg-white border border-white'
                }`}
              >
                Masuk / Daftar
              </Link>
            </div>
          </div>
        </nav>

        {/* === HEADER === */}
        <header className="relative pt-28 pb-16 md:pt-36 md:pb-20 lg:pt-44 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
              
              <div className="relative z-10 w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border-[4px] md:border-[6px] border-white/60 backdrop-blur-sm mt-8 lg:mt-0 order-2 lg:order-1">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`EcoLoka Highlight ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
                
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-5 flex justify-between items-center shadow-lg border border-white">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destinasi Pilihan</p>
                      <p className="text-[#0F172A] font-black text-base md:text-lg tracking-tight">Eksplorasi EcoLoka</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center text-lg md:text-xl shadow-sm">
                      ✨
                    </div>
                </div>
              </div>
              
              <div className="relative z-10 text-left pt-4 md:pt-0 order-1 lg:order-2">
                <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/70 backdrop-blur-md text-[#0284C7] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 border border-white shadow-sm">
                  Keajaiban Alam & Rekreasi Terpadu
                </span>
                
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0F172A] leading-[1.1] tracking-tight mb-4 md:mb-6 drop-shadow-sm">
                  Eksplorasi <br className="hidden sm:block" />
                  Kekayaan <br className="hidden sm:block" />
                  <span className="text-[#0284C7] font-serif italic font-medium">EcoLoka Lampung.</span>
                </h2>

                <p className="text-slate-700 text-sm md:text-base lg:text-lg font-medium mb-8 md:mb-10 max-w-md leading-relaxed bg-white/60 inline-block px-4 py-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-md border border-white shadow-sm">
                  Tinggalkan kerumitan. Nikmati kemudahan reservasi safari gajah, ekspedisi gunung berapi, liburan pulau tropis, hingga rekreasi keluarga dalam satu platform digital.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link 
                    to="/login"
                    className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#0F172A] text-white font-bold text-sm md:text-base hover:bg-[#0284C7] md:hover:scale-105 transition-all shadow-xl shadow-slate-900/20 text-center"
                  >
                    Mulai Petualangan
                  </Link>
                  <a 
                    href="#katalog"
                    className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/70 backdrop-blur-md text-[#0F172A] font-bold text-sm md:text-base border-2 border-white hover:bg-white hover:text-[#0284C7] transition-all shadow-sm text-center"
                  >
                    Lihat Katalog
                  </a>
                </div>
              </div>
              
            </div>
          </div>
        </header>

        {/* === SEKSI PESONA WAHANA === */}
        <section id="pesona" className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight text-[#0F172A] mb-3 md:mb-4 drop-shadow-sm">Pilihan Petualangan Unggulan</h3>
            <p className="text-sm md:text-base text-slate-700 font-medium max-w-2xl mx-auto bg-white/50 inline-block px-4 py-2 md:px-6 md:py-2 rounded-full backdrop-blur-sm border border-white">
              Dari safari satwa liar sampai hiburan tropis yang ceria, tentukan tujuan liburan Anda hari ini.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <WahanaCard image={fotoWaykambas} title="Safari Gajah Way Kambas" desc="Nikmati perjalanan edukatif yang mendalam bersama gajah-gajah cerdas di habitat alami mereka." />                
            <WahanaCard image={fotoKrakatau} title="Krakatau Volcano Expedition" desc="Rasakan adrenalin mendaki gunung berapi ikonik di tengah laut dan saksikan keindahan alam yang menakjubkan." />
            <WahanaCard image={fotoKiluan} title="Island Stay in Kiluan" desc="Menginap di pulau tropis yang asri dan saksikan lumba-lumba lincah dari balkon pondok Anda." />
            <WahanaCard image={fotoKano} title="Transparent Kayaking" desc="Saksikan keindahan terumbu karang yang menakjubkan melalui lantai kano yang jernih di Pahawang." />
            <WahanaCard image={fotoKiluan} title="Dolphin Tour in Kiluan" desc="Perjalanan perahu eksklusif untuk berinteraksi dengan lumba-lumba lincah di habitat alami mereka." />
            <WahanaCard image={fotoThemepark} title="Family Recreation Park" desc="Bersenang-senang bersama keluarga dengan berbagai wahana rekreasi keluarga di Theme Park Tropis yang asri." />
          </div>
        </section>

        {/* === SEKSI KATALOG DENGAN FILTER === */}
        <section id="katalog" className="py-16 md:py-20 border-y border-white/40 bg-white/10 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            
            <div className="mb-10 text-center flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
              <div className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-md border border-white shadow-sm inline-block w-full md:w-auto text-left">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A] mb-2 md:mb-3">Intip Katalog EcoLoka</h3>
                <p className="text-sm md:text-base text-slate-600 font-medium max-w-lg leading-relaxed">Berbagai pilihan safari, ekspedisi, liburan pulau, hingga hiburan keluarga tersedia di seluruh penjuru Lampung.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {['Semua', 'Hutan', 'Gunung', 'Laut', 'Satwa Liar', 'Theme Park'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                      activeCategory === cat ? 'bg-[#0284C7] text-white shadow-lg' : 'bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {filteredData.length > 0 ? (
                filteredData.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white/85 backdrop-blur-md border border-white rounded-3xl md:rounded-[32px] p-4 md:p-5 shadow-lg hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-48 md:h-56 w-full rounded-2xl overflow-hidden mb-4 md:mb-5 relative border border-white/50">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold text-[#0284C7] uppercase tracking-widest shadow-sm">{item.category}</span>
                      </div>
                      <h3 className="font-bold text-lg md:text-xl text-[#0F172A] mb-1 md:mb-2">{item.name}</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-medium mb-4 md:mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="pt-4 md:pt-5 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Mulai dari</span>
                        <span className="font-black text-[#0284C7] text-lg md:text-xl">{formatRupiah(item.price)}</span>
                      </div>
                      <button onClick={() => navigate('/login')} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] font-bold group-hover:bg-[#0284C7] group-hover:text-white transition-all shadow-sm" title="Pesan Sekarang">→</button>
                    </div>
                  </div>
                ))
              ) : (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center py-10 md:py-12 bg-white/60 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white text-slate-600 font-bold shadow-sm text-sm md:text-base">
                    Memuat katalog keajaiban EcoLoka...
                  </div>
              )}
            </div>
            
            {/* Tombol Lihat Lebih Banyak */}
            <div className="mt-10 text-center">
                <button onClick={() => navigate('/login')} className="px-8 py-3 rounded-full bg-[#0F172A] text-white font-bold text-sm shadow-lg hover:bg-[#0284C7] transition-all">
                  Lihat Lebih Banyak Destinasi
                </button>
            </div>

          </div>
        </section>

        {/* === SEKSI PANDUAN === */}
        <section id="panduan" className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl">
            <div className="relative z-10 md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A] mb-4 md:mb-6 drop-shadow-sm">Sudah Menemukan <br className="hidden md:block"/> Keajaiban Anda?</h3>
              <p className="text-slate-600 font-medium text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">Untuk melakukan pemesanan safari gajah, ekspedisi Krakatau, rekreasi keluarga, hingga pondok pulau tropis, silakan masuk ke akun Anda terlebih dahulu.</p>
              <div className="flex justify-center md:justify-start gap-4">
                <button onClick={() => navigate('/login')} className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#0284C7] text-white text-sm md:text-base font-bold shadow-lg shadow-[#0284C7]/30 hover:scale-105 hover:bg-[#0369A1] transition-all">Login EcoLoka</button>
              </div>
            </div>
            
            <div className="relative z-10 md:w-1/3 w-full order-1 lg:order-2 mt-8 lg:mt-0">
              <div className="bg-white/60 backdrop-blur-md border border-white shadow-sm rounded-2xl md:rounded-[32px] p-5 md:p-8">
                <h4 className="text-[#0284C7] font-black mb-4 md:mb-6 uppercase tracking-widest text-xs md:text-sm text-center tracking-tight">Langkah Reservasi Terpadu</h4>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex gap-3 md:gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-xs md:text-sm shadow-sm border border-slate-100">1</div>
                    <div className="pt-0.5 md:pt-1"><h5 className="text-[#0F172A] font-bold text-xs md:text-sm">Masuk / Daftar</h5><p className="text-slate-600 text-[10px] md:text-xs mt-1 font-medium">Gunakan email valid untuk terima tiket.</p></div>
                  </div>
                  <div className="flex gap-3 md:gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-xs md:text-sm shadow-sm border border-slate-100">2</div>
                    <div className="pt-0.5 md:pt-1"><h5 className="text-[#0F172A] font-bold text-xs md:text-sm">Pilih & Masukkan Keranjang</h5><p className="text-slate-600 text-[10px] md:text-xs mt-1 font-medium">Atur jumlah dan tanggal perjalanan Anda.</p></div>
                  </div>
                  <div className="flex gap-3 md:gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-xs md:text-sm shadow-sm border border-slate-100">3</div>
                    <div className="pt-0.5 md:pt-1"><h5 className="text-[#0F172A] font-bold text-xs md:text-sm">Bayar Tagihan Terpadu</h5><p className="text-slate-600 text-[10px] md:text-xs mt-1 font-medium">Sistem mencatat bayaran terpadu otomatis.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === FOOTER === */}
        <footer className="bg-white/70 backdrop-blur-md py-12 md:py-16 text-left border-t border-white mt-10 md:mt-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] relative z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-[#0F172A]">
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] md:rounded-[12px] flex items-center justify-center font-bold text-base md:text-lg italic bg-[#0284C7] text-white">E</div>
                  <h2 className="text-lg md:text-xl font-black tracking-tight text-[#0F172A]">EcoLoka<span className="text-[#0284C7]"> Lampung</span></h2>
              </div>
              <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed md:pr-4">Platform reservasi keajaiban alam dan hiburan tropis terpadu di Lampung. Eksplorasi mudah, liburan nyaman.</p>
              <p className="text-slate-400 text-[10px] md:text-xs font-medium mt-4 md:mt-6">© 2026 Eco-Tourism Digital EcoLoka Lampung.<br/>All rights reserved.</p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 pt-2">
                <h4 className="font-bold text-xs md:text-sm text-[#0F172A] uppercase tracking-wider mb-2 md:mb-3">Jelajahi Lampung</h4>
                <a href="#pesona" className="text-xs md:text-sm text-slate-600 hover:text-[#0284C7] font-medium transition-colors">Pesona Wahana</a>
                <a href="#katalog" className="text-xs md:text-sm text-slate-600 hover:text-[#0284C7] font-medium transition-colors">Katalog Terpadu</a>
                <a href="#panduan" className="text-xs md:text-sm text-slate-600 hover:text-[#0284C7] font-medium transition-colors">Panduan Pesan</a>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 pt-2">
                <h4 className="font-bold text-xs md:text-sm text-[#0F172A] uppercase tracking-wider mb-2 md:mb-3">Pusat Bantuan</h4>
                <p className="text-slate-600 text-xs md:text-sm font-medium mb-2 md:mb-3">Tim kami siap membantu reservasi petualangan Anda.</p>
                
                <a 
                  href="https://wa.me/6285273382225" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 md:gap-3 bg-[#E0F2FE]/80 backdrop-blur-sm px-5 py-3 md:px-6 md:py-4 rounded-full border border-[#BAE6FD] hover:bg-[#BAE6FD] hover:-translate-y-1 transition-all group shadow-sm w-max"
                >
                    <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">💬</span>
                    <span className="text-[10px] md:text-xs font-bold text-[#0284C7] uppercase tracking-widest tracking-tight">Hubungi Help EcoLoka</span>
                </a>
            </div>

          </div>
        </footer>
        
      </div>
    </div>
  );
}