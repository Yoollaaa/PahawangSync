import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editId, setEditId] = useState(null); 
  const [assets, setAssets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [financeData, setFinanceData] = useState({ balance: 0, transactions: [] });
  const [scanMessage, setScanMessage] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ revenue: 0, guestsToday: 0 });
  
  const [formData, setFormData] = useState({ name: '', category: 'Villa', price: '', stock: '' });

  const fetchAssets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assets');
      setAssets(await res.json());
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
    else if (activeMenu === 'inventory') fetchAssets();
    else if (activeMenu === 'calendar') fetchReservations();
    else if (activeMenu === 'finance') fetchFinance();
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
    setFormData({ name: '', category: 'Villa', price: '', stock: '' });
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
      
      fetchAssets(); 
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', category: 'Villa', price: '', stock: '', image_url: '', description: '' });
      
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
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}/confirm`, { method: 'PUT' });
      if (res.ok) fetchReservations();
    } catch (e) { console.error(e); }
  };

 const handleScanTicket = async (text) => {
    if (text) {
      try {
        const idTiketAsli = text; 

        if (!idTiketAsli) {
            setScanMessage({ type: 'error', text: 'QR Code kosong atau tidak terbaca!' });
            return;
        }

        const response = await fetch(`http://localhost:5000/api/reservations/${idTiketAsli}/complete`, { method: 'PUT' });
        
        if (response.ok) {
          setScanMessage({ type: 'success', text: `Berhasil! Tiket #${idTiketAsli} telah divalidasi.` });
          fetchReservations(); 
        } else {
          const errorData = await response.json();
          setScanMessage({ type: 'error', text: errorData.error || `Gagal memvalidasi tiket #${idTiketAsli}.` });
        }
      } catch (e) { 
        console.error(e); 
        setScanMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
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
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div 
      className="min-h-screen text-slate-800 font-sans bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop')" }}
    >
      
      <div className="min-h-screen bg-slate-50/60 backdrop-blur-sm">
        
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              <div className="flex items-center gap-8">
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

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveMenu('scanner')}
                  className={`px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all flex items-center gap-2 ${activeMenu === 'scanner' ? 'bg-[#0284C7] text-white shadow-blue-500/30' : 'bg-[#0A2540] text-white hover:bg-[#1E3A8A] shadow-blue-900/20'}`}
                >
                  📷 <span className="hidden sm:inline">Scan Kedatangan</span>
                </button>
                
                <div className="h-6 w-px bg-slate-300/50 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-3 cursor-default">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-[#0A2540] drop-shadow-sm">Jihan Vendor</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Administrator</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center font-black text-[#0284C7]">
                    J
                  </div>
                </div>

                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 hover:bg-white/80 rounded-full transition-all" title="Keluar">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
          
          <header className="mb-8">
            <h2 className="text-3xl font-black text-[#0A2540] tracking-tight drop-shadow-sm">
              {activeMenu === 'dashboard' && 'Ringkasan Operasional'}
              {activeMenu === 'inventory' && 'Manajemen Aset & Stok'}
              {activeMenu === 'calendar' && 'Kalender Kedatangan'}
              {activeMenu === 'scanner' && 'Scan Kedatangan'}
              {activeMenu === 'finance' && 'Dompet Keuangan'}
            </h2>
            <p className="text-slate-600 mt-1 font-medium text-sm drop-shadow-sm">
              {activeMenu === 'dashboard' && 'Pantau performa dan ringkasan data hari ini.'}
              {activeMenu === 'inventory' && 'Kelola ketersediaan fasilitas dan harga sewa.'}
              {activeMenu === 'calendar' && 'Pantau jadwal kedatangan tamu dan reservasi.'}
              {activeMenu === 'scanner' && 'Validasi QR Code dari tiket wisatawan.'}
              {activeMenu === 'finance' && 'Pantau pendapatan riil dan cairkan dana.'}
            </p>
          </header>

          {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <div className="md:col-span-2 relative p-8 rounded-3xl overflow-hidden shadow-xl border border-white/20 group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596395827361-9f9de58f12cc?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#091E3A]/95 via-[#091E3A]/70 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div>
                  <h3 className="text-[#48CAE4] text-xs font-bold uppercase tracking-widest mb-2">Status Operasional</h3>
                  <h2 className="text-3xl font-black text-white drop-shadow-md">Siap Menyambut Tamu! 🌊</h2>
                </div>
                <div className="mt-8">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Kedatangan Hari Ini</p>
                  <p className="text-5xl md:text-6xl font-black text-white">{dashboardStats.guestsToday} <span className="text-xl font-medium text-white/70">Orang</span></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] p-8 rounded-3xl overflow-hidden shadow-xl border border-white/10 relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#48CAE4]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div>
                  <h3 className="text-[#48CAE4] text-xs font-bold uppercase tracking-wider mb-2">Total Pendapatan</h3>
                  <p className="text-4xl font-black text-white tracking-tight">{formatRupiah(dashboardStats.revenue)}</p>
                </div>
                <button 
                  onClick={() => setActiveMenu('finance')} 
                  className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-xl transition-all border border-white/10 flex justify-between items-center px-5"
                >
                  <span>Buka Dompet</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-3 relative p-8 rounded-3xl overflow-hidden shadow-xl border border-white/20 group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0284C7]/95 via-[#0284C7]/60 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end h-full min-h-[160px] gap-6">
                <div>
                  <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2 drop-shadow-md">Kapasitas Fasilitas Vendor</h3>
                  <p className="text-4xl md:text-5xl font-black text-white drop-shadow-md">{assets.length} <span className="text-xl font-medium text-white/90">Aset Tersedia</span></p>
                </div>
                <button 
                  onClick={() => setActiveMenu('inventory')} 
                  className="px-8 py-4 bg-white text-[#0284C7] text-sm font-black uppercase tracking-wider rounded-xl shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                >
                  Kelola Inventaris
                </button>
              </div>
            </div>

          </div>
        )}

        {activeMenu === 'inventory' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#091E3A]">Daftar Fasilitas</h3>
              <button onClick={() => { setEditId(null); setFormData({ name: '', category: 'Villa', price: '', stock: '' }); setIsModalOpen(true); }} className="px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white text-sm font-semibold rounded-lg transition-all shadow-md">Tambah Aset</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-2 font-bold">Nama Item</th><th className="py-4 px-2 font-bold">Kategori</th><th className="py-4 px-2 font-bold">Harga Sewa</th><th className="py-4 px-2 font-bold text-center">Stok</th><th className="py-4 px-2 font-bold">Status</th><th className="py-4 px-2 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#1E293B]">
                  {assets.length === 0 ? (
                    <tr><td colSpan="6" className="py-10 text-center text-slate-400">Belum ada data fasilitas.</td></tr>
                  ) : (
                    assets.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100/50 hover:bg-slate-50/80 transition-all">
                        <td className="py-4 px-2">{item.name}</td>
                        <td className="py-4 px-2"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold">{item.category}</span></td>
                        <td className="py-4 px-2">{formatRupiah(item.price)}</td>
                        <td className="py-4 px-2 text-center">{item.stock}</td>
                        <td className="py-4 px-2"><span className={`px-3 py-1 rounded text-xs font-bold ${item.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{item.status}</span></td>
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
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#091E3A]">Jadwal Kedatangan Wisatawan</h3>
              <span className="text-xs font-semibold bg-blue-50 text-[#00B4D8] px-3 py-1 rounded-full">Real-time Schedule</span>
            </div>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="py-10 text-center text-slate-400">Belum ada jadwal pemesanan.</div>
              ) : (
                reservations.map((res) => {
                  const formattedDate = new Date(res.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                  return (
                    <div key={res.id} className="flex items-center justify-between p-4 border border-slate-100/50 rounded-lg hover:bg-slate-50 transition-all bg-white/50">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#F0F4F8] border-l-4 border-l-[#00B4D8] p-3 text-center rounded min-w-[100px]">
                          <p className="text-xs text-slate-400 font-bold uppercase">Tanggal</p>
                          <p className="text-sm font-bold text-[#091E3A]">{new Date(res.booking_date).getDate()}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#091E3A]">{res.customer_name}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Menyewa: <span className="font-semibold text-slate-700">{res.asset_name}</span> ({res.quantity} Unit)</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
                        </div>
                      </div>
                      <div>
                        {res.status === 'Pending' ? (
                          <button onClick={() => handleConfirmReservation(res.id)} className="px-4 py-2 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded text-xs font-bold transition-all shadow-md">Konfirmasi</button>
                        ) : (
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${res.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>{res.status}</span>
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
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-[#091E3A]">Validasi Tiket Pengunjung</h3>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">Kamera Aktif</span>
            </div>
            <div className="w-full max-w-md bg-[#091E3A] p-2 rounded-2xl shadow-2xl relative overflow-hidden">
              {scanMessage && (
                <div className={`absolute top-4 left-4 right-4 z-10 p-3 rounded-lg text-center text-sm font-bold shadow-lg transition-all ${scanMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                  {scanMessage.text}
                  <button onClick={() => setScanMessage(null)} className="block w-full mt-2 text-xs opacity-80 hover:opacity-100">Tutup</button>
                </div>
              )}
              <div className="rounded-xl overflow-hidden aspect-square border-4 border-slate-700 relative bg-black">
                 <Scanner onScan={(detectedCodes) => { if (detectedCodes && detectedCodes.length > 0) handleScanTicket(detectedCodes[0].rawValue); }} onError={(error) => console.log(error?.message)} />
              </div>
            </div>
          </div>
        )}
        
        {activeMenu === 'finance' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-[#091E3A] to-[#1A365D] rounded-xl shadow-xl p-8 text-white flex justify-between items-center">
              <div>
                <p className="text-[#48CAE4] text-xs font-bold uppercase tracking-wider mb-2">Total Saldo Tersedia</p>
                <h3 className="text-4xl md:text-5xl font-black">{formatRupiah(financeData.balance)}</h3>
              </div>
              <button onClick={handleWithdraw} className="px-6 py-3.5 bg-[#00B4D8] hover:bg-[#48CAE4] text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95">
                Cairkan Dana
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 p-6">
              <h3 className="text-lg font-bold text-[#091E3A] mb-6">Riwayat Transaksi</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-2 font-bold w-48">Tanggal</th>
                      <th className="py-4 px-2 font-bold">Deskripsi</th>
                      <th className="py-4 px-2 font-bold text-center">Tipe</th>
                      <th className="py-4 px-2 font-bold text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-[#1E293B]">
                    {financeData.transactions.length === 0 ? (
                      <tr><td colSpan="4" className="py-10 text-center text-slate-400">Belum ada aktivitas transaksi.</td></tr>
                    ) : (
                      financeData.transactions.map((t) => {
                        const dateObj = new Date(t.date);
                        const dateStr = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
                        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                        const isIncome = t.type === 'Pemasukan';

                        return (
                          <tr key={t.id} className="border-b border-slate-100/50 hover:bg-slate-50/80 transition-all bg-white/50">
                            <td className="py-4 px-2 text-slate-500">{dateStr} <span className="text-xs">({timeStr})</span></td>
                            <td className="py-4 px-2">{t.description}</td>
                            <td className="py-4 px-2 text-center">
                              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
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
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-100">
              
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 rounded-t-2xl">
                <h3 className="text-lg font-black text-[#0A2540]">{editId ? 'Edit Data Aset' : 'Tambah Aset Baru'}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-red-500 font-bold text-2xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {formData.image_url && (
                  <div className="w-full h-40 rounded-xl bg-cover bg-center border border-slate-200 shadow-inner" style={{ backgroundImage: `url('${formData.image_url}')` }}></div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">URL Foto Produk</label>
                  <input type="url" placeholder="Contoh: https://images.unsplash.com/..." value={formData.image_url || ''} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                  <p className="text-[10px] text-slate-400 mt-1">*Masukkan link gambar HD dari internet atau Unsplash</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Item</label>
                  <input type="text" required placeholder="Contoh: Kano Transparan" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi & Fasilitas</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="Contoh: Kapasitas 2 orang, durasi sewa 1 jam. Sudah termasuk 2 pelampung (life jacket) dan dayung..." 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] cursor-pointer focus:ring-1 focus:ring-[#0284C7]"
                    >
                      <option value="Villa">Villa / Homestay</option>
                      <option value="Perahu">Perahu Motor</option>
                      <option value="Alat">Wahana Air & Alat</option>
                      <option value="Kuliner">Kuliner Seafood</option>
                      <option value="Oleh-oleh">Oleh-oleh & Suvenir</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Stok (Unit)</label>
                    <input type="number" required min="0" placeholder="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga Sewa (Rp)</label>
                  <input type="number" required min="0" placeholder="Contoh: 150000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]" />
                </div>
                
                <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">{editId ? 'Update Aset' : 'Simpan Aset'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
    
