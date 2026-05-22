import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (activeMenu === 'inventory') fetchAssets();
    else if (activeMenu === 'calendar') fetchReservations();
    else if (activeMenu === 'finance') fetchFinance();
  }, [activeMenu]);

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({ name: item.name, category: item.category, price: item.price, stock: item.stock });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', category: 'Villa', price: '', stock: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: formData.name, category: formData.category, price: Number(formData.price), stock: Number(formData.stock) };
    try {
      const url = editId ? `http://localhost:5000/api/assets/${editId}` : 'http://localhost:5000/api/assets';
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) { closeModal(); fetchAssets(); }
    } catch (e) { console.error(e); }
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
        const response = await fetch(`http://localhost:5000/api/reservations/${text}/complete`, { method: 'PUT' });
        if (response.ok) {
          setScanMessage({ type: 'success', text: `Berhasil! Tiket #${text} telah digunakan.` });
          fetchReservations();
        } else {
          setScanMessage({ type: 'error', text: `Gagal. Tiket #${text} tidak ditemukan.` });
        }
      } catch (e) { console.error(e); }
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
    <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] font-sans flex relative">
      
      <aside className="w-64 bg-[#091E3A] text-slate-300 flex flex-col z-10 shadow-2xl fixed h-full">
        <div className="p-6 pb-4 border-b border-[#1A365D]">
          <h1 className="text-2xl font-black text-white">Pahawang<span className="text-[#00B4D8]">Sync</span></h1>
          <span className="inline-block mt-2 px-2 py-1 bg-[#1A365D] text-[#48CAE4] text-[10px] font-bold rounded uppercase tracking-widest">Panel Vendor</span>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeMenu === 'dashboard' ? 'bg-[#00B4D8] text-white shadow-md' : 'hover:bg-[#1A365D] text-slate-400 hover:text-white'}`}>Dashboard</button>
          <button onClick={() => setActiveMenu('inventory')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeMenu === 'inventory' ? 'bg-[#00B4D8] text-white shadow-md' : 'hover:bg-[#1A365D] text-slate-400 hover:text-white'}`}>Data Aset</button>
          <button onClick={() => setActiveMenu('calendar')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeMenu === 'calendar' ? 'bg-[#00B4D8] text-white shadow-md' : 'hover:bg-[#1A365D] text-slate-400 hover:text-white'}`}>Kalender Reservasi</button>
          <button onClick={() => setActiveMenu('scanner')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeMenu === 'scanner' ? 'bg-[#00B4D8] text-white shadow-md' : 'hover:bg-[#1A365D] text-slate-400 hover:text-white'}`}>Scanner Tiket</button>
          <button onClick={() => setActiveMenu('finance')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeMenu === 'finance' ? 'bg-[#00B4D8] text-white shadow-md' : 'hover:bg-[#1A365D] text-slate-400 hover:text-white'}`}>Finansial</button>
        </nav>

        <div className="p-4 border-t border-[#1A365D]">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-all">Keluar</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto ml-64">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#091E3A]">
              {activeMenu === 'dashboard' && 'Ringkasan Operasional'}
              {activeMenu === 'inventory' && 'Manajemen Aset & Stok'}
              {activeMenu === 'calendar' && 'Kalender Kedatangan'}
              {activeMenu === 'scanner' && 'Scan Kedatangan'}
              {activeMenu === 'finance' && 'Dompet Keuangan'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              {activeMenu === 'dashboard' && 'Pantau performa dan ringkasan data hari ini.'}
              {activeMenu === 'inventory' && 'Kelola ketersediaan fasilitas dan harga sewa.'}
              {activeMenu === 'calendar' && 'Pantau jadwal kedatangan tamu dan reservasi.'}
              {activeMenu === 'scanner' && 'Validasi QR Code dari tiket wisatawan.'}
              {activeMenu === 'finance' && 'Pantau pendapatan riil dan cairkan dana.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-[#091E3A]">Jihan Vendor</p>
              <p className="text-xs text-slate-400 font-medium">Administrator</p>
            </div>
            <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center text-[#00B4D8] font-black text-xl">J</div>
          </div>
        </header>

        {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#00B4D8]">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pendapatan</h3>
              <p className="text-3xl font-bold text-[#091E3A]">Rp 0</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#00B4D8]">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tamu Hari Ini</h3>
              <p className="text-3xl font-bold text-[#091E3A]">0 <span className="text-sm font-medium text-slate-400">Orang</span></p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#00B4D8]">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Aset Aktif</h3>
              <p className="text-3xl font-bold text-[#091E3A]">{assets.length} <span className="text-sm font-medium text-slate-400">Item</span></p>
            </div>
          </div>
        )}

        {activeMenu === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#091E3A]">Daftar Fasilitas</h3>
              <button onClick={() => { setEditId(null); setFormData({ name: '', category: 'Villa', price: '', stock: '' }); setIsModalOpen(true); }} className="px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white text-sm font-semibold rounded-lg transition-all shadow-md">Tambah Aset</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-4 px-2 font-bold">Nama Item</th><th className="py-4 px-2 font-bold">Kategori</th><th className="py-4 px-2 font-bold">Harga Sewa</th><th className="py-4 px-2 font-bold text-center">Stok</th><th className="py-4 px-2 font-bold">Status</th><th className="py-4 px-2 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#1E293B]">
                  {assets.length === 0 ? (
                    <tr><td colSpan="6" className="py-10 text-center text-slate-400">Belum ada data fasilitas.</td></tr>
                  ) : (
                    assets.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                    <div key={res.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
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
              <div className="rounded-xl overflow-hidden aspect-square border-4 border-slate-700 relative">
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-[#091E3A] mb-6">Riwayat Transaksi</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
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
                          <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091E3A]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all">
            <h3 className="text-xl font-bold text-[#091E3A] mb-4 border-b border-slate-100 pb-3">{editId ? 'Edit Data Aset' : 'Tambah Aset Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Item</label>
                <input type="text" required placeholder="Contoh: Kano Transparan" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#00B4D8]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#00B4D8] cursor-pointer">
                    <option value="Villa">Villa / Homestay</option><option value="Perahu">Perahu Motor</option><option value="Alat">Alat Snorkeling</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Stok (Unit)</label>
                  <input type="number" required min="0" placeholder="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#00B4D8]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Harga Sewa (Rp)</label>
                <input type="number" required min="0" placeholder="Contoh: 150000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-sm font-medium focus:outline-none focus:border-[#00B4D8]" />
              </div>
              <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition-all">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#091E3A] hover:bg-[#1A365D] text-white font-semibold rounded-lg transition-all shadow-md">{editId ? 'Update Aset' : 'Simpan Aset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}