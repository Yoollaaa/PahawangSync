import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLanding from '../assets/landingpage.jpeg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Mohon isi semua kolom!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('http://localhost:5000/api/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'wisatawan'
      });

      setIsLoading(false);
      alert('Pendaftaran Berhasil! Silakan Login.');
      navigate('/login');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-0"></div>
      
      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[460px] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 relative z-10 overflow-hidden my-4">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0284C7] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0EA5E9] rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

        <Link 
          to="/" 
          className="absolute top-6 left-6 text-slate-500 hover:text-[#0284C7] bg-white/60 p-2.5 rounded-full transition-all hover:bg-white hover:scale-110 shadow-sm border border-white/50 z-20"
          title="Kembali ke Beranda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>

        <div className="flex flex-col items-center justify-center mb-6 mt-4 md:mt-2 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg italic bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-md">
              E
            </div>
            <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
              EcoLoka<span className="text-[#0284C7]"> Lampung</span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mt-1">Buat Akun Baru</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium text-center">
            Mulai petualanganmu menyusuri alam Lampung hari ini.
          </p>
        </div>

        {error && (
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs md:text-sm p-3 rounded-xl mb-5 font-bold text-center flex items-center justify-center gap-2 animate-pulse relative z-10">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          
          <div>
            <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Nama Lengkap</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="Febby Yolanda Putri" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Alamat Email</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="nama@gmail.com" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="Contoh: 081234567890" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3 pl-10 pr-10 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                  placeholder="Min. 6 Karakter" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Konfirmasi</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3 pl-10 pr-10 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                  placeholder="Ulangi Sandi" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full py-3.5 md:py-4 mt-4 rounded-2xl font-bold text-white text-sm md:text-base transition-all ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#0284C7] hover:to-[#0369A1] shadow-lg shadow-slate-900/20 md:hover:scale-[1.01] active:scale-95'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses Pendaftaran...
              </span>
            ) : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200/50 text-center relative z-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Sudah punya akun? <Link to="/login" className="text-[#0284C7] font-bold hover:text-[#0369A1] hover:underline transition-all">Masuk di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}