import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center font-bold text-xl italic bg-[#0284C7] text-white shadow-lg">P</div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">Pahawang<span className="text-[#0284C7]">Sync</span></h1>
        </div>

        <h2 className="text-2xl font-bold text-[#0F172A] mb-2 text-center">Selamat Datang Kembali</h2>
        <p className="text-slate-500 text-sm mb-8 text-center font-medium">Masuk untuk melanjutkan petualanganmu.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl mb-6 font-medium">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Alamat Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" placeholder="nama@email.com" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all" placeholder="Masukkan passwordmu" />
          </div>
          
          <button disabled={isLoading} type="submit" className={`w-full py-4 mt-4 rounded-full font-bold text-white transition-all ${isLoading ? 'bg-slate-400' : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-lg shadow-[#0284C7]/30 hover:scale-[1.02]'}`}>
            {isLoading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Belum punya akun? <Link to="/register" className="text-[#0284C7] font-bold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}