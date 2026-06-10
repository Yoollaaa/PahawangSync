import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    if (location.state?.cart) return location.state.cart;
    const savedCart = localStorage.getItem('phw_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [totalPrice, setTotalPrice] = useState(() => {
    if (location.state?.totalPrice) return location.state.totalPrice;
    const savedPrice = localStorage.getItem('phw_total');
    return savedPrice ? Number(savedPrice) : 0;
  });

  const [date, setDate] = useState(() => localStorage.getItem('phw_date') || '');
  const [user, setUser] = useState(null);
  
  const autoPayLock = useRef(false);

  const hariIni = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('phw_cart', JSON.stringify(cart));
      localStorage.setItem('phw_total', totalPrice);
    }
    if (date) localStorage.setItem('phw_date', date);
  }, [cart, totalPrice, date]);

  const urlParams = new URLSearchParams(window.location.search);
  const paramStatus = urlParams.get('status');
  const paramMidtrans = urlParams.get('transaction_status');
  const orderIdMidtrans = urlParams.get('order_id');
  const isPaymentSuccess = paramStatus === 'success' || paramMidtrans === 'settlement' || paramMidtrans === 'capture';

  const [isSuccess, setIsSuccess] = useState(isPaymentSuccess);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [fallbackId] = useState("PHW-" + Date.now());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else setUser(JSON.parse(userData));

    if (cart.length === 0 && !isSuccess) navigate('/dashboard');

    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = "Mid-client-G7pClpk5aTmeFySZ"; 
    let script = document.querySelector(`script[src="${snapScript}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = snapScript;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [navigate, cart.length, isSuccess]);

  const handlePayment = useCallback(async () => {
    if (!date) {
      alert("Mohon pilih tanggal Reservasi terlebih dahulu!");
      return;
    }

    try {
      setIsLoading(true);
      const currentOrderId = "PHW-" + Date.now();
      setTicketId(currentOrderId);

      const response = await axios.post('http://localhost:5000/api/tokenize', {
        gross_amount: totalPrice, 
        order_id: currentOrderId,
        cart: cart,
        booking_date: date
      });

      setIsLoading(false);

      if (!response.data || !response.data.token) {
        alert("Gagal mendapatkan token transaksi dari server!");
        return;
      }

      if (!window.snap) {
        alert("Sistem keamanan Midtrans sedang memuat, mohon tunggu beberapa detik dan klik bayar lagi.");
        return;
      }

      window.snap.pay(response.data.token, {
        onSuccess: function() {
          setIsSuccess(true);
          window.history.replaceState(null, '', `?status=success&ticket=${currentOrderId}`);
        },
        onPending: function() { 
          navigate('/dashboard', { state: { openPayment: true } }); 
        },
        onError: function() { 
          alert("Pembayaran gagal diproses!"); 
          navigate('/dashboard', { state: { openPayment: true } }); 
        },
        onClose: function() { 
          navigate('/dashboard', { state: { openPayment: true } }); 
        }
      });

    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error); 
      } else {
          console.error(error);
          alert("Gagal tersambung ke server pembayaran Midtrans!");
      }
    }
  }, [date, totalPrice, cart, navigate]); 

  useEffect(() => {
    if (location.state?.autoPay && date && !isSuccess && !autoPayLock.current) {
      autoPayLock.current = true; 
      
      console.log("Auto-Pay aktif! Menunggu Midtrans siap...");
      
      const checkMidtrans = setInterval(() => {
        if (window.snap) {
          console.log("Midtrans siap! Membuka pop-up pembayaran otomatis...");
          clearInterval(checkMidtrans); 
          handlePayment(); 
        }
      }, 500);

      setTimeout(() => clearInterval(checkMidtrans), 10000); 
    }
  }, [location.state?.autoPay, date, isSuccess, handlePayment]);

  useEffect(() => {
    const saveOrderToDatabase = async () => {
      if (isSuccess && user && cart.length > 0) {
        const currentOrderId = orderIdMidtrans || ticketId || fallbackId;
        
        if (!localStorage.getItem(`saved_db_${currentOrderId}`)) {
          console.log("Menyelamatkan tiket ke database...");
          
          try {
            await Promise.all(cart.map(item => 
              axios.post('http://localhost:5000/api/reservations', {
                asset_id: item.id,
                customer_name: user.name,
                customer_email: user.email,
                booking_date: date,
                quantity: item.quantity,
                total_price: item.price * item.quantity,
                order_id: currentOrderId 
              })
            ));
            
            localStorage.setItem(`saved_db_${currentOrderId}`, 'true');
            console.log("Tiket berhasil diamankan ke database!");
          } catch (error) {
            console.error("Gagal simpan ke database:", error);
          }
        }
      }
    };
    
    saveOrderToDatabase();
  }, [isSuccess]);

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const handleGoHome = () => {
    localStorage.removeItem('phw_cart');
    localStorage.removeItem('phw_total');
    localStorage.removeItem('phw_date');
    navigate('/dashboard');
  };

  if (!user) return null;

  if (isSuccess) {
    const finalTicketId = ticketId || urlParams.get('ticket') || orderIdMidtrans || fallbackId;
    return (
      <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl text-center border border-slate-100 overflow-hidden">
          <div className="bg-[#0A2540] p-8 text-white">
            <div className="w-16 h-16 bg-green-400/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-2xl font-black mb-1">Pembayaran Sukses!</h2>
            <p className="text-slate-300 text-sm font-medium">Ini adalah tiket digital kamu.</p>
          </div>
          <div className="p-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mb-6">
              <QRCodeSVG value={finalTicketId} size={180} bgColor={"#ffffff"} fgColor={"#0F172A"} level={"H"} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Reservasi</p>
            <p className="text-lg font-black text-[#0F172A] mb-8">{finalTicketId}</p>
            <div className="text-left bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-3"><span>Nama</span><span className="text-[#0F172A] text-right font-bold">{user.name}</span></div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-3"><span>Tanggal</span><span className="text-[#0F172A] text-right font-bold">{date || "-"}</span></div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase border-t border-slate-200 pt-3 mt-1"><span>Total</span><span className="text-[#0284C7] font-black">{formatRupiah(totalPrice)}</span></div>
            </div>
            <button onClick={handleGoHome} className="w-full py-4 rounded-full bg-[#0284C7] text-white font-bold hover:bg-[#0369A1] transition-all shadow-lg shadow-blue-500/30">Simpan & Ke Beranda</button>
            <p className="text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">Tunjukkan QR Code ini kepada petugas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0F172A] font-sans pt-28 pb-12">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 z-50">
        <button onClick={() => navigate('/dashboard', { state: { openPayment: true } })} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full font-bold hover:bg-slate-200">←</button>
        <h1 className="ml-4 font-bold text-lg">Checkout Wisata</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Detail Kontak & Jadwal</h3>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label><input type="text" readOnly value={user.name} className="w-full bg-slate-50 border-none rounded-xl p-4 mt-1 font-bold text-slate-500" /></div>
              <div><label className="text-xs font-bold text-[#0F172A] uppercase">Tanggal Reservasi</label><input type="date" min={hariIni} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-slate-200 rounded-xl p-4 mt-1 font-bold outline-[#0284C7]" /></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-xl font-bold mb-6">Ringkasan Biaya</h3>
            <div className="space-y-3 mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-medium"><span className="text-slate-500">{item.quantity}x {item.name}</span><span className="text-[#0F172A] font-bold">{formatRupiah(item.price * item.quantity)}</span></div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4 mb-8">
              <div className="flex justify-between items-center"><span className="font-bold text-slate-400 uppercase text-xs">Total Bayar</span><span className="text-2xl font-black text-[#0284C7]">{formatRupiah(totalPrice)}</span></div>
            </div>
            <button onClick={handlePayment} disabled={isLoading} className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-xl ${isLoading ? 'bg-slate-300' : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-blue-500/20'}`}>
              {isLoading ? 'Menghubungkan...' : 'Bayar Sekarang'}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">Secure Payment by Midtrans</p>
          </div>
        </div>
      </div>
    </div>
  );
}