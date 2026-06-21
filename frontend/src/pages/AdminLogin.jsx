import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });
      
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminData', JSON.stringify(res.data.admin));
      
      alert("Login Admin Berhasil!");
      navigate('/dashboard-admin'); 
    } catch (err) {
      alert(err.response?.data?.error || "Login Gagal. Cek Email/Password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FB] font-sans px-4">
      
      <div className="w-full max-w-md p-6 md:p-10 bg-white rounded-3xl md:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        
        <div className="text-center mb-8 md:mb-10">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[#0284C7] rounded-[18px] md:rounded-[22px] flex items-center justify-center text-white font-bold text-2xl md:text-3xl italic mx-auto mb-4 shadow-md shadow-blue-500/20">
            P
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A]">
            Admin <span className="text-[#0284C7]">Portal</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-2">
            Masuk untuk mengelola PahawangSync
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Email Pengelola
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] focus:bg-white transition-all outline-none text-sm md:text-base font-medium shadow-inner" 
              placeholder="admin@pahawang.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] focus:bg-white transition-all outline-none text-sm md:text-base font-medium shadow-inner" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button type="submit" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-[#0F172A] text-white font-bold hover:bg-[#0284C7] transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 mt-6 text-sm md:text-base">
            Masuk Sekarang ➔
          </button>
        </form>

        <div className="mt-8 md:mt-10 text-center border-t border-slate-100 pt-6 md:pt-8">
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Belum punya akun admin? <Link to="/admin/register" className="text-[#0284C7] font-bold hover:underline">Daftar di sini</Link>
          </p>
          <div className="mt-4">
            <Link to="/" className="text-[10px] md:text-xs text-slate-400 hover:text-slate-600 font-medium">
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}