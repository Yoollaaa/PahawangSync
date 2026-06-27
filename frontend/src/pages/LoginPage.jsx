import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLanding from '../assets/landingpage.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Mohon isi email dan password!');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/api/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      setIsLoading(false);
      
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Email atau password salah!');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      {/* Overlay Gelap agar background tidak menabrak form */}
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-0"></div>

      {/* Card Form - Gaya Glassmorphism Premium */}
      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[420px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 relative z-10 overflow-hidden">
        
        {/* Dekorasi Cahaya Halus di Pojok Card */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0284C7] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0EA5E9] rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

        {/* Tombol Kembali (Home) - Dipindah ke Kiri */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 text-slate-500 hover:text-[#0284C7] bg-white/60 p-2.5 rounded-full transition-all hover:bg-white hover:scale-110 shadow-sm border border-white/50"
          title="Kembali ke Beranda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>

        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center mb-8 mt-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl italic bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-lg shadow-[#0284C7]/40 mb-4 border border-white/20">
            E
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
            EcoLoka<span className="text-[#0284C7]"> Lampung</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium text-center">
            Mulai petualangan luar biasamu hari ini.
          </p>
        </div>

        {error && (
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs md:text-sm p-3 md:p-4 rounded-xl md:rounded-2xl mb-5 md:mb-6 font-bold text-center flex items-center justify-center gap-2 animate-pulse">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          
          {/* Input Email dengan Ikon */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              {/* Ikon Surat */}
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="cth: wisata@email.com" 
              />
            </div>
          </div>

          {/* Input Password dengan Ikon Kiri & Kanan */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1 mr-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                Password
              </label>
                  <Link 
                to="/forgot-password" 
                className="text-[11px] font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline transition-all"
              >
                Lupa Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              {/* Ikon Gembok */}
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-12 pr-12 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="Masukkan sandi rahasia" 
              />
              
              {/* Tombol Toggle Password (Intip) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 rounded-lg transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Tombol Login */}
          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-white text-sm md:text-base transition-all ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#0284C7] hover:to-[#0369A1] shadow-lg shadow-slate-900/20 md:hover:scale-[1.02] active:scale-95'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memeriksa...
              </span>
            ) : 'Masuk ke Akun'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center relative z-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Belum punya akun? <Link to="/register" className="text-[#0284C7] font-bold hover:underline transition-all">Daftar sekarang</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}