import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLanding from '../assets/landingpage.jpeg';

export default function AdminRegister() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminKey: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.adminKey !== 'PAHAWANG2026') {
      alert("Secret Admin Key Salah! Anda tidak diizinkan mendaftar.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/admin/register', formData);
      alert("Registrasi Admin Berhasil! Silakan Login.");
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.error || "Registrasi Gagal. Email mungkin sudah digunakan.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-0"></div>

      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[420px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 relative z-10 overflow-hidden my-4">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0284C7] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl italic bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-lg shadow-[#0284C7]/40 mb-4 border border-white/20 mx-auto">
            E
          </div>
          <h2 className="text-2xl font-black text-[#0F172A]">Daftar <span className="text-[#0284C7]">Admin</span></h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Daftarkan pengelola sistem EcoLoka</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 px-4 text-sm font-medium text-[#0F172A] outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
              placeholder="Jihan Pengelola" 
              required 
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Email</label>
            <input 
              type="email" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 px-4 text-sm font-medium text-[#0F172A] outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
              placeholder="admin@pahawang.com" 
              required 
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 px-4 pr-12 text-sm font-medium text-[#0F172A] outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
                placeholder="••••••••" 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-[#0284C7]">
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 mt-2">
            <label className="text-[11px] font-bold text-orange-600 uppercase tracking-widest block mb-2 ml-1">Secret Admin Key 🔑</label>
            <input 
              type="password" 
              onChange={(e) => setFormData({...formData, adminKey: e.target.value})} 
              className="w-full bg-orange-50/50 border border-orange-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-orange-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" 
              placeholder="Masukkan Kode Rahasia" 
              required 
            />
          </div>
          
          <button type="submit" className="w-full py-4 mt-4 rounded-2xl bg-[#0F172A] text-white font-bold hover:bg-[#0284C7] transition-all shadow-lg active:scale-95 text-sm">
            Daftar Admin Baru ➔
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center relative z-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Sudah punya akun? <Link to="/admin" className="text-[#0284C7] font-bold hover:underline">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}