import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cart, totalPrice } = location.state || { cart: [], totalPrice: 0 };
  const [user, setUser] = useState(null);

  const [date, setDate] = useState('');
  const [pax, setPax] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }

    if (cart.length === 0 && !isSuccess) {
      navigate('/dashboard');
    }

    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; 
    const clientKey = "Mid-client-G7pClpk5aTmeFySZ"; 

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate, cart, isSuccess]);

  const handlePayment = async () => {
    if (!date) {
      alert("Mohon pilih tanggal keberangkatan terlebih dahulu!");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Meminta token ke server via Axios...");
      
      const finalPrice = totalPrice + 15000;

      const response = await axios.post('http://localhost:5000/api/tokenize', {
        gross_amount: finalPrice
      });
      
      setIsLoading(false);

      if (!response.data || !response.data.token) {
        alert("Gagal mendapatkan token transaksi!");
        return;
      }

      window.snap.pay(response.data.token, {
        onSuccess: function(result) {
          console.log('success', result);
          alert("Pembayaran Berhasil!");
          setIsSuccess(true);
        },
        onPending: function(result) {
          console.log('pending', result);
          alert("Menunggu pembayaran...");
        },
        onError: function(result) {
          console.log('error', result);
          alert("Pembayaran gagal!");
        },
        onClose: function() {
          alert('Kamu menutup pop-up sebelum menyelesaikan pembayaran.');
        }
      });

    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching token:", error);
      alert("Sistem sedang sibuk, gagal tersambung ke backend.");
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (!user) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mb-2">Pembayaran Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Tiket digital kamu sudah aktif dan siap digunakan.</p>
          
          <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
              <span>Metode Bayar</span>
              <span className="text-[#0F172A]">QRIS / E-Wallet</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Total Terbayar</span>
              <span className="text-[#0284C7]">{formatRupiah(totalPrice + 15000)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-full bg-[#0A2540] text-white font-bold hover:bg-[#1E293B] transition-all shadow-lg"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0F172A] font-sans pt-28 pb-12">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 z-50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full font-bold">←</button>
        <h1 className="ml-4 font-bold text-lg">Checkout Wisata</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Detail Kontak & Jadwal</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                <input type="text" readOnly value={user.name} className="w-full bg-slate-50 border-none rounded-xl p-4 mt-1 font-bold text-slate-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0F172A] uppercase">Tanggal Keberangkatan</label>
                <input type="date" onChange={(e) => setDate(e.target.value)} className="w-full border-slate-200 rounded-xl p-4 mt-1 font-bold outline-[#0284C7]" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-xl font-bold mb-6">Ringkasan Biaya</h3>
            <div className="space-y-3 mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">{item.quantity}x {item.name}</span>
                  <span className="text-[#0F172A] font-bold">{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Biaya Aplikasi</span>
                <span className="text-[#0F172A] font-bold">Rp 15.000</span>
              </div>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400 uppercase text-xs">Total Bayar</span>
                <span className="text-2xl font-black text-[#0284C7]">{formatRupiah(totalPrice + 15000)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isLoading}
              className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-xl ${
                isLoading ? 'bg-slate-300' : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-blue-500/20'
              }`}
            >
              {isLoading ? 'Menghubungkan...' : 'Bayar Sekarang'}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">Secure Payment by Midtrans</p>
          </div>
        </div>
      </div>
    </div>
  );
}