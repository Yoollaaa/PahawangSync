import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import ProductCard from '../components/ProductCard';
import { QRCodeSVG } from 'qrcode.react';

const IconCart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconTicket = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 12h20"/><path d="M6 9h.01"/><path d="M6 15h.01"/><path d="M18 9h.01"/><path d="M18 15h.01"/></svg>;
const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTicketTab, setActiveTicketTab] = useState('Aktif');

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    let currentUser = null;
    
    if (!userData) {
      navigate('/login');
    } else {
      currentUser = JSON.parse(userData);
      setUser(currentUser);
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const formattedData = response.data.map(item => ({
          ...item,
          image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800", 
          description: "Fasilitas berkualitas dan pelayanan terbaik di Pulau Pahawang."
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error("Gagal mengambil data produk dari server:", error);
      }
    };
    
    fetchProducts();
  }, [navigate]);

  const fetchMyTickets = async () => {
    try {
      if (!user) return;
      
      const response = await axios.get('http://localhost:5000/api/reservations');
      const allTickets = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      const myTickets = allTickets.filter(ticket => {
        const namaDiDatabase = ticket.customer_name ? ticket.customer_name.toLowerCase().trim() : '';
        const namaLogin = user.name ? user.name.toLowerCase().trim() : '';
        return namaDiDatabase === namaLogin;
      });
      
      setUserTickets(myTickets);
    } catch (error) {
      console.error("Gagal mengambil data tiket dari server:", error);
    }
  };

  const handleOpenTicketModal = () => {
    setIsTicketModalOpen(true);
    fetchMyTickets();
  };

  const handleLogout = () => {
    const isConfirm = window.confirm("Apakah kamu yakin ingin keluar?");
    if (isConfirm) {
      localStorage.removeItem('user'); 
      navigate('/');
    }
  };

  const filteredProducts = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = [
    'Semua', 'Villa', 'Perahu', 'Alat', 'Kuliner', 'Oleh-oleh'
  ];

  const confirmAddToCart = () => {
    if (selectedProduct) {
      setCart((prevCart) => {
        const existingItem = prevCart.find(item => item.id === selectedProduct.id);
        if (existingItem) {
          return prevCart.map(item => 
            item.id === selectedProduct.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          return [...prevCart, { ...selectedProduct, quantity: 1 }];
        }
      });
      setSelectedProduct(null); 
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0); 
    });
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (!user) return null;

  const displayedTickets = userTickets.filter(ticket => {
    if (activeTicketTab === 'Aktif') {
      return ticket.status !== 'Completed';
    } else {
      return ticket.status === 'Completed'; 
    }
  });

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0F172A] font-sans pb-24 selection:bg-[#0EA5E9] selection:text-white">
      
      <nav className="fixed top-0 w-full z-40 bg-[#F4F8FB]/80 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0284C7] rounded-[14px] flex items-center justify-center shadow-md shadow-[#0284C7]/20">
              <span className="text-white font-bold text-xl italic">P</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Pahawang<span className="text-[#0284C7]">Sync</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-500 hover:text-[#0284C7] transition-colors cursor-pointer active:scale-95">
              <IconCart />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#F4F8FB] shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#EF4444] transition-colors">
              Logout
            </button>
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] font-bold ring-2 ring-white shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        <header className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3">
            Eksplorasi laut, <br/>
            <span className="text-[#0284C7] font-serif italic font-medium">{user.name}.</span>
          </h2>
          <p className="text-slate-500 font-medium">Temukan keindahan tersembunyi di Pulau Pahawang hari ini.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-16">
          <div onClick={() => setIsCartOpen(true)} className="md:col-span-2 group bg-[#0A2540] rounded-[24px] p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[#0A2540]/20 hover:-translate-y-1 transition-all duration-300">
             <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M200 200H0V100C40 100 60 140 100 140C140 140 160 100 200 100V200Z" fill="#38BDF8"/><path d="M200 200H0V150C30 150 50 180 100 180C150 180 170 150 200 150V200Z" fill="#0284C7"/></svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 mb-4"><IconCart /></div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Menu Pembayaran</h3>
                <p className="text-slate-300 text-sm font-medium">Selesaikan transaksi tiket dan pesananmu di sini.</p>
              </div>
            </div>
          </div>
          
          <div onClick={handleOpenTicketModal} className="group bg-white rounded-[24px] p-8 border border-slate-100 cursor-pointer hover:border-[#38BDF8] hover:shadow-lg hover:shadow-[#38BDF8]/10 hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col h-full justify-between min-h-[160px]">
              <div className="w-12 h-12 bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0284C7] group-hover:text-white transition-all duration-300"><IconTicket /></div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-1">Tiket Digital</h3>
                <p className="text-slate-500 text-sm font-medium">Akses QR Code pesanan.</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-[24px] p-8 border border-slate-100 cursor-pointer hover:border-[#38BDF8] hover:shadow-lg hover:shadow-[#38BDF8]/10 hover:-translate-y-1 transition-all duration-300">
             <div className="flex flex-col h-full justify-between min-h-[160px]">
              <div className="w-12 h-12 bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0284C7] group-hover:text-white transition-all duration-300"><IconUser /></div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-1">Profil Akun</h3>
                <p className="text-slate-500 text-sm font-medium">Pengaturan & Tagihan.</p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm">
            <div className="hidden md:block pl-2">
              <span className="font-bold text-[#0F172A]">Filter Kategori</span>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/20' : 'bg-transparent text-slate-500 hover:bg-[#F0F9FF] hover:text-[#0284C7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(item => (
                <ProductCard key={item.id} title={item.name} category={item.category} price={item.price} image={item.image} onAddToCart={() => setSelectedProduct(item)} />
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[24px] border border-slate-100">
                <div className="w-16 h-16 bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center text-2xl mb-4">🏝️</div>
                <h3 className="text-lg font-bold text-[#0F172A]">Data belum tersedia</h3>
                <p className="text-slate-500 font-medium mt-1">Kategori ini masih kosong, coba pilih yang lain.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            
            <div className="w-full md:w-1/2 bg-slate-50 p-8 border-r border-slate-100 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-[#0F172A]">Riwayat Tiket</h3>
                <button onClick={() => { setIsTicketModalOpen(false); setSelectedTicket(null); setActiveTicketTab('Aktif'); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full font-bold text-slate-500">✕</button>
              </div>

              <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-6">
                <button 
                  onClick={() => { setActiveTicketTab('Aktif'); setSelectedTicket(null); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTicketTab === 'Aktif' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Belum Digunakan
                </button>
                <button 
                  onClick={() => { setActiveTicketTab('Selesai'); setSelectedTicket(null); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTicketTab === 'Selesai' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Selesai
                </button>
              </div>
              
              {displayedTickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                  <span className="text-5xl mb-3">{activeTicketTab === 'Aktif' ? '🎟️' : '✅'}</span>
                  <p className="font-bold">Tidak ada tiket</p>
                  <p className="text-sm">
                    {activeTicketTab === 'Aktif' 
                      ? 'Kamu belum memiliki pesanan aktif.' 
                      : 'Belum ada tiket yang selesai digunakan.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {displayedTickets.map((ticket, index) => (
                    <div 
                      key={ticket.id || index} 
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'border-[#0284C7] bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] px-2 py-1 rounded-md uppercase tracking-wider">
                          {ticket.asset_category || 'Wisata'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ticket.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {ticket.status || 'Pending'}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#0F172A] leading-tight mb-1">{ticket.asset_name || `Pesanan #${ticket.id}`}</h4>
                      <p className="text-xs text-slate-500 font-medium">Berangkat: {new Date(ticket.booking_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bagian Kanan: Detail & QR Code */}
            <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative bg-white">
              <button onClick={() => { setIsTicketModalOpen(false); setSelectedTicket(null); setActiveTicketTab('Aktif'); }} className="hidden md:flex absolute top-6 right-6 w-10 h-10 items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold transition-colors">✕</button>
              
              {selectedTicket ? (
                <div className="w-full max-w-sm text-center">
                  <h4 className="text-lg font-black text-[#0F172A] mb-2">{selectedTicket.asset_name || 'Tiket Wisata Pahawang'}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-8">
                    {selectedTicket.status === 'Completed' 
                      ? 'Tiket ini sudah di-scan dan berhasil digunakan.' 
                      : 'Scan QR Code ini pada petugas kami di lokasi keberangkatan.'}
                  </p>
                  
                  <div className={`inline-block p-6 bg-white border-2 border-dashed rounded-3xl mb-6 relative ${selectedTicket.status === 'Completed' ? 'border-green-200 opacity-60' : 'border-slate-200'}`}>
                    {selectedTicket.status === 'Completed' && (
                       <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 rounded-3xl backdrop-blur-[1px]">
                          <div className="bg-green-500 text-white text-sm font-black px-4 py-2 rounded-full rotate-[-15deg] shadow-lg border-2 border-white">TERPAKAI</div>
                       </div>
                    )}
                    <QRCodeSVG 
                      value={`PHW-TICKET-${selectedTicket.id}-${selectedTicket.customer_name}`} 
                      size={200} 
                      bgColor={"#ffffff"}
                      fgColor={"#0F172A"}
                      level={"H"}
                    />
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 w-full mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                      <span>NAMA PEMESAN</span>
                      <span className="text-[#0F172A]">{selectedTicket.customer_name}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                      <span>TANGGAL</span>
                      <span className="text-[#0F172A]">{new Date(selectedTicket.booking_date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                      <span>JUMLAH PAX</span>
                      <span className="text-[#0F172A]">{selectedTicket.quantity || 1}x</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 border-t border-slate-200 pt-2 mt-2">
                      <span>TOTAL BAYAR</span>
                      <span className="text-[#0284C7] font-black">{formatRupiah(selectedTicket.total_price)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-40">
                  <IconTicket />
                  <p className="mt-4 font-bold text-lg text-[#0F172A]">Pilih tiket di samping</p>
                  <p className="text-sm text-slate-500">Pilih salah satu tiket untuk melihat QR Code.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-[#0F172A]/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative animate-[bounce_0.3s_ease-out]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button>
            <div className="w-full h-48 rounded-[20px] overflow-hidden mb-6 mt-2">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-widest bg-[#E0F2FE] px-3 py-1 rounded-full mb-3 inline-block">{selectedProduct.category}</span>
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2 leading-tight">{selectedProduct.name}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{selectedProduct.description}</p>
            <div className="flex items-center justify-between mb-8 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Harga</span>
              <span className="text-2xl font-black text-[#0284C7]">{formatRupiah(selectedProduct.price)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedProduct(null)} className="w-1/3 py-4 rounded-full border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all">Batal</button>
              <button onClick={confirmAddToCart} className="w-2/3 py-4 rounded-full bg-[#0284C7] text-white font-bold shadow-lg shadow-[#0284C7]/30 hover:bg-[#0369A1] hover:shadow-xl transition-all">Ya, Pesan!</button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-sm z-[70] transition-opacity" onClick={() => setIsCartOpen(false)}></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[80] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center"><IconCart /></div>
            <h3 className="text-xl font-bold text-[#0F172A]">Keranjang Saya</h3>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <span className="text-6xl mb-4">📭</span>
              <p className="font-bold text-[#0F172A] text-lg">Keranjangnya masih kosong</p>
              <p className="text-slate-500 text-sm">Ayo mulai eksplorasi liburanmu!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              <div className="bg-[#E0F2FE] border border-[#BAE6FD] p-4 rounded-2xl flex gap-3 items-start">
                <span className="text-lg">💡</span>
                <div>
                  <h4 className="text-[#0369A1] font-bold text-sm mb-1">Cek Kembali Pesananmu</h4>
                  <p className="text-[#0284C7] text-xs font-medium leading-relaxed">
                    Pastikan jumlah barang sudah pas ya. Untuk jadwal keberangkatan dan data peserta, nanti bisa kamu atur di halaman pembayaran.
                  </p>
                </div>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-sm leading-tight line-clamp-2">{item.name}</h4>
                      <p className="text-[#0284C7] font-black text-sm mt-1">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors font-bold">-</button>
                        <span className="w-8 text-center text-xs font-bold text-[#0F172A]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-[#E0F2FE] hover:text-[#0284C7] transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-medium">Total Pembayaran</span>
            <span className="text-2xl font-black text-[#0F172A]">{formatRupiah(totalPrice)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => navigate('/checkout', { state: { cart, totalPrice } })}
            className={`w-full py-4 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2 mb-3 ${
              cart.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-slate-900/20 hover:shadow-xl active:scale-95'
            }`}
          >
            Lanjut ke Pembayaran <span>➔</span>
          </button>
          
          {cart.length > 0 && (
             <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center py-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
             >
                Pilih Produk Lainnya
             </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}