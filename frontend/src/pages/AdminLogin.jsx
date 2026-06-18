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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FB] font-sans">
      
      <div className="w-full max-w-md p-10 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0284C7] rounded-[22px] flex items-center justify-center text-white font-bold text-3xl italic mx-auto mb-4 shadow-md shadow-blue-500/20">P</div>
          <h2 className="text-3xl font-black text-[#0F172A]">Admin <span className="text-[#0284C7]">Portal</span></h2>
          <p className="text-slate-500 font-medium mt-2">Masuk untuk mengelola PahawangSync</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Email Pengelola</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] focus:bg-white transition-all outline-none font-medium shadow-inner" 
              placeholder="admin@pahawang.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] focus:bg-white transition-all outline-none font-medium shadow-inner" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="w-full py-4.5 rounded-2xl bg-[#0F172A] text-white font-bold hover:bg-[#0284C7] transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 mt-6 text-base">
            Masuk Sekarang ➔
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-500 font-medium">
            Belum punya akun admin? <Link to="/admin/register" className="text-[#0284C7] font-bold hover:underline">Daftar di sini</Link>
          </p>
          <div className="mt-4">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 font-medium">← Kembali ke Halaman Utama</Link>
          </div>
        </div>
      </div>
    </div>
  );
}