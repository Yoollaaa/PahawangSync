import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
    <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center p-4 md:p-6 font-sans">
      
      <div className="bg-white rounded-3xl md:rounded-[40px] w-full max-w-md p-6 md:p-10 shadow-2xl border border-slate-100 my-8">
        
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-10">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-[14px] flex items-center justify-center font-bold text-lg md:text-xl italic bg-[#0284C7] text-white shadow-lg">P</div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#0F172A]">Pahawang<span className="text-[#0284C7]">Sync</span></h1>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-1 md:mb-2 text-center">Buat Akun Baru</h2>
        <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 text-center font-medium">Mulai petualanganmu di Pulau Pahawang.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm p-3 md:p-4 rounded-xl md:rounded-2xl mb-5 md:mb-6 font-medium text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
          <div>
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 md:mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" 
              placeholder="Febby Yolanda Putri" 
            />
          </div>
          <div>
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 md:mb-2">Alamat Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" 
              placeholder="nama@gmail.com" 
            />
          </div>
          <div>
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 md:mb-2">Nomor Telepon (WhatsApp)</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" 
              placeholder="Contoh: 081234567890" 
            />
          </div>
          <div>
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 md:mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" 
              placeholder="Minimal 6 karakter" 
            />
          </div>
          <div>
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 md:mb-2">Konfirmasi Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" 
              placeholder="Ketik ulang password" 
            />
          </div>
          
          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full py-3.5 md:py-4 mt-2 md:mt-4 rounded-full font-bold text-white text-sm md:text-base transition-all ${isLoading ? 'bg-slate-400' : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-lg shadow-[#0284C7]/30 active:scale-95 md:hover:scale-[1.02]'}`}
          >
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs md:text-sm font-medium text-slate-500 mt-6 md:mt-8">
          Sudah punya akun? <Link to="/login" className="text-[#0284C7] font-bold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}