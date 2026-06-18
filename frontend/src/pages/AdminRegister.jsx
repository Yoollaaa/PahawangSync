import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminRegister() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminKey: '' });
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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FB] font-sans my-10">
      
      <div className="w-full max-w-md p-10 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#0F172A]">Daftar <span className="text-[#0284C7]">Admin</span></h2>
          <p className="text-slate-500 font-medium mt-2">Daftarkan akun pengelola PahawangSync baru</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] outline-none font-medium shadow-inner" 
              placeholder="Jihan Pengelola" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] outline-none font-medium shadow-inner" 
              placeholder="admin@pahawang.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0284C7] outline-none font-medium shadow-inner" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <div className="pt-3 border-t border-slate-100 mt-5">
            <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 ml-1">Secret Admin Key 🔑</label>
            <input 
              type="text" 
              onChange={(e) => setFormData({...formData, adminKey: e.target.value})} 
              className="w-full px-6 py-4 rounded-2xl bg-orange-50 border border-orange-200 focus:border-orange-500 outline-none font-bold text-orange-600 shadow-inner" 
              placeholder="Masukkan Kode Rahasia" 
              required 
            />
          </div>
          <button type="submit" className="w-full py-4.5 rounded-2xl bg-[#0284C7] text-white font-bold hover:bg-[#0369A1] transition-all shadow-lg shadow-blue-500/20 mt-6 text-base">
            Daftar Admin Baru
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-500 font-medium">
            Sudah punya akun? <Link to="/admin" className="text-[#0284C7] font-bold hover:underline">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}