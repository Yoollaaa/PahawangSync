import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import bgLanding from '../assets/landingpage.jpeg';


const TOURISM_CATEGORIES = ['Hutan', 'Gunung', 'Laut', 'Satwa Liar', 'Theme Park'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [editId, setEditId] = useState(null); 
  const [assets, setAssets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [financeData, setFinanceData] = useState({ balance: 0, transactions: [] });
  const [scanMessage, setScanMessage] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ revenue: 0, guestsToday: 0 });
  const [adminName, setAdminName] = useState('Administrator'); 
  
  const [formData, setFormData] = useState({ name: '', category: 'Laut', price: '', stock: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const dataAdminStr = localStorage.getItem('adminData'); 
    
    if (!token) {
      alert("Akses ditolak! Silakan login sebagai Admin terlebih dahulu.");
      navigate('/admin'); 
    } else {
      if (dataAdminStr) {
        const adminData = JSON.parse(dataAdminStr);
        setAdminName(adminData.name); 
      }      
      fetchAssets();
    }
  }, [navigate]);

  const fetchAssets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/assets');
      setAssets(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reservations');
      setReservations(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchFinance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/finance');
      setFinanceData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard-stats');
      const data = await res.json();
      setDashboardStats(data);
    } catch (e) { console.error("Gagal menarik data dashboard:", e); }
  };

  useEffect(() => {
    if (activeMenu === 'dashboard') fetchDashboardStats();
    if (activeMenu === 'dashboard') fetchReservations();
    if (activeMenu === 'dashboard') fetchFinance();
    else if (activeMenu === 'inventory') fetchAssets();
    else if (activeMenu === 'calendar') fetchReservations();
    else if (activeMenu === 'finance') fetchFinance();
    
    // Tutup menu mobile setiap kali pindah tab
    setIsMobileMenuOpen(false);
  }, [activeMenu]);

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock, 
      image_url: item.image_url || '', 
      description: item.description || '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', category: 'Laut', price: '', stock: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      image_url: formData.image_url,    
      description: formData.description
    };

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/assets/${editId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/assets', payload);
      }
      
      await fetchAssets(); 
      
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', category: 'Laut', price: '', stock: '', image_url: '', description: '' });
      
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data. Cek terminal/console.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus aset ini?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/assets/${id}`, { method: 'DELETE' });
        if (res.ok) fetchAssets();
      } catch (e) { console.error(e); }
    }
  };

  const handleConfirmReservation = async (id) => {
    if (!id) {
      alert("Oops! ID pesanan kosong.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}/confirm`, { 
        method: 'PUT' 
      });
      
      if (response.ok) {
        fetchReservations();
      } else {
        alert(`Gagal mengkonfirmasi! Server menolak dengan status: ${response.status}`);
      }
    } catch (e) { 
      console.error("❌ Error jaringan/server:", e); 
      alert("Terjadi kesalahan jaringan atau server backend belum menyala.");
    }
  };

  const getDisplayStatus = (status, dateString) => {
    if (status === 'Pending') return 'Pending';

    const bookingDate = new Date(dateString);
    const today = new Date();
    
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (status === 'Confirmed' && bookingDate < today) {
      return 'Completed'; 
    }

    return status;
  };

  const handleScanTicket = async (text) => {
    if (text) {
      try {
        const idTiketAsli = text; 

        if (!idTiketAsli) {
            setScanMessage({ type: 'error', text: 'QR Code kosong atau tidak terbaca!' });
            return;
        }

        const safeUrl = `http://localhost:5000/api/reservations/${encodeURIComponent(idTiketAsli)}/complete`;
        const response = await fetch(safeUrl, { method: 'PUT' });
        
        if (response.ok) {
          setScanMessage({ type: 'success', text: `Berhasil! Tiket telah divalidasi dan stok dikurangi.` });
          fetchReservations(); 
        } else {
          const errorData = await response.json();
          setScanMessage({ type: 'error', text: errorData.error || `Gagal memvalidasi tiket.` });
        }
      } catch (e) { 
        console.error(e); 
        setScanMessage({ type: 'error', text: 'Terjadi kesalahan jaringan atau server mati.' });
      }
    }
  };

  const handleWithdraw = async () => {
    const amountStr = window.prompt(`Saldo Tersedia: ${formatRupiah(financeData.balance)}\n\nMasukkan nominal uang yang ingin ditarik (Contoh: 500000):`);
    if (!amountStr) return;
    
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Nominal yang dimasukkan tidak valid!");
    if (amount > financeData.balance) return alert("Saldo kamu tidak mencukupi untuk penarikan ini!");

    try {
      const response = await fetch('http://localhost:5000/api/finance/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        alert("Berhasil! Penarikan dana sedang diproses ke rekeningmu.");
        fetchFinance(); 
      } else {
        alert("Gagal memproses penarikan.");
      }
    } catch (error) {
      console.error("Error withdraw:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar dari panel pengelola?")) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');      
      navigate('/admin');
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const availableAssets = assets.filter((item) => Number(item.stock) > 0).length;
  const unavailableAssets = assets.filter((item) => Number(item.stock) <= 0).length;
  const activeReservations = reservations.filter((item) => item.status === 'Pending' || item.status === 'Confirmed').length;
  const completedReservations = reservations.filter((item) => item.status === 'Completed').length;
  const categoryAnalytics = TOURISM_CATEGORIES.map((category) => ({
    category,
    count: assets.filter((item) => item.category === category).length,
  }));
  const currentMonth = new Date();
  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();
  const monthlyTargets = {
    revenue: 30000000,
    reservations: 120,
    bookedUnits: 250,
  };
  const monthlyReservations = reservations.filter((reservation) => {
    const bookingDate = new Date(reservation.booking_date);
    return bookingDate.getMonth() === currentMonthIndex && bookingDate.getFullYear() === currentYear;
  });
  const monthlyRevenue = financeData.transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'Pemasukan' && transactionDate.getMonth() === currentMonthIndex && transactionDate.getFullYear() === currentYear;
    })
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const revenueValue = dashboardStats.revenue || monthlyRevenue;
  const monthlyBookedUnits = monthlyReservations.reduce((total, reservation) => total + Number(reservation.quantity || 0), 0);
  const categoryMax = Math.max(...categoryAnalytics.map((item) => item.count), 1);
  const revenueProgress = Math.min((revenueValue / monthlyTargets.revenue) * 100, 100);
  const reservationProgress = Math.min((monthlyReservations.length / monthlyTargets.reservations) * 100, 100);
  const unitsProgress = Math.min((monthlyBookedUnits / monthlyTargets.bookedUnits) * 100, 100);
  const latestBookingDate = reservations.length > 0
    ? reservations.reduce((latest, reservation) => {
        const reservationDate = new Date(reservation.booking_date);
        return reservationDate > latest ? reservationDate : latest;
      }, new Date(reservations[0].booking_date))
    : new Date();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const trendDate = new Date(latestBookingDate);
    trendDate.setDate(latestBookingDate.getDate() - (6 - index));
    const totalBookings = reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.booking_date);
      return reservationDate.getFullYear() === trendDate.getFullYear() && reservationDate.getMonth() === trendDate.getMonth() && reservationDate.getDate() === trendDate.getDate();
    }).reduce((total, reservation) => total + Number(reservation.quantity || 0), 0);
    return {
      label: trendDate.toLocaleDateString('id-ID', { day: 'numeric' }),
      value: totalBookings,
    };
  });
  const trendMax = Math.max(...lastSevenDays.map((item) => item.value), 1);
  const reservationStatusData = [
    { label: 'Pending', value: reservations.filter((item) => item.status === 'Pending').length, color: '#F59E0B' },
    { label: 'Confirmed', value: reservations.filter((item) => item.status === 'Confirmed').length, color: '#0284C7' },
    { label: 'Completed', value: reservations.filter((item) => item.status === 'Completed').length, color: '#10B981' },
  ];
  const topCategories = [...categoryAnalytics].sort((a, b) => b.count - a.count);
  const peakTrendDay = lastSevenDays.reduce((best, current) => (current.value > best.value ? current : best), lastSevenDays[0] || { label: '', value: 0 });
  const reservationTotal = Math.max(reservations.length, 1);
  const businessHealth = [
    {
      label: 'Occupancy',
      value: assets.length > 0 ? Math.round((availableAssets / assets.length) * 100) : 0,
      hint: 'aset siap dipakai',
      color: 'from-[#0EA5E9] to-[#67E8F9]'
    },
    {
      label: 'Pendapatan',
      value: Math.round(revenueProgress),
      hint: 'terhadap target bulanan',
      color: 'from-[#8B5CF6] to-[#C4B5FD]'
    },
    {
      label: 'Booking flow',
      value: Math.round(reservationProgress),
      hint: 'reservasi bulan ini',
      color: 'from-[#F97316] to-[#FDBA74]'
    },
  ];

 return (
    <div 
      className="min-h-screen text-slate-800 font-sans bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="min-h-screen bg-slate-50/60 backdrop-blur-sm">
        
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 md:bg-white/70 border-b border-white/50 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              <div className="flex items-center gap-4 md:gap-8">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                <div className="flex-shrink-0 font-black text-xl text-[#0A2540] tracking-tight cursor-default shadow-white/50 drop-shadow-sm">
                  Pahawang<span className="text-[#0284C7]">Sync</span>
                </div>
                
                <div className="hidden md:flex space-x-1">
                  <button onClick={() => setActiveMenu('dashboard')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeMenu === 'dashboard' ? 'bg-white/80 text-[#0284C7] shadow-sm' : 'text-slate-600 hover:text-[#0A2540] hover:bg-white/50'}`}>Dashboard</button>
                  <button onClick={() => setActiveMenu('inventory')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeMenu === 'inventory' ? 'bg-white/80 text-[#0284C7] shadow-sm' : 'text-slate-600 hover:text-[#0A2540] hover:bg-white/50'}`}>Data Aset</button>
                  <button onClick={() => setActiveMenu('calendar')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeMenu === 'calendar' ? 'bg-white/80 text-[#0284C7] shadow-sm' : 'text-slate-600 hover:text-[#0A2540] hover:bg-white/50'}`}>Kalender Reservasi</button>
                  <button onClick={() => setActiveMenu('finance')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeMenu === 'finance' ? 'bg-white/80 text-[#0284C7] shadow-sm' : 'text-slate-600 hover:text-[#0A2540] hover:bg-white/50'}`}>Finansial</button>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => setActiveMenu('scanner')}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-sm font-bold shadow-md transition-all flex items-center gap-2 ${activeMenu === 'scanner' ? 'bg-[#0284C7] text-white shadow-blue-500/30' : 'bg-[#0A2540] text-white hover:bg-[#1E3A8A] shadow-blue-900/20'}`}
                >
                  📷 <span className="hidden sm:inline">Scan</span>
                </button>
                
                <div className="h-6 w-px bg-slate-300/50 mx-1 md:mx-2 hidden sm:block"></div>

                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-[#0F172A]">{adminName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Administrator</p>
                </div>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-[10px] md:rounded-[14px] bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center font-black text-sm md:text-lg text-[#0284C7]">
                  {adminName.charAt(0).toUpperCase()} 
                </div>

                <button onClick={handleLogout} className="p-1 md:p-2 text-slate-500 hover:text-red-500 hover:bg-white/80 rounded-full transition-all" title="Keluar">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0 py-2 px-4 flex flex-col gap-2">
              <button onClick={() => setActiveMenu('dashboard')} className={`text-left px-4 py-3 rounded-lg text-sm font-semibold ${activeMenu === 'dashboard' ? 'bg-[#F0F9FF] text-[#0284C7]' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboard</button>
              <button onClick={() => setActiveMenu('inventory')} className={`text-left px-4 py-3 rounded-lg text-sm font-semibold ${activeMenu === 'inventory' ? 'bg-[#F0F9FF] text-[#0284C7]' : 'text-slate-600 hover:bg-slate-50'}`}>Data Aset</button>
              <button onClick={() => setActiveMenu('calendar')} className={`text-left px-4 py-3 rounded-lg text-sm font-semibold ${activeMenu === 'calendar' ? 'bg-[#F0F9FF] text-[#0284C7]' : 'text-slate-600 hover:bg-slate-50'}`}>Kalender Reservasi</button>
              <button onClick={() => setActiveMenu('finance')} className={`text-left px-4 py-3 rounded-lg text-sm font-semibold ${activeMenu === 'finance' ? 'bg-[#F0F9FF] text-[#0284C7]' : 'text-slate-600 hover:bg-slate-50'}`}>Finansial</button>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in-up">
          
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A2540] tracking-tight drop-shadow-sm">
              {activeMenu === 'dashboard' && 'Ringkasan Operasional'}
              {activeMenu === 'inventory' && 'Manajemen Aset & Stok'}
              {activeMenu === 'calendar' && 'Kalender Kedatangan'}
              {activeMenu === 'scanner' && 'Scan Kedatangan'}
              {activeMenu === 'finance' && 'Dompet Keuangan'}
            </h2>
            <p className="text-slate-600 mt-1 font-medium text-xs md:text-sm drop-shadow-sm">
              {activeMenu === 'dashboard' && 'Pantau performa dan ringkasan data hari ini.'}
              {activeMenu === 'inventory' && 'Kelola ketersediaan fasilitas dan harga sewa.'}
              {activeMenu === 'calendar' && 'Pantau jadwal kedatangan tamu dan reservasi.'}
              {activeMenu === 'scanner' && 'Validasi QR Code dari tiket wisatawan.'}
              {activeMenu === 'finance' && 'Pantau pendapatan riil dan cairkan dana.'}
            </p>
          </header>

          {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">

            <div className="md:col-span-2 relative p-6 md:p-8 rounded-3xl overflow-hidden shadow-xl border border-white/20 group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596395827361-9f9de58f12cc?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#091E3A]/95 via-[#091E3A]/70 to-[#091E3A]/40 md:to-transparent"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px] md:min-h-[220px]">
                <div>
                  <h3 className="text-[#48CAE4] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">Status Operasional</h3>
                  <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-md">Siap Menyambut Tamu! 🌊</h2>
                </div>
                <div className="mt-6 md:mt-8">
                  <p className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Kedatangan Hari Ini</p>
                  <p className="text-4xl md:text-6xl font-black text-white">{dashboardStats.guestsToday} <span className="text-lg md:text-xl font-medium text-white/70">Orang</span></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] p-6 md:p-8 rounded-3xl overflow-hidden shadow-xl border border-white/10 relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#48CAE4]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px] md:min-h-[220px]">
                <div>
                  <h3 className="text-[#48CAE4] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2">Total Pendapatan</h3>
                  <p className="text-2xl md:text-4xl font-black text-white tracking-tight">{formatRupiah(dashboardStats.revenue)}</p>
                </div>
                <button 
                  onClick={() => setActiveMenu('finance')} 
                  className="mt-6 md:mt-8 w-full py-2.5 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-bold rounded-xl transition-all border border-white/10 flex justify-between items-center px-4 md:px-5"
                >
                  <span>Buka Dompet</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-3 relative p-6 md:p-8 rounded-3xl overflow-hidden shadow-xl border border-white/20 group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0284C7]/95 via-[#0284C7]/80 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end h-full min-h-[140px] md:min-h-[160px] gap-4 md:gap-6">
                <div>
                  <h3 className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2 drop-shadow-md">Kapasitas Fasilitas Vendor</h3>
                  <p className="text-3xl md:text-5xl font-black text-white drop-shadow-md">{assets.length} <span className="text-lg md:text-xl font-medium text-white/90">Aset Tersedia</span></p>
                </div>
                <button 
                  onClick={() => setActiveMenu('inventory')} 
                  className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 bg-white text-[#0284C7] text-xs md:text-sm font-black uppercase tracking-wider rounded-xl shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 text-center"
                >
                  Kelola Inventaris
                </button>
              </div>
            </div>

            <div className="md:col-span-3 rounded-[30px] overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.18)] border border-white/70 bg-white/80 backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.14),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.95))]"></div>
              <div className="relative z-10 p-5 md:p-7 lg:p-8 text-[#0F172A]">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-[#0284C7] mb-2">Business analytics</p>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A]">Analitik Wisata</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Data real dari kalender reservasi, inventaris, dan transaksi bulan ini.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest bg-[#0F172A] text-white shadow-sm">Live data</span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white text-slate-600 border border-slate-200 shadow-sm">This month</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
                  {businessHealth.map((item) => (
                    <div key={item.label} className="rounded-[22px] p-4 md:p-5 bg-white/80 border border-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">{item.label}</p>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-3xl font-black text-[#0F172A]">{item.value}%</p>
                          <p className="text-xs text-slate-500 mt-1">{item.hint}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-4">
                  <div className="rounded-[28px] bg-[#0F172A] text-white p-5 md:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.25)] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.35),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.2),_transparent_30%)]"></div>
                    <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h4 className="font-black text-lg md:text-xl">Tren Booking 7 Hari</h4>
                        <p className="text-white/65 text-sm mt-1">Jumlah unit yang dipesan dari kalender reservasi.</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2 text-right backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">Peak day</p>
                        <p className="text-lg font-black">{peakTrendDay.label || '-'}</p>
                        <p className="text-xs text-white/60">{peakTrendDay.value} unit</p>
                      </div>
                    </div>

                    <div className="relative z-10 h-64 md:h-72">
                      <svg viewBox="0 0 700 300" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="trendLineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#22D3EE" stopOpacity="1" />
                          </linearGradient>
                          <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.03" />
                          </linearGradient>
                        </defs>

                        {[0, 1, 2, 3].map((line) => (
                          <line key={line} x1="40" y1={50 + line * 55} x2="660" y2={50 + line * 55} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                        ))}

                        {(() => {
                          const chartWidth = 620;
                          const chartHeight = 200;
                          const originX = 40;
                          const originY = 245;
                          const points = lastSevenDays.map((day, index) => {
                            const x = originX + (chartWidth / (lastSevenDays.length - 1)) * index;
                            const y = originY - (day.value / trendMax) * chartHeight;
                            return { x, y, value: day.value, label: day.label };
                          });
                          const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
                          const areaPath = `${linePath} L ${points[points.length - 1].x} ${originY} L ${points[0].x} ${originY} Z`;

                          return (
                            <>
                              <path d={areaPath} fill="url(#trendAreaGradient)" />
                              <path d={linePath} fill="none" stroke="url(#trendLineGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                              {points.map((point) => (
                                <g key={`${point.label}-${point.x}`}>
                                  <circle cx={point.x} cy={point.y} r="8" fill="#0F172A" stroke="#7DD3FC" strokeWidth="4" />
                                  <text x={point.x} y="277" textAnchor="middle" fill="rgba(255,255,255,0.78)" fontSize="13" fontWeight="700">{point.label}</text>
                                  <text x={point.x} y={point.y - 18} textAnchor="middle" fill="#E0F2FE" fontSize="12" fontWeight="700">{point.value}</text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] bg-white/90 border border-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-5 md:p-6">
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                          <h4 className="font-black text-[#0F172A]">Komposisi Reservasi</h4>
                          <p className="text-xs text-slate-500 mt-1">Status kalender yang sedang berjalan.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0284C7]">Realtime</span>
                      </div>

                      <div className="relative mx-auto w-44 h-44 md:w-52 md:h-52">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="42" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                          {reservationStatusData.map((item, index) => {
                            const offset = reservationStatusData.slice(0, index).reduce((sum, current) => sum + current.value, 0);
                            const circumference = 264;
                            const strokeDasharray = `${(item.value / reservationTotal) * circumference} ${circumference}`;
                            const strokeDashoffset = -(offset / reservationTotal) * circumference;
                            return (
                              <circle
                                key={item.label}
                                cx="60"
                                cy="60"
                                r="42"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="12"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Total</p>
                          <p className="text-4xl font-black text-[#0F172A]">{reservations.length}</p>
                          <p className="text-xs text-slate-500 mt-1">Reservasi tercatat</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {reservationStatusData.map((item) => (
                          <div key={item.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                            <p className="text-lg font-black text-[#0F172A]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-white/90 border border-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-5 md:p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <h4 className="font-black text-[#0F172A]">Top Kategori</h4>
                          <p className="text-xs text-slate-500 mt-1">Kategori wisata paling aktif.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Chart</span>
                      </div>

                      <div className="space-y-3">
                        {topCategories.map((item, index) => {
                          const barWidth = assets.length > 0 ? Math.max((item.count / assets.length) * 100, item.count > 0 ? 10 : 0) : 0;
                          const accent = ['from-[#0EA5E9] to-[#38BDF8]', 'from-[#F97316] to-[#FDBA74]', 'from-[#22C55E] to-[#86EFAC]', 'from-[#8B5CF6] to-[#C4B5FD]', 'from-[#EC4899] to-[#F9A8D4]'][index % 5];
                          return (
                            <div key={item.category}>
                              <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="font-semibold text-slate-700">{item.category}</span>
                                <span className="font-black text-[#0F172A]">{item.count} item</span>
                              </div>
                              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${accent}`} style={{ width: `${barWidth}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[28px] bg-white/90 border border-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-5 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                    <div>
                      <h4 className="font-black text-[#0F172A] text-lg md:text-xl">Target Pencapaian Bulanan</h4>
                      <p className="text-sm text-slate-500 mt-1">Realisasi bisnis berdasarkan data reservasi dan transaksi bulan ini.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest">Revenue</span>
                      <span className="px-3 py-1.5 rounded-full bg-[#F97316]/10 text-[#C2410C] text-[10px] font-black uppercase tracking-widest">Reservations</span>
                      <span className="px-3 py-1.5 rounded-full bg-[#22C55E]/10 text-[#15803D] text-[10px] font-black uppercase tracking-widest">Units</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Pendapatan</span>
                        <span className="font-black text-[#0F172A]">{revenueProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#0F172A] via-[#0284C7] to-[#38BDF8]" style={{ width: `${revenueProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Target: {formatRupiah(monthlyTargets.revenue)} · Realisasi: {formatRupiah(revenueValue)}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Reservasi</span>
                        <span className="font-black text-[#0F172A]">{reservationProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FDE68A]" style={{ width: `${reservationProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Target: {monthlyTargets.reservations} reservasi · Realisasi: {monthlyReservations.length}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Unit Terpesan</span>
                        <span className="font-black text-[#0F172A]">{unitsProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#22C55E] via-[#4ADE80] to-[#BBF7D0]" style={{ width: `${unitsProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Target: {monthlyTargets.bookedUnits} unit · Realisasi: {monthlyBookedUnits} unit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeMenu === 'inventory' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-[#091E3A]">Daftar Fasilitas</h3>
              <button onClick={() => { setEditId(null); setFormData({ name: '', category: 'Laut', price: '', stock: '' }); setIsModalOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white text-sm font-semibold rounded-lg transition-all shadow-md text-center">Tambah Aset</button>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-slate-100/50 text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">
                    <th className="py-4 px-2 font-bold">Nama Item</th><th className="py-4 px-2 font-bold">Kategori</th><th className="py-4 px-2 font-bold">Harga Sewa</th><th className="py-4 px-2 font-bold text-center">Stok</th><th className="py-4 px-2 font-bold">Status</th><th className="py-4 px-2 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#1E293B]">
                  {assets.length === 0 ? (
                    <tr><td colSpan="6" className="py-10 text-center text-slate-400">Belum ada data fasilitas.</td></tr>
                  ) : (
                    assets.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100/50 hover:bg-slate-50/80 transition-all whitespace-nowrap">
                        <td className="py-4 px-2">{item.name}</td>
                        <td className="py-4 px-2"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold">{item.category}</span></td>
                        <td className="py-4 px-2">{formatRupiah(item.price)}</td>
                        
                        <td className="py-4 px-2 text-center">
                          <span className="font-bold text-[#0284C7]">{item.stok_hari_ini !== undefined ? item.stok_hari_ini : item.stock}</span>
                          <span className="text-xs text-slate-400"> / {item.stock}</span>
                        </td>

                        <td className="py-4 px-2"><span className={`px-3 py-1 rounded text-[10px] md:text-xs font-bold ${item.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{item.status}</span></td>
                        <td className="py-4 px-2 text-right space-x-2">
                          <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold transition-all">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded text-xs font-bold transition-all">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'calendar' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="text-lg font-bold text-[#091E3A]">Jadwal Kedatangan Wisatawan</h3>
              <span className="text-[10px] md:text-xs font-semibold bg-blue-50 text-[#00B4D8] px-3 py-1 rounded-full">Real-time Schedule</span>
            </div>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="py-10 text-center text-slate-400">Belum ada jadwal pemesanan.</div>
              ) : (
                reservations.map((res) => {
                  const formattedDate = new Date(res.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                  return (
                    <div key={res.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100/50 rounded-lg hover:bg-slate-50 transition-all bg-white/50 gap-4">
                      <div className="flex items-start gap-3 md:gap-4 w-full md:w-auto">
                        <div className="bg-[#F0F4F8] border-l-4 border-l-[#00B4D8] p-2 md:p-3 text-center rounded min-w-[70px] md:min-w-[100px] shrink-0">
                          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Tanggal</p>
                          <p className="text-sm md:text-base font-bold text-[#091E3A]">{new Date(res.booking_date).getDate()}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#091E3A] truncate">{res.customer_name}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 truncate">Menyewa: <span className="font-semibold text-slate-700">{res.asset_name}</span> ({res.quantity} Unit)</p>
                          <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto flex justify-end">
                        {res.status === 'Pending' ? (
                          <button onClick={() => handleConfirmReservation(res.id)} className="w-full md:w-auto px-4 py-2 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded text-xs font-bold transition-all shadow-md">
                            Konfirmasi Stok
                          </button>
                        ) : (
                          <span className={`px-3 py-1.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider text-center w-full md:w-auto ${
                            getDisplayStatus(res.status, res.booking_date) === 'Completed' 
                              ? 'bg-slate-100 text-slate-500' 
                              : 'bg-emerald-50 text-emerald-600' 
                          }`}>
                            {getDisplayStatus(res.status, res.booking_date) === 'Completed' ? 'Selesai/Dipakai' : 'Siap Pakai'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeMenu === 'scanner' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-4 md:p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-bold text-[#091E3A]">Validasi Tiket</h3>
              <span className="text-[10px] md:text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">Kamera Aktif</span>
            </div>
            <div className="w-full max-w-sm md:max-w-md bg-[#091E3A] p-2 rounded-2xl shadow-2xl relative overflow-hidden">
              {scanMessage && (
                <div className={`absolute top-4 left-4 right-4 z-10 p-3 rounded-lg text-center text-xs md:text-sm font-bold shadow-lg transition-all ${scanMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                  {scanMessage.text}
                  <button onClick={() => setScanMessage(null)} className="block w-full mt-2 text-[10px] md:text-xs opacity-80 hover:opacity-100">Tutup</button>
                </div>
              )}
              <div className="rounded-xl overflow-hidden aspect-square border-4 border-slate-700 relative bg-black">
                 <Scanner onScan={(detectedCodes) => { if (detectedCodes && detectedCodes.length > 0) handleScanTicket(detectedCodes[0].rawValue); }} onError={(error) => console.log(error?.message)} />
              </div>
            </div>
          </div>
        )}
        
        {activeMenu === 'finance' && (
          <div className="space-y-4 md:space-y-6">
            
            <div className="bg-gradient-to-r from-[#091E3A] to-[#1A365D] rounded-xl shadow-xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-[#48CAE4] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2">Total Saldo Tersedia</p>
                <h3 className="text-3xl md:text-5xl font-black">{formatRupiah(financeData.balance)}</h3>
              </div>
              <button onClick={handleWithdraw} className="w-full md:w-auto px-6 py-3 bg-[#00B4D8] hover:bg-[#48CAE4] text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 text-center">
                Cairkan Dana
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-4 md:p-6">
              <h3 className="text-lg font-bold text-[#091E3A] mb-4 md:mb-6">Riwayat Transaksi</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-slate-100/50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">
                      <th className="py-4 px-2 font-bold w-32 md:w-48">Tanggal</th>
                      <th className="py-4 px-2 font-bold">Deskripsi</th>
                      <th className="py-4 px-2 font-bold text-center">Tipe</th>
                      <th className="py-4 px-2 font-bold text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm font-medium text-[#1E293B]">
                    {financeData.transactions.length === 0 ? (
                      <tr><td colSpan="4" className="py-10 text-center text-slate-400">Belum ada aktivitas transaksi.</td></tr>
                    ) : (
                      financeData.transactions.map((t) => {
                        const dateObj = new Date(t.date);
                        const dateStr = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
                        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                        const isIncome = t.type === 'Pemasukan';

                        return (
                          <tr key={t.id} className="border-b border-slate-100/50 hover:bg-slate-50/80 transition-all bg-white/50 whitespace-nowrap">
                            <td className="py-4 px-2 text-slate-500">{dateStr} <span className="text-[10px]">({timeStr})</span></td>
                            <td className="py-4 px-2">{t.description}</td>
                            <td className="py-4 px-2 text-center">
                              <span className={`px-2 md:px-3 py-1 rounded text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className={`py-4 px-2 text-right font-black ${isIncome ? 'text-emerald-500' : 'text-[#1E293B]'}`}>
                              {isIncome ? '+' : '-'}{formatRupiah(t.amount)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      
      </main>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091E3A]/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] border border-slate-100">
              
              <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center shrink-0 rounded-t-2xl">
                <h3 className="text-base md:text-lg font-black text-[#0A2540]">{editId ? 'Edit Data Aset' : 'Tambah Aset Baru'}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-red-500 font-bold text-2xl leading-none px-2">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto custom-scrollbar">
                
                {formData.image_url && (
                  <div className="w-full h-32 md:h-40 rounded-xl bg-cover bg-center border border-slate-200 shadow-inner shrink-0" style={{ backgroundImage: `url('${formData.image_url}')` }}></div>
                )}

                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">URL Foto Produk</label>
                  <input type="url" placeholder="Contoh: https://images.unsplash.com/..." value={formData.image_url || ''} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-1">*Masukkan link gambar HD dari internet atau Unsplash</p>
                </div>

                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Nama Item</label>
                  <input type="text" required placeholder="Contoh: Kano Transparan" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                </div>

                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Deskripsi & Fasilitas</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="Contoh: Kapasitas 2 orang, durasi sewa 1 jam..." 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Kategori</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] cursor-pointer focus:ring-1 focus:ring-[#0284C7]"
                    >
                      {TOURISM_CATEGORIES.includes(formData.category) ? null : (
                        <option value={formData.category}>{formData.category || 'Pilih kategori'}</option>
                      )}
                      <option value="Hutan">Wisata Hutan</option>
                      <option value="Gunung">Wisata Gunung</option>
                      <option value="Laut">Wisata Laut</option>
                      <option value="Satwa Liar">Wisata Satwa Liar</option>
                      <option value="Theme Park">Wisata Theme Park</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Total Unit</label>
                    <input type="number" required min="0" placeholder="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Harga Sewa (Rp)</label>
                  <input type="number" required min="0" placeholder="Contoh: 150000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 md:p-3 mt-1 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                </div>
                
                <div className="flex gap-2 md:gap-3 pt-4 mt-2 border-t border-slate-100 shrink-0">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 md:py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm md:text-base font-bold rounded-xl transition-all">Batal</button>
                  <button type="submit" className="flex-1 py-2.5 md:py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm md:text-base font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">{editId ? 'Update' : 'Simpan'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}