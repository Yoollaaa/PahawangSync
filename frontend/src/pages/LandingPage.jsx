import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import fotoPahawang1 from '../assets/gambar1.jpg';
import fotoPahawang2 from '../assets/gambar2.jpg';
import fotoPahawang3 from '../assets/gambar3.jpg';

import bgLanding from '../assets/landingpage.jpg';

function WahanaCard({ image, title, desc }) {
  return (
    <div className="group rounded-[32px] overflow-hidden relative h-[350px] lg:h-[400px] shadow-xl border-[3px] border-white/60">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/50 to-transparent opacity-90"></div>
      <div className="absolute bottom-0 p-8 text-white">
        <h4 className="text-2xl font-bold mb-2 drop-shadow-md">{title}</h4>
        <p className="text-blue-50 text-sm font-medium drop-shadow-sm">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [previewProducts, setPreviewProducts] = useState([]); 
  
  const pahawangImages = [fotoPahawang1, fotoPahawang2, fotoPahawang3];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const fetchPreviewProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const formattedData = response.data.slice(0, 3).map(item => ({
          ...item,
          image: item.image_url || "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800",
          description: item.description || "Fasilitas unggulan untuk melengkapi liburan eksklusif Anda di Pulau Pahawang."
        }));
        setPreviewProducts(formattedData);
      } catch (error) {
        console.error("Gagal mengambil data katalog awal:", error);
      }
    };
    fetchPreviewProducts();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % pahawangImages.length);
    }, 6000); 
    return () => clearInterval(slideInterval);
  }, [pahawangImages.length]);

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
        
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-white shadow-sm py-4' : 'bg-white/30 backdrop-blur-md border-b border-white/50 py-6'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center font-bold text-xl italic bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/30">
                P
              </div>
              <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
                Pahawang<span className="text-[#0284C7]">Sync</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-8 font-bold text-sm text-slate-700">
                <a href="#pesona" className="hover:text-[#0284C7] transition-colors">Pesona</a>
                <a href="#katalog" className="hover:text-[#0284C7] transition-colors">Katalog</a>
                <a href="#panduan" className="hover:text-[#0284C7] transition-colors">Cara Pesan</a>
              </div>
              <div className="w-px h-6 hidden md:block bg-slate-400/50"></div>
              <Link 
                to="/login"
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${
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

        <header className="relative pt-36 pb-20 lg:pt-44 lg:pb-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              <div className="relative z-10 text-left">
                <span className="inline-block px-4 py-2 rounded-full bg-white/70 backdrop-blur-md text-[#0284C7] text-xs font-bold uppercase tracking-widest mb-8 border border-white shadow-sm">
                  Eksklusif & Terpadu
                </span>
                
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#0F172A] leading-[1.1] tracking-tight mb-6 drop-shadow-sm">
                  Eksplorasi <br />
                  Keindahan <br />
                  <span className="text-[#0284C7] font-serif italic font-medium">Pahawang.</span>
                </h2>

                <p className="text-slate-700 text-lg font-medium mb-10 max-w-md leading-relaxed bg-white/60 inline-block px-5 py-3 rounded-2xl backdrop-blur-md border border-white shadow-sm">
                  Tinggalkan kerumitan. Nikmati kemudahan reservasi villa terapung, perahu wisata, hingga paket snorkeling dalam satu platform digital.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/login"
                    className="px-8 py-4 rounded-full bg-[#0F172A] text-white font-bold hover:bg-[#0284C7] hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
                  >
                    Mulai Perjalanan
                  </Link>
                  <a 
                    href="#katalog"
                    className="px-8 py-4 rounded-full bg-white/70 backdrop-blur-md text-[#0F172A] font-bold border-2 border-white hover:bg-white hover:text-[#0284C7] transition-all shadow-sm"
                  >
                    Lihat Katalog
                  </a>
                </div>
              </div>

              <div className="relative z-10 w-full h-[400px] lg:h-[500px] rounded-[40px] overflow-hidden shadow-2xl border-[6px] border-white/60 backdrop-blur-sm">
                {pahawangImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentBgIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Pahawang View ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/85 backdrop-blur-md rounded-3xl p-5 flex justify-between items-center shadow-lg border border-white">
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destinasi Populer</p>
                      <p className="text-[#0F172A] font-black text-lg tracking-tight">Pulau Pahawang</p>
                   </div>
                   <div className="w-12 h-12 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center text-xl shadow-sm">
                      🌊
                   </div>
                </div>
              </div>
              
            </div>
          </div>
        </header>

        <section id="pesona" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] mb-4 drop-shadow-sm">Pilihan Wahana Seru</h3>
            <p className="text-slate-700 font-medium max-w-2xl mx-auto bg-white/50 inline-block px-6 py-2 rounded-full backdrop-blur-sm border border-white">
              Dari yang santai sampai yang memacu adrenalin, pilih petualanganmu hari ini.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <WahanaCard image="https://mitra.boatria.com/assets/customers/1242-aeroboatria/b864da5e012a7a5372e9cb0789252e9c.jpg" title="Kano Transparan" desc="Lihat keindahan bawah laut dengan jelas melalui lantai kano yang bening." />
            <WahanaCard image="https://sc04.alicdn.com/kf/H88233577ca804be7a77f8d1512d51280g.jpg" title="Donut Boat" desc="Wahana unik berbentuk donat, cocok untuk santai di tengah laut." />
            <WahanaCard image="https://s2.explorer.id/review/review-1777984997822.jpeg" title="Sea Walker" desc="Berjalan di dasar laut dengan aman, tanpa perlu keahlian menyelam khusus." />
            <WahanaCard image="https://www.bintan-resorts.com/wp-content/uploads/2023/09/banana-boat-from-side.webp" title="Banana Boat" desc="Pacu adrenalin bersama teman-teman dengan meluncur di atas air." />
            <WahanaCard image="https://www.cruisersup.com/cdn/shop/products/DSC_1077-edited-1000_1024x1024.jpg?v=1717086741" title="Paddle Board" desc="Uji keseimbanganmu dengan mendayung di permukaan laut yang tenang." />
            <WahanaCard image="https://s-light.tiket.photos/t/01E25EBZS3W0FY9GTG6C42E1SE/rsfit19201280gsm/events/2021/04/23/7ae3f8c0-114b-493c-843b-f14209763be4-1619166285888-03caa15ba309dddc21dd70fafa61c0ca.jpg" title="Jetski" desc="Rasakan sensasi kecepatan tinggi membelah ombak laut Pahawang." />
          </div>
        </section>

        <section id="katalog" className="py-20 border-y border-white/40 bg-white/10 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="bg-white/60 p-6 rounded-3xl backdrop-blur-md border border-white shadow-sm inline-block">
                <h3 className="text-3xl font-black tracking-tight text-[#0F172A] mb-3">Intip Katalog Kami</h3>
                <p className="text-slate-600 font-medium max-w-lg">Berbagai pilihan fasilitas dan aktivitas menarik tersedia untuk menyempurnakan liburanmu di Pahawang.</p>
              </div>
              <button onClick={() => navigate('/login')} className="hidden md:block px-8 py-4 rounded-full bg-white/85 backdrop-blur-md border-2 border-white text-[#0F172A] font-bold hover:bg-white hover:text-[#0284C7] shadow-lg transition-all">Lihat Semua ➔</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewProducts.length > 0 ? (
                previewProducts.map((item) => (
                  <div key={item.id} className="bg-white/85 backdrop-blur-md border border-white rounded-[32px] p-5 shadow-lg hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-56 w-full rounded-2xl overflow-hidden mb-5 relative border border-white/50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-[#0284C7] uppercase tracking-widest shadow-sm">{item.category}</span>
                      </div>
                      <h3 className="font-bold text-xl text-[#0F172A] mb-2">{item.name}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="pt-5 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mulai dari</span>
                        <span className="font-black text-[#0284C7] text-xl">{formatRupiah(item.price)}</span>
                      </div>
                      <button onClick={() => navigate('/login')} className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] font-bold group-hover:bg-[#0284C7] group-hover:text-white transition-all shadow-sm" title="Pesan Sekarang">→</button>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="col-span-3 text-center py-12 bg-white/60 backdrop-blur-md rounded-3xl border border-white text-slate-600 font-bold shadow-sm">
                   Memuat katalog unggulan...
                 </div>
              )}
            </div>
          </div>
        </section>

        <section id="panduan" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="bg-white/85 backdrop-blur-xl border border-white rounded-[40px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl">
            <div className="relative z-10 md:w-1/2 mb-10 md:mb-0">
              <h3 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-6 drop-shadow-sm">Sudah Menemukan <br/> Pilihanmu?</h3>
              <p className="text-slate-600 font-medium text-lg mb-8 leading-relaxed">Untuk melakukan pemesanan, melihat detail fasilitas, dan memeriksa ketersediaan tanggal, silakan masuk ke akunmu terlebih dahulu.</p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="px-8 py-4 rounded-full bg-[#0284C7] text-white font-bold shadow-lg shadow-[#0284C7]/30 hover:scale-105 hover:bg-[#0369A1] transition-all">Login untuk Memesan</button>
              </div>
            </div>
            
            <div className="relative z-10 md:w-1/3 w-full">
              <div className="bg-white/60 backdrop-blur-md border border-white shadow-sm rounded-[32px] p-8">
                <h4 className="text-[#0284C7] font-black mb-6 uppercase tracking-widest text-sm text-center">Alur Pemesanan</h4>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-10 h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-sm shadow-sm border border-slate-100">1</div>
                    <div className="pt-1"><h5 className="text-[#0F172A] font-bold text-sm">Masuk / Daftar</h5><p className="text-slate-600 text-xs mt-1 font-medium">Gunakan email yang valid untuk menerima tiket digital.</p></div>
                  </div>
                  <div className="flex gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-10 h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-sm shadow-sm border border-slate-100">2</div>
                    <div className="pt-1"><h5 className="text-[#0F172A] font-bold text-sm">Pilih & Masukkan Keranjang</h5><p className="text-slate-600 text-xs mt-1 font-medium">Atur jumlah orang dan tanggal keberangkatan.</p></div>
                  </div>
                  <div className="flex gap-4 items-start bg-white/50 p-3 rounded-2xl border border-white/50">
                    <div className="w-10 h-10 rounded-full bg-white text-[#0284C7] font-black flex items-center justify-center shrink-0 text-sm shadow-sm border border-slate-100">3</div>
                    <div className="pt-1"><h5 className="text-[#0F172A] font-bold text-sm">Bayar Tagihan</h5><p className="text-slate-600 text-xs mt-1 font-medium">Sistem kami mencatat pembayaran secara otomatis.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-white/70 backdrop-blur-md py-10 text-center border-t border-white mt-10 shadow-lg">
          <h2 className="text-2xl font-black tracking-tight text-[#0F172A] mb-2 drop-shadow-sm">Pahawang<span className="text-[#0284C7]">Sync</span></h2>
          <p className="text-slate-600 text-sm font-bold">© 2026 E-Tourism Digital Pahawang. All rights reserved.</p>
        </footer>
        
      </div>
    </div>
  );
}