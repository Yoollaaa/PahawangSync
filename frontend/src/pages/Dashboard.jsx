import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import ProductCard from '../components/ProductCard';
import { QRCodeSVG } from 'qrcode.react';

import bgIkan from '../assets/landingpage.jpeg';

const IconCart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconTicket = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 12h20"/><path d="M6 9h.01"/><path d="M6 15h.01"/><path d="M18 9h.01"/><path d="M18 15h.01"/></svg>;
const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('phw_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const [profileFormData, setProfileFormData] = useState({ name: '', email: '', phone: '' });

  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTicketTab, setActiveTicketTab] = useState('Aktif');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('phw_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('phw_cart');
    }
  }, [cart]);

  useEffect(() => {
    if (location.state?.openPayment) {
      setIsPaymentModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const sessionData = localStorage.getItem('user');
      if (!sessionData) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(sessionData);

      if (!parsedUser || !parsedUser.email || !parsedUser.name) {
        localStorage.removeItem('user');
        alert("Sesi Anda bermasalah. Silakan login kembali.");
        navigate('/login');
        return;
      }

      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${parsedUser.email}`);
        const fullUser = userRes.data.data || userRes.data;
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser)); 
      } catch (error) {
        console.error("Gagal menarik data user:", error);
        setUser(parsedUser); 
      }

      try {
        const productRes = await axios.get('http://localhost:5000/api/assets');
        const formattedData = productRes.data.map(item => ({
          ...item,
          image: item.image_url || "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800", 
          description: item.description || "Fasilitas berkualitas dan pelayanan terbaik di Pulau Pahawang."
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      }

      fetchMyTickets(parsedUser.email);
    };

    loadDashboardData();
  }, [navigate]);

  const fetchMyTickets = async (userEmail) => {
    try {
      if (!userEmail) return;
      const response = await axios.get('http://localhost:5000/api/reservations');
      const allTickets = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      const myTickets = allTickets.filter(ticket => {
        const emailDiDatabase = ticket.customer_email ? ticket.customer_email.toLowerCase().trim() : '';
        const emailLogin = userEmail.toLowerCase().trim();
        return emailDiDatabase === emailLogin && emailDiDatabase !== '';
      });
      setUserTickets(myTickets);
    } catch (error) {
      console.error("Gagal mengambil data tiket:", error);
    }
  };

  const handleOpenTicketModal = () => {
    setIsTicketModalOpen(true);
    fetchMyTickets(user?.email);
  };

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
    fetchMyTickets(user?.email); 
  };

  const handleOpenEditProfile = () => {
    setIsProfileModalOpen(false);
    setProfileFormData({
      name: user.name || '',
      email: user.email || 'wisatawan@pahawang.com',
      phone: user.phone || ''
    });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...profileFormData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setIsEditProfileModalOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah kamu yakin ingin keluar?")) {
      localStorage.removeItem('user'); 
      
      localStorage.removeItem('phw_cart');
      localStorage.removeItem('phw_total');
      localStorage.removeItem('phw_date');
      
      navigate('/');
    }
  };

  const filteredProducts = activeCategory === 'Semua' ? products : products.filter(p => p.category === activeCategory);
  const categories = ['Semua', 'Villa', 'Perahu', 'Alat', 'Kuliner'];

  const confirmAddToCart = () => {
    if (selectedProduct) {
      setCart((prevCart) => {
        const existingItem = prevCart.find(item => item.id === selectedProduct.id);
        if (existingItem) {
          return prevCart.map(item => item.id === selectedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
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
        if (item.id === productId) return { ...item, quantity: item.quantity + delta };
        return item;
      }).filter(item => item.quantity > 0); 
    });
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  if (!user || !user.name) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F8FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0284C7] mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Memuat data akun...</p>
      </div>
    );
  }

  const displayedTickets = userTickets.filter(ticket => {
    if (activeTicketTab === 'Aktif') return ticket.status !== 'Completed'; 
    else return ticket.status === 'Completed'; 
  });

  return (
    <div 
      className="min-h-screen text-[#0F172A] font-sans pb-24 selection:bg-[#0EA5E9] selection:text-white bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${bgIkan})` }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[3px] z-0"></div>

      <div className="relative z-10">
        
        <nav className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0284C7] rounded-[14px] flex items-center justify-center shadow-md shadow-[#0284C7]/20">
                <span className="text-white font-bold text-xl italic">P</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Pahawang<span className="text-[#0284C7]">Sync</span></h1>
            </div>
            
            <div className="flex items-center gap-6">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-500 hover:text-[#0284C7] transition-colors cursor-pointer active:scale-95">
                <IconCart />
                {totalItems > 0 && <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">{totalItems}</span>}
              </button>
              <div className="w-px h-6 bg-slate-300"></div>
              
              <button onClick={handleOpenProfileModal} title="Profil Akun" className="flex items-center gap-2 group cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#E0F2FE] group-hover:bg-[#0284C7] group-hover:text-white flex items-center justify-center text-[#0284C7] font-bold ring-2 ring-white shadow-sm transition-all">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-32">
          <header className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3">Eksplorasi laut, <br/><span className="text-[#0284C7] font-serif italic font-medium">{user.name}.</span></h2>
            <p className="text-slate-600 font-medium">Temukan keindahan tersembunyi di Pulau Pahawang hari ini.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-16">
            <div onClick={() => setIsPaymentModalOpen(true)} className="md:col-span-2 group bg-[#0A2540]/90 backdrop-blur-md rounded-[24px] p-8 text-white relative overflow-hidden cursor-pointer border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M200 200H0V100C40 100 60 140 100 140C140 140 160 100 200 100V200Z" fill="#38BDF8"/><path d="M200 200H0V150C30 150 50 180 100 180C150 180 170 150 200 150V200Z" fill="#0284C7"/></svg>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 mb-4"><IconCart /></div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Menu Pembayaran</h3>
                  <p className="text-slate-300 text-sm font-medium">Cek status tagihan dan selesaikan pesananmu.</p>
                </div>
              </div>
            </div>
            
            <div onClick={handleOpenTicketModal} className="group bg-white/80 backdrop-blur-md rounded-[24px] p-8 border border-white cursor-pointer hover:border-[#38BDF8] hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col h-full justify-between min-h-[160px]">
                <div className="w-12 h-12 bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0284C7] group-hover:text-white transition-all duration-300"><IconTicket /></div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-1">Tiket Digital</h3>
                  <p className="text-slate-500 text-sm font-medium">Akses QR Code pesanan.</p>
                </div>
              </div>
            </div>

            <div onClick={handleOpenProfileModal} className="group bg-white/80 backdrop-blur-md rounded-[24px] p-8 border border-white cursor-pointer hover:border-[#38BDF8] hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white/70 backdrop-blur-md p-4 rounded-[20px] border border-white shadow-sm">
              <div className="hidden md:block pl-2"><span className="font-bold text-[#0F172A]">Filter Kategori</span></div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'bg-[#0284C7] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-white'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(item => <ProductCard key={item.id} title={item.name} category={item.category} price={item.price} image={item.image} onAddToCart={() => setSelectedProduct(item)} />)
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-[24px] border border-white shadow-sm">
                  <div className="w-16 h-16 bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center text-2xl mb-4">🏝️</div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Data belum tersedia</h3>
                  <p className="text-slate-500 font-medium mt-1">Kategori ini masih kosong, coba pilih yang lain.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 relative transform transition-all">
            <button onClick={() => { setIsEditProfileModalOpen(false); setIsProfileModalOpen(true); }} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full font-bold text-slate-500 hover:bg-slate-200 transition-colors">✕</button>
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center font-bold">✎</div>
              <h3 className="text-xl font-black text-[#0F172A]">Edit Profil</h3>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input type="text" required value={profileFormData.name} onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Alamat Email</label>
                <input type="email" required value={profileFormData.email} onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor Telepon</label>
                <input type="tel" placeholder="Contoh: 081234567890" value={profileFormData.phone} onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
              </div>
              <div className="pt-4 mt-4">
                <button type="submit" className="w-full py-4 rounded-full bg-[#0284C7] text-white font-bold hover:bg-[#0369A1] transition-all shadow-lg shadow-blue-500/30">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative">

            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full transition-all z-10 font-bold backdrop-blur-md">
              ✕
            </button>

            <div className="h-28 bg-gradient-to-tr from-[#0284C7] to-[#38BDF8]"></div>

            <div className="px-6 pb-8 relative text-center">
              
              <div className="w-24 h-24 mx-auto -mt-12 mb-3 rounded-full p-1.5 bg-white shadow-lg relative">
                <div className="w-full h-full bg-[#F0F9FF] text-[#0284C7] rounded-full flex items-center justify-center text-3xl font-black border border-blue-100">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>

              <h3 className="text-xl font-black text-[#0F172A]">{user.name}</h3>
              <p className="text-slate-500 text-sm font-medium mt-0.5 mb-1">{user.email}</p>
              {user.phone && <p className="text-slate-400 text-xs font-bold mb-5">📞 {user.phone}</p>}

              <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiket Saya</p>
                  <p className="text-xl font-black text-[#0F172A]">{userTickets.length}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Belanja</p>
                  <p className="text-sm font-black text-[#0284C7] mt-1 truncate">{formatRupiah(userTickets.reduce((sum, t) => sum + Number(t.total_price), 0))}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={handleOpenEditProfile} className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 border border-slate-100 transition-all flex items-center justify-between px-5">
                  <span className="flex items-center gap-3"><span className="text-lg">⚙️</span> Pengaturan Profil</span>
                  <span className="text-slate-400 font-normal">➔</span>
                </button>
                <button onClick={handleLogout} className="w-full py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all flex items-center justify-between px-5">
                  <span className="flex items-center gap-3"><span className="text-lg">🚪</span> Keluar Akun</span>
                  <span className="text-red-300 font-normal">➔</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 relative transform transition-all">
            <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full font-bold text-slate-500 hover:bg-slate-200">✕</button>
            <h3 className="text-2xl font-black text-[#0F172A] mb-6">Status Pembayaran</h3>
            {cart.length > 0 ? (
              <div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6">
                  <div className="flex items-center gap-3 mb-2"><span className="text-amber-500 text-xl">⏳</span><h4 className="font-bold text-amber-600">Menunggu Pembayaran</h4></div>
                  <p className="text-sm text-amber-700/80 font-medium">Selesaikan pesananmu agar e-tiket diterbitkan!</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan</h4>
                  <div className="space-y-3 mb-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm"><span className="text-slate-500 font-medium">{item.quantity}x {item.name}</span><span className="font-bold text-[#0F172A]">{formatRupiah(item.price * item.quantity)}</span></div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tagihan</span><span className="text-xl font-black text-[#0284C7]">{formatRupiah(totalPrice)}</span></div>
                </div>
                <button onClick={() => { setIsPaymentModalOpen(false); navigate('/checkout', { state: { cart, totalPrice, autoPay: true } }); }} className="w-full py-4 rounded-full bg-[#0F172A] text-white font-bold hover:bg-[#1E293B] shadow-lg shadow-slate-900/20 transition-all">Lanjutkan Pembayaran ➔</button>
                <button onClick={() => { setCart([]); setIsPaymentModalOpen(false); }} className="w-full text-center mt-4 text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-widest">Batalkan Pesanan</button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">✓</div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">Semua Lunas!</h4>
                <button onClick={() => { setIsPaymentModalOpen(false); handleOpenTicketModal(); }} className="w-full mt-4 py-4 rounded-full bg-[#0284C7] text-white font-bold hover:bg-[#0369A1] shadow-lg">Lihat Tiket Digital</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-md p-4 transition-all">
          
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden h-[90vh] md:h-auto max-h-[90vh] animate-[bounce_0.3s_ease-out]">
            
            <div className={`w-full md:w-5/12 bg-slate-50 p-6 md:p-8 border-r border-slate-100 flex-col overflow-y-auto ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-[#0F172A]">Riwayat Tiket</h3>
                <button onClick={() => { setIsTicketModalOpen(false); setSelectedTicket(null); setActiveTicketTab('Aktif'); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full font-bold text-slate-500">✕</button>
              </div>
              
              <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-6 shadow-inner">
                <button onClick={() => { setActiveTicketTab('Aktif'); setSelectedTicket(null); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTicketTab === 'Aktif' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Masih Aktif</button>
                <button onClick={() => { setActiveTicketTab('Selesai'); setSelectedTicket(null); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTicketTab === 'Selesai' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Selesai</button>
              </div>

              {displayedTickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                  <span className="text-6xl mb-4">{activeTicketTab === 'Aktif' ? '🎟️' : '✅'}</span>
                  <p className="font-bold text-lg text-[#0F172A]">Tidak ada tiket</p>
                  <p className="text-sm mt-1">{activeTicketTab === 'Aktif' ? 'Kamu belum memiliki pesanan wisata.' : 'Belum ada tiket yang selesai digunakan.'}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {displayedTickets.map((ticket, index) => (
                    <div key={ticket.id || index} onClick={() => setSelectedTicket(ticket)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedTicket?.id === ticket.id ? 'border-[#0284C7] bg-[#F0F9FF] shadow-md scale-[1.02]' : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold bg-white text-[#0284C7] px-2.5 py-1 rounded-md border border-[#0284C7]/20 uppercase tracking-wider">{ticket.asset_category || 'Wisata'}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${ticket.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{ticket.status === 'Completed' ? 'Selesai' : 'Aktif'}</span>
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-lg mb-1 leading-tight">{ticket.asset_name}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">📅 {new Date(ticket.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`w-full md:w-7/12 p-6 md:p-10 flex-col items-center justify-center relative bg-gradient-to-br from-slate-50 to-[#E0F2FE]/40 overflow-y-auto md:overflow-visible ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
              
              <button onClick={() => { setIsTicketModalOpen(false); setSelectedTicket(null); setActiveTicketTab('Aktif'); }} className="hidden md:flex absolute top-6 right-6 w-10 h-10 items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-full font-bold transition-all shadow-sm z-10">✕</button>
              
              <div className="w-full md:hidden mb-6 mt-2 flex justify-start">
                <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100">
                  <span>←</span> Kembali
                </button>
              </div>

              {selectedTicket ? (
                <div className="w-full max-w-sm relative group mb-6 md:mb-0">
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-transform duration-500 hover:-translate-y-2">
                    
                    <div className="bg-gradient-to-r from-[#0F172A] to-[#0284C7] p-6 text-center text-white relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                      
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 mb-2">Pahawang E-Ticket</p>
                      <h4 className="text-2xl font-black truncate">{selectedTicket.asset_name}</h4>
                    </div>

                    <div className="p-8 bg-white flex flex-col items-center relative">
                      {selectedTicket.status === 'Completed' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                           <div className="bg-emerald-500 text-white text-sm font-black px-6 py-3 rounded-full rotate-[-15deg] shadow-xl border-4 border-white tracking-widest">TELAH DIGUNAKAN</div>
                        </div>
                      )}
                      <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl group-hover:border-[#0284C7] transition-colors duration-300 shadow-sm">
                        <QRCodeSVG value={`PHW-TICKET-${selectedTicket.id}-${selectedTicket.customer_name}`} size={180} bgColor={"#ffffff"} fgColor={"#0F172A"} level={"H"} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 font-bold tracking-[0.2em] uppercase">ID: PHW-{selectedTicket.id}</p>
                    </div>

                    <div className="relative h-px flex items-center justify-center bg-white">
                      <div className="absolute inset-x-6 border-t-2 border-dashed border-slate-200"></div>
                      <div className="absolute -left-3 w-6 h-6 bg-[#F8FAFC] rounded-full border-r border-slate-100"></div>
                      <div className="absolute -right-3 w-6 h-6 bg-[#F8FAFC] rounded-full border-l border-slate-100"></div>
                    </div>

                    <div className="p-6 bg-slate-50">
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Pemesan</p>
                          <p className="text-sm font-bold text-[#0F172A] truncate">{selectedTicket.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keberangkatan</p>
                          <p className="text-sm font-bold text-[#0F172A]">{new Date(selectedTicket.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pax / Unit</p>
                          <p className="text-sm font-bold text-[#0284C7] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">{selectedTicket.quantity || 1} Pax</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Dibayar</p>
                          <p className="text-sm font-black text-[#0F172A]">{formatRupiah(selectedTicket.total_price)}</p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-40 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4"><IconTicket /></div>
                  <p className="font-bold text-xl text-[#0F172A]">Pilih tiket di samping</p>
                  <p className="text-sm text-slate-500 mt-2 max-w-[200px]">Klik salah satu riwayat pesanan untuk melihat detail E-Ticket dan QR Code.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full">✕</button>
            <div className="w-full h-48 rounded-[20px] overflow-hidden mb-6 mt-2"><img src={selectedProduct.image} className="w-full h-full object-cover" /></div>
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2">{selectedProduct.name}</h3>
            <p className="text-slate-500 text-sm mb-6">{selectedProduct.description}</p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedProduct(null)} className="w-1/3 py-4 rounded-full border-2 border-slate-100 font-bold">Batal</button>
              <button onClick={confirmAddToCart} className="w-2/3 py-4 rounded-full bg-[#0284C7] text-white font-bold">Ya, Pesan!</button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-sm z-[70]" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[80] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Keranjang Saya</h3>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 bg-slate-100 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div><h4 className="font-bold text-[#0F172A] text-sm">{item.name}</h4><p className="text-[#0284C7] font-black text-sm">{formatRupiah(item.price)}</p></div>
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full overflow-hidden w-max mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 font-bold text-slate-500">-</button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 font-bold text-[#0284C7]">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between mb-4"><span className="text-slate-500 font-medium">Total Pembayaran</span><span className="text-2xl font-black text-[#0F172A]">{formatRupiah(totalPrice)}</span></div>
              <button onClick={() => navigate('/checkout', { state: { cart, totalPrice } })} className="w-full py-4 rounded-full bg-[#0F172A] text-white font-bold">Lanjut ke Pembayaran ➔</button>
            </div>
          </div>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}