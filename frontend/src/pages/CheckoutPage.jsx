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

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F4F8FB] flex flex-col items-center justify-center p-4 md:p-6 font-sans print:bg-white print:p-0">
        
        <div id="ticket-container" className="bg-white rounded-3xl md:rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 relative print:shadow-none print:border-slate-300 print:max-w-full">
          
          <div className="bg-gradient-to-r from-[#0F172A] to-[#0284C7] p-6 md:p-8 text-center text-white relative print:break-inside-avoid">
            <div className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#E0F2FE] rounded-full print:bg-white"></div>
            <div className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#E0F2FE] rounded-full print:bg-white"></div>
            
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-400/20 text-emerald-400 border-2 border-emerald-400 rounded-full flex items-center justify-center text-2xl md:text-3xl mx-auto mb-3 md:mb-4 shadow-lg">✓</div>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 mb-1">Pahawang E-Ticket</p>
            <h2 className="text-xl md:text-2xl font-black mb-1">Pembayaran Sukses!</h2>
          </div>

          <div className="p-6 md:p-8 bg-white flex flex-col items-center relative print:break-inside-avoid">
            <div className="p-3 md:p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl shadow-sm">
              <QRCodeSVG value={`PHW-TICKET-${finalTicketId}-${user.name}`} size={160} bgColor={"#ffffff"} fgColor={"#0F172A"} level={"H"} />
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-400 mt-4 font-bold tracking-[0.2em] uppercase text-center break-all">ID: {finalTicketId}</p>
          </div>

          <div className="relative h-px flex items-center justify-center bg-white print:break-inside-avoid">
            <div className="absolute inset-x-6 border-t-2 border-dashed border-slate-200"></div>
            <div className="absolute -left-3 md:-left-4 w-6 h-6 md:w-8 md:h-8 bg-[#E0F2FE] rounded-full border-r border-slate-100 print:bg-white"></div>
            <div className="absolute -right-3 md:-right-4 w-6 h-6 md:w-8 md:h-8 bg-[#E0F2FE] rounded-full border-l border-slate-100 print:bg-white"></div>
          </div>

          <div className="p-6 md:p-8 bg-slate-50 print:bg-white print:break-inside-avoid">
            <div className="grid grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4 mb-5 md:mb-6">
              <div>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Pemesan</p>
                <p className="text-xs md:text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keberangkatan</p>
                <p className="text-xs md:text-sm font-bold text-[#0F172A]">
                  {date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                </p>
              </div>
            </div>

            <div className="mb-5 md:mb-6 border-t border-slate-200 pt-4 md:pt-5">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">Item Dipesan</p>
              {cart && cart.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs md:text-sm">
                      <span className="font-bold text-[#0F172A] flex-1 pr-4">{item.quantity}x {item.name}</span>
                      <span className="text-slate-500 font-medium text-right whitespace-nowrap">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm font-bold text-[#0F172A]">Tiket & Layanan Wisata Pahawang</p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 pt-4 md:pt-5 mt-2">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-lg md:text-xl font-black text-[#0284C7]">{formatRupiah(totalPrice)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-md no-print">
          <button onClick={handlePrint} className="flex-1 py-3.5 md:py-4 rounded-full bg-white border border-slate-200 text-[#0F172A] text-sm md:text-base font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Simpan PDF
          </button>
          <button onClick={handleGoHome} className="flex-1 py-3.5 md:py-4 rounded-full bg-[#0284C7] text-white text-sm md:text-base font-bold hover:bg-[#0369A1] transition-all shadow-lg shadow-blue-500/30">
            Selesai & Beranda
          </button>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; margin: 0; padding: 20px; }
            nav, footer, .no-print { display: none !important; }
            #ticket-container { box-shadow: none !important; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0F172A] font-sans pt-24 md:pt-28 pb-10 md:pb-12">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 md:h-20 flex items-center px-4 md:px-6 z-50">
        <button onClick={() => navigate('/dashboard', { state: { openPayment: true } })} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 rounded-full font-bold hover:bg-slate-200 transition-all text-sm md:text-base">←</button>
        <h1 className="ml-3 md:ml-4 font-bold text-base md:text-lg">Checkout Wisata</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Detail Kontak & Jadwal</h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                <input type="text" readOnly value={user.name} className="w-full bg-slate-50 border-none rounded-xl p-3 md:p-4 mt-1 font-bold text-slate-500 text-sm md:text-base" />
              </div>
              <div>
                <label className="text-[10px] md:text-xs font-bold text-[#0F172A] uppercase">Tanggal Reservasi</label>
                <input type="date" min={hariIni} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-slate-200 rounded-xl p-3 md:p-4 mt-1 font-bold outline-[#0284C7] text-sm md:text-base bg-white border" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm sticky top-24 md:top-28">
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Ringkasan Biaya</h3>
            <div className="space-y-2 md:space-y-3 mb-5 md:mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-xs md:text-sm font-medium">
                  <span className="text-slate-500 pr-2">{item.quantity}x {item.name}</span>
                  <span className="text-[#0F172A] font-bold whitespace-nowrap">{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4 mb-6 md:mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400 uppercase text-[10px] md:text-xs">Total Bayar</span>
                <span className="text-xl md:text-2xl font-black text-[#0284C7]">{formatRupiah(totalPrice)}</span>
              </div>
            </div>
            <button onClick={handlePayment} disabled={isLoading} className={`w-full py-3.5 md:py-4 rounded-full font-bold text-white text-sm md:text-base transition-all shadow-xl ${isLoading ? 'bg-slate-300' : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-blue-500/20 active:scale-95'}`}>
              {isLoading ? 'Menghubungkan...' : 'Bayar Sekarang'}
            </button>
            <p className="text-[9px] md:text-[10px] text-center text-slate-400 mt-3 md:mt-4 font-medium uppercase tracking-widest">Secure Payment by Midtrans</p>
          </div>
        </div>
      </div>
    </div>
  );
}