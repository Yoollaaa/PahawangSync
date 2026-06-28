import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLanding from '../assets/landingpage.jpeg'; 
export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });
      
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminData', JSON.stringify(res.data.admin));
      
      alert("Login Admin Berhasil!");
      navigate('/dashboard-admin'); 
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.error || "Login Gagal. Cek Email/Password.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-0"></div>

      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[420px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 relative z-10 overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0284C7] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>

        <Link 
          to="/" 
          className="absolute top-6 left-6 text-slate-500 hover:text-[#0284C7] bg-white/60 p-2.5 rounded-full transition-all hover:bg-white hover:scale-110 shadow-sm border border-white/50 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>

        <div className="text-center mb-8 mt-2 relative z-10">
         <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl italic bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-lg shadow-[#0284C7]/40 mb-4 border border-white/20 mx-auto">
            E
          </div>
          <h2 className="text-2xl font-black text-[#0F172A]">
            Admin <span className="text-[#0284C7]">Portal</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Kelola operasional EcoLoka Lampung
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Email Pengelola</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm md:text-base font-medium text-[#0F172A] outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
                placeholder="admin@ecoloka.com" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Password</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-12 pr-12 text-sm md:text-base font-medium text-[#0F172A] outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
                placeholder="••••••••" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg transition-colors"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-2 rounded-2xl bg-[#0F172A] text-white font-bold hover:bg-[#0284C7] transition-all shadow-lg active:scale-95 text-sm md:text-base"
          >
            {isLoading ? "Memproses..." : "Masuk ke Portal Admin ➔"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center relative z-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Belum punya akun admin? <Link to="/admin/register" className="text-[#0284C7] font-bold hover:underline transition-all">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}