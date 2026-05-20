import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Mohon isi semua kolom!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password, 
      role: 'wisatawan' 
    };

    const existingUsers = JSON.parse(localStorage.getItem('usersDB')) || [];
    
    if (existingUsers.some(user => user.email === newUser.email)) {
      setError('Email ini sudah terdaftar. Silakan gunakan email lain atau Login.');
      return;
    }

    existingUsers.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(existingUsers));

    alert('Pendaftaran Berhasil! Silakan Login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center font-bold text-xl italic bg-[#0284C7] text-white shadow-lg">
            P
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
            Pahawang<span className="text-[#0284C7]">Sync</span>
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-[#0F172A] mb-2 text-center">Buat Akun Baru</h2>
        <p className="text-slate-500 text-sm mb-8 text-center font-medium">Mulai petualanganmu di Pulau Pahawang.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all"
              placeholder="Febby Yolanda Putri"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Alamat Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Konfirmasi Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all"
              placeholder="Ketik ulang password"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 mt-4 rounded-full bg-[#0284C7] text-white font-bold hover:bg-[#0369A1] shadow-lg shadow-[#0284C7]/30 hover:scale-[1.02] transition-all"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Sudah punya akun? <Link to="/login" className="text-[#0284C7] font-bold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}